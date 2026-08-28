# PermitBench Harness Architecture

> Architecture goal：让强模型负责 intelligence，让应用负责 truth、authority 与 proof。  
> P0 target：Challenge-supported ChatGPT Desktop / Chrome 149 WebMCP path。

## 1. Executive architecture

```text
Human ─────────────────────────────┐
  │ sees / edits / approves / undo │
  ▼                                │
React PermitBench UI               │
  │ same domain state              │
  ▼                                │
Application domain service ◄───────┘
  ├─ authoritative workspace state
  ├─ branch isolation
  ├─ deterministic simulator
  ├─ transactions + version/idempotency
  ├─ policy enforcement
  └─ verification + receipts
  ▲
  │ phase-scoped tool handlers
document.modelContext registry
  ▲
  │ discover / call semantic tools
ChatGPT WebMCP client / Agent
```

Human 与 Agent 不共享一段 prompt；他们共享的是同一个 versioned workspace。UI action 和 WebMCP tool call 进入同一 domain service，得到同一种 state transition、validation 与 audit event。

## 2. Responsibility split

| Layer | Owns | Must not own |
|---|---|---|
| Model / Agent | task understanding、候选 policy、trade-off explanation、tool selection | authority、approval、business truth、self-verification |
| WebMCP registry | semantic discovery、phase-scoped availability、tool invocation、cancel signal | RBAC、transaction、exactly-once、安全保证 |
| Domain service | stable IDs、state transitions、branch/preview/commit、invariants、enforcement | free-form reasoning |
| Simulator | positive/negative test oracle、coverage、evidence | policy recommendation 的自然语言偏好 |
| Human | edit、select、approve/reject、interrupt、undo | 手工核对每个底层 DOM 或重建 audit |
| Storage | current truth、versions、receipts、idempotency ledger | conversational memory |
| UI | visible state、diff、progress、errors、receipts | 另一套业务逻辑 |

## 3. Runtime loop

```text
Model
  ↓ discovers only current-phase tools
Compact state projection
  ↓ IDs + constraints + versions, not full dump
Reason / propose
  ↓
Semantic tool call
  ↓ schema + role + phase + version validation
Domain transition / deterministic simulation
  ↓
Visible UI update + audit event
  ↓
Structured verification
  ↓
continue / wait for Human / stop / recover
```

每个 authoritative write 在执行前重新读取 current workspace/policy。Agent conversation 中的旧版本只用于提示，永不成为授权事实。

## 4. Dynamic Tool Scope

### 4.1 State machine

```text
RESET
  ↓
EXPLORE
  tools: summary / create branch / simulate / compare
  ↓ Human selects branch
REVIEW
  tools: summary / compare / preview
  ↓ Human approves exact preview
APPROVED
  tools: summary / refresh preview / commit
  ↓ commit succeeds
EXECUTION
  tools: summary + only active-policy business tools + verify
  ↓ verify / finish
POST_COMMIT
  tools: summary / verify
  └─ Human arms undo → temporary undo tool → REVIEW/RESET-like state
```

### 4.2 Implementation

-每个 phase 有自己的 `AbortController`；
- phase exit 调用 `abort()` 注销该组 tools；
- phase enter 注册新组；
- `document.modelContext.getTools()` 驱动 Tool Surface Inspector；
- `toolchange` 是客户端发现变化的基础，但不能假设其 UI/延迟完全稳定；
-不在 tool execution 中间快速切换 phase；authoritative transaction 完成后再切换；
-所有 handlers 自行检查 phase/policy，即使客户端保留 stale tool handle 也 fail closed。

### 4.3 Why it helps

- explore 阶段根本没有 commit/refund tool，降低 accidental write；
- approval 后 proposal tools 消失，Agent 不会继续修改已审核对象；
- active policy 直接决定 business tool surface，Human 可看到 authority 的变化；
- tool schemas 更少，减少 upfront context 与错误选择。

“降低多少 tokens/误调用”是 **Hypothesis**，需要 `EVALUATION_PLAN.md` 自测；不写虚构百分比。

### 4.4 WebMCP scope vs Responses tool search

两者不能混称：

| Mechanism | Where | What it does | P0 use |
|---|---|---|---|
| WebMCP register/unregister | 当前网页 | 改变浏览器 Agent 可发现的 page tools | Core |
| Responses `tool_search` / `defer_loading` | OpenAI API request | 延迟加载 function/namespace/MCP schemas | Evaluation/P2 only |

官方未确认 Responses tool search/PTC 会自动桥接页面 WebMCP registry，因此 P0 不依赖这条未知连接。

## 5. Compact State Projection

### 5.1 Why not full dump

GPT-5.6 有长上下文也不意味着应反复发送全部 workspace。大 dump 会：

- 混合 authoritative current state 与 historical/stale records；
-增加 token、延迟与 tool-selection noise；
-使 Agent 用自然语言猜 version/branch；
-放大 ticket text 等 untrusted content 的影响；
-让 compare 与 verify 缺乏 stable evidence references。

### 5.2 P0 projection

`get_workspace_summary` 返回：

- workspace ID、phase、current version；
-一条 compact task goal；
- positive/negative test IDs 与 counts；
- constraint IDs + one-line summaries；
- branch IDs、revisions、simulation eligibility；
- active policy ID + capability IDs；
-实际 current tool surface；
-可选 `changed_since(version)` delta。

不返回：完整 audit log、完整 customer record、所有 test evidence、未请求的 branch manifests、provider docs。

### 5.3 Read patterns

| Agent need | Projection |
|---|---|
| 首次理解 | `get_workspace_summary(include=[task,constraints,active_policy,tool_surface])` |
| write conflict 后恢复 | `get_workspace_summary(since_version=old)` |
| 看候选结果 | `compare_policy_branches` |
| 看 exact write | `preview_policy_activation` output |
| 看结果 | `verify_task_outcome` receipt |

P1 只有 eval 证明 summary 过大时，才拆出 `get_branch_summary` / `get_unresolved_conflicts`；P0 不为理论上的长 workspace 增加工具数量。

## 6. Authoritative State

### 6.1 Storage choice

P0 使用 IndexedDB（Dexie）而不是服务器：

-网页 refresh 后仍可恢复；
-本地 atomic transaction；
-无 API key、auth、network outage；
-适合一个公开 sandbox workspace；
-可导出 JSON trace 供评测。

明确边界：它不是跨设备、多用户或生产 IAM database。商业 P2 才迁移 Postgres/Supabase，并保持 domain interface 不变。

### 6.2 Stores

```text
workspace          current phase/version/active policy
task_packs         seeded immutable test packs
capabilities       seeded catalog + schema
constraints        deterministic predicates
branches           isolated manifests/revisions
simulations        immutable derived results
previews           immutable candidate transactions
approvals          human-only records
policy_versions    append-only active history
refunds            sandbox business ledger
verifications      structured checks
receipts           immutable proof records
audit_events       monotonic sequence
idempotency        request hash → response/created IDs
```

### 6.3 Version discipline

- Authority-changing or proposal-edit transitions increment `workspace.version`；
- derived reads/simulations do not, but bind to source revision/hash；
- preview binds workspace version + branch revision + catalog/task versions；
- commit compares all bindings again；
- audit sequence is monotonic and separate from state version；
- UI optimistic animation only starts after domain transaction success。

## 7. Branch Isolation

Branches are application objects, not OpenAI multi-agent state and not Git worktrees.

```text
Workspace v12
  ├─ br_strict @ r1     → sim A
  ├─ br_balanced @ r1   → sim B
  └─ br_broad @ r1      → sim C

Only: br_balanced @ r1
  → Preview P(hash, v15)
  → Human Approval(P.hash)
  → PolicyVersion v16
```

Rules：

- immutable base + copy-on-write manifest；
- branch authors can only mutate own proposal in P1 multi-agent mode；
- simulations bind revision；edit invalidates result；
- compare requires same task/catalog baseline；
- no automatic field merge into authority；
- branch deletion never deletes audit/evidence；
- max 3 active branches in P0。

## 8. Transaction and Authority Boundary

### 8.1 Preview

Preview is not a dry-run string. It is an immutable record containing：

- source branch/revision；
- base active policy/version；
- exact add/remove/change diff；
- deterministic checks + coverage；
- resulting business tool surface；
- hash + expiry；
- approval status。

### 8.2 Approval

- only visible Human UI gesture creates `Approval`；
- tool input cannot claim approval；
- approval binds preview ID + hash + actor + timestamp；
- any branch/workspace/catalog change invalidates it；
- Agent may ask Human to approve but cannot click/execute an approval tool。

### 8.3 Commit

Atomic transaction writes：idempotency entry, `PolicyVersion`, workspace pointer/version, `Receipt`, audit event. On failure, none persist.

### 8.4 Undo

Undo is compensation, not history erasure：

- creates a new policy version restoring the previous manifest；
- keeps the original activation and refund receipts；
- immediately changes current registry and handler enforcement；
- requires Human-armed short window；
- does not undo a completed refund; it only revokes authority. Business compensation would be another explicit task outside P0。

## 9. Verification Architecture

### 9.1 Deterministic first

```text
Policy manifest
  ↓ capability matcher
Task/probe request
  ↓ argument/resource predicate evaluator
Decision: allow / deny + exact constraint evidence
  ↓ scenario oracle
Expected outcome comparison
  ↓ structured check record
```

P0 predicates cover：capability ID、resource allowlist、numeric ceiling、currency、ticket binding、wildcard absence、forbidden capability、duplicate-effect invariant。

### 9.2 LLM role

LLM may：

- explain why strict/broad failed；
- summarize diff；
- propose a branch based on constraints。

LLM may not：

- decide a deterministic check passed；
- write Approval；
- bypass handler；
- assert refund occurred without ledger evidence；
- turn unknown coverage into pass。

### 9.3 Coverage semantics

每个 simulation/verification 输出：

```json
{
  "known": 8,
  "unknown": 0,
  "failed_to_run": 0,
  "catalog_version": 1,
  "task_pack_version": 1
}
```

`unknown > 0` 或 `failed_to_run > 0` 时不能 preview/commit。UI 文案只说“通过本 task pack”，不说“Agent universally safe”。

## 10. Single-Agent vs Multi-Agent

### P0：single Agent

理由：

-三个 manifests 足够在一个 reasoning loop 中生成；
-branching 的产品价值来自 decision alternatives，不来自 Agent 数量；
-OpenAI Responses multi-agent 当前为 beta；
-减少 latency、cost、account availability 和 demo nondeterminism；
-更容易证明 branch isolation，而不是解释 orchestration。

### P1：optional subagents

只有以下条件全满足才启用：

-每个 subagent 的目标独立（minimize risk / maximize utility / balanced）；
-每个只能写指定 branch；
-总并发 ≤3；
-有 deterministic simulator 和 single coordinator；
-single-agent fallback 输出相同 data model；
-评测显示替代方案质量提升，且视频不变复杂。

共享 commit authority 永不分配给 subagents。

## 11. OpenAI Capability Use and Boundaries

| Capability | Confirmed value | PermitBench use | Explicit non-use/boundary |
|---|---|---|---|
| GPT-5.6 reasoning | task understanding/tool use | proposal + explanation | not a policy oracle |
| Structured Outputs | schema-conforming model output | branch manifest aid | domain validation still required |
| PTC | V8 tool orchestration | P2 result aggregation | no approval-sensitive writes；not Node/sandbox |
| Tool search | deferred function/MCP schemas | eval/P2 adapter | not assumed to bridge WebMCP |
| Computer use | screenshot/action loop | UI-only baseline | not main execution path |
| Background mode | async response/poll/cancel | long eval runs if needed | not business durability |
| Multi-agent beta | parallel subagents | P1 optional branches | not P0 dependency |
| Conversation state/compaction | reasoning context continuity | optional harness convenience | not authoritative workspace |

官方边界与来源见 `CAPABILITY_FACT_CHECK_2026.md`。

## 12. Security and Trust Boundaries

```text
Untrusted: ticket/customer text, model output, tool arguments
     ↓ validate/minimize
Proposal zone: branches, simulations, previews
     ↓ exact Human approval
Authority zone: active policy, refund ledger
     ↓ independent read-back
Proof zone: verification, receipts, audit
```

Rules：

- same-origin P0；`exposedTo` 限制当前 origin；
- HTTPS only；
- ticket text 不进入 constraint definition；
- capability IDs 来自 immutable catalog，不接受模型自造 handler；
- tool schemas `additionalProperties:false`；
- WebMCP annotation 是客户端提示，不是 enforcement；
-所有 handler 根据 session actor，不信任 input actor；
-没有真实 provider secret；
-导出 trace 前移除自由文本/敏感字段；
-UI 清楚标注 sandbox 与 coverage scope。

## 13. Reliability State Transitions

### Duplicate call

```text
first issue_refund(key=K, payload=P)
  → commit refund R
retry issue_refund(key=K, payload=P)
  → return R, replayed=true
retry issue_refund(key=K, payload=P2)
  → IDEMPOTENCY_CONFLICT, no write
```

### Stale preview

```text
preview from workspace v15
→ Human edits branch; workspace v16
→ commit(expected_version=15)
→ STALE_VERSION
→ changed-since summary
→ re-simulate / new preview / approve
```

### Interrupted simulation

```text
AbortSignal
→ finish current pure predicate only
→ mark remaining tests not_run
→ persist partial for UI diagnostics
→ coverage incomplete
→ preview prohibited
```

### Commit uncertainty

Client disconnects after handler enters transaction：reconnect/retry with original idempotency key. Result is either no commit then normal retry, or existing commit receipt; never infer from missing response。

## 14. UI Synchronization

- domain service emits typed events after transaction success；
- React subscribes and renders authoritative snapshots；
- tool result contains resulting state version；UI asserts it matches local state；
- no separate “Agent state” store；
- Agent activity indicator uses request ID, not optimistic fake progress；
- simulator may stream local test progress to UI, final tool result remains one structured object；
- external Client error UX is supplemental; page always shows its own error/audit state。

## 15. Observability

P0 trace fields：

```text
request_id
actor_type
tool_name
phase
started_at / ended_at / duration_ms
input_hash (not raw sensitive values)
base_version / resulting_version
outcome / error_code
idempotency_replayed
created_entity_ids
```

Developer drawer 可下载 deterministic JSON bundle：workspace fixture version、tool trace、audit ledger、receipts、browser/client build notes。它用于 benchmark/reproduction，不进入主 Demo。

## 16. Deployment and Compatibility

- static HTTPS deployment；
- primary test：ChatGPT Desktop in-app browser；
- secondary test：Chrome 149+ with challenge flag；
- Edge/Brave 是 optional smoke；
-不承诺 Firefox/Safari；
-浏览器 capability check：若 `document.modelContext` 不存在，显示清楚 setup instructions 和只读 product tour；
-不能把只读 tour 当 functioning submission path；录制/README 明示支持环境。

## 17. Architecture acceptance gate

- [ ] UI 与 tool handler 共用 domain service；
- [ ] exact phase tool lists 可通过 `getTools()` 核对；
- [ ] registry stale handle 无法绕过 handler policy；
- [ ] compact summary 不包含完整 audit/customer dump；
- [ ] branch edit invalidates simulation/preview；
- [ ] Agent 无 approval write path；
- [ ] commit 原子 + version-bound + idempotent；
- [ ] refund 也 version-bound + idempotent；
- [ ] verification 从 ledger read-back，不信任 tool success string；
- [ ] refresh 可恢复 workspace/receipts；
- [ ] ChatGPT Desktop + Chrome 149 各跑主线；
- [ ] multi-agent/Responses bridge 不是 P0 dependency。

任何一项未过，不能用 UI polish 掩盖；按 `RISKS_AND_KILL_CRITERIA.md` 处理。
