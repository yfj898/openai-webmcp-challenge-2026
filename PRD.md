# PermitBench Product Requirements Document

> Status：Product freeze candidate  
> Version：0.9  
> Date：2026-08-27  
> Owner：TBD  
> Canonical decision：`FINAL_PRODUCT_DECISION.md`

## 1. Executive Summary

**PermitBench** 是一个 WebMCP-native 的 AI Agent 最小权限决策工作台。它帮助 AI 平台/安全工程师在 Agent 接入生产工具前，用真实任务与攻击探针比较多套隔离权限方案，选择并激活“足够完成工作、但不多给能力”的一套。

P0 只做一个 killer workflow：为一个退款客服 Agent 决定工具权限。Agent 在页面注册的 semantic tools 中读取任务与约束，创建 strict / balanced / broad 三个 policy branches，运行确定性模拟，比较 task utility 与 blast radius；Human 编辑、预览并批准 balanced policy。提交后，页面暴露的 WebMCP 工具立即收窄成获批的 `lookup_order` 与受限 `issue_refund`，Agent 完成一笔 42.80 美元退款，系统返回结构化验证 receipt，并支持撤销授权。

这不是权限网关、IAM generator、chatbot 或 workflow builder。产品的核心创新是把 Agent authority 从配置文件变成 Human 与 Agent 能共同观察、比较、模拟、批准和验证的网页对象。

## 2. Product Name

**Product name**：PermitBench（working name）  
**Tagline**：**Prove the agent can finish the job—without granting the world.**  
**中文 tagline**：先证明 Agent 能完成工作，再只给它完成工作所需的权限。  
**One-sentence pitch**：PermitBench 让 AI 安全工程师与 Agent 在同一 WebMCP 工作台中分支、模拟并激活一套经过任务证明的最小工具权限。

命名状态：完成快速公开网页撞名检索，未完成商标清查；Hackathon 可用，商业化前复核。

## 3. Problem

当一个 Agent 要接入退款、邮件、数据库或管理工具时，团队面临一个双向失败：

- 权限太窄：Agent 在生产任务中做到一半失败，用户只能继续加权；
- 权限太宽：模型、提示注入或错误参数可触达与 job 无关的数据和动作。

当前 review 往往把 task intent、MCP tool schemas、OAuth scopes、policy 配置、试跑结果和审批记录拆散在不同系统。审批人看见的是工具名或 broad scopes，不是“这些权限能完成哪些任务、不能做哪些危险事”的证据。

AWS 的开源 [Policy Security Assistant](https://github.com/aws-samples/policy-security-assistant) 直接把 IAM approval bottleneck 与反复沟通列为问题；[AuthBench](https://arxiv.org/abs/2605.14859) 则显示 frontier agents 会同时漏掉必要权限、授予未使用或敏感权限。**Confirmed：仅让模型多思考并不能成为 least-privilege control。**

## 4. User Persona

### Primary persona：陈宁，AI 平台/安全工程师

- 在一家约 80 人的 B2B SaaS 公司工作；
- 维护 6 个内部或客户可见 Agent；
- 负责 MCP servers、tool manifests、service credentials 与上线安全 review；
- 每周会处理 2–5 次新增工具、scope 扩大或业务动作变更；
- 事故后需要向 CTO/客户说明“Agent 当时为什么拥有这项能力”；
- 不是全职 IAM 专家，无法为每个 provider 手写复杂 policy；
- 最怕的不是一个清楚的 deny，而是 broad approval 后无法证明 blast radius。

### Decision urgency

- 上线前 review 可能阻塞 release；
- 资金、PII、管理员动作的错误授权后果高；
- 需要在数分钟内理解 trade-off，但 authority change 必须保守、可审计、可撤销。

### Secondary persona（P2）

- Agent owner：提出 task pack 并修复缺少能力；
- Security approver：只批准 exact preview；
- Auditor：只读查看 receipt 与 policy history。

## 5. JTBD

> 当一个 AI Agent 新增或改变生产工具、准备上线时，我想用真实工作任务和攻击探针比较几套最小权限方案，确保它既能完成目标又不能执行无关高风险动作，然后把被批准的精确版本可审计地激活，以便我不用在“Agent 不可用”和“Agent 权限过大”之间盲选。

成功结果：

- reviewer 能在 5 分钟内解释推荐 policy 为什么足够、为什么不宽；
- approval 与 exact policy/version 绑定；
- active tool surface 与 approved policy 一致；
- duplicate/stale calls 不造成额外写入；
- task execution 后有可检查 receipt，而不是“Done”。

## 6. Existing Workflow

```text
Agent owner 写自然语言任务
→ Slack/Jira 请求开权限
→ reviewer 打开 MCP manifest、provider docs、代码和 scopes
→ 在 YAML/JSON/console 中修改 allowlist
→ 人工试跑 1–2 个 happy paths
→ broad approve，或反复退回补权限
→ 上线后靠 runtime logs 发现漏权/越权
```

常用工具：Slack、Jira/Linear、GitHub、Notion/Docs、provider IAM console、MCP config、spreadsheets、日志平台。

| 断点 | 后果 |
|---|---|
| 人工复制 task/tool/policy | context loss；review 根据过时 schema |
| scope 与 argument constraint 分离 | 看似只给一个工具，实际可作用于所有金额/资源 |
| 只跑 happy path | broad policy 也会“成功”，无法证明安全性 |
| 单一 recommendation | Human 看不到最小性 trade-off |
| approval 不绑定 version | 批准后 policy 被改仍可能提交 |
| retry 无 idempotency | 重复 grant 或重复退款 |
| runtime log 无 decision evidence | 能看到做过什么，不能解释为什么有权做 |

## 7. Market / Competitors

完整研究见 `COMPETITOR_LANDSCAPE.md`。

| Layer | Examples | 已解决 | PermitBench 的空白 |
|---|---|---|---|
| Access governance | Opal Paladin、Apono | request context、approval、JIT access、audit | Agent job-specific 的多 policy task proof |
| MCP permission gateway | ScopeGate、Endram、Permission Protocol | per-action enforcement、allow/ask/deny、audit/revoke | 上线前 branch / compare / simulation decision |
| Policy analyzer | AWS IAM Access Analyzer、Google Policy Simulator | policy validation、access impact simulation | 从 Agent task 提出候选并把 Human decision 与 execution 串起来 |
| AI policy assistant | AWS Policy Security Assistant | generation、refinement、analyzer findings | isolated alternatives、negative probes、dynamic WebMCP tool activation |
| Admin registry | Microsoft 365 Agent tool approval | review/approve tool registrations | 是否足够完成 job 的 evidence 与最小性比较 |

竞争结论：每个原语都有 prior art；完整 `job → branch → simulate → compare → preview → approve → activate → execute → verify` 组合在公开产品中未被发现。置信度 Medium，Devpost gallery 仍 Unknown。

## 8. Why Existing Solutions Fail

现有方案不是“差”，而是优化目标不同：

- Gateway 优化的是**每次调用时能否放行**，不帮助 reviewer 构造和比较最小 policy；
- IAM simulator 优化的是**某项 policy change 改变哪些 access decisions**，不理解 Agent job success；
- AI access recommender 优化的是**更快处理 request**，通常只给一项 recommendation；
- runtime approval 优化的是**高风险 action 的最后一道门**，容易制造 approval fatigue；
- audit log 优化的是**事后重建动作**，不提供上线前 sufficiency/minimality proof。

PermitBench 把 positive task coverage 与 negative safety probes 放在同一 decision surface，且 policy 激活会真实改变 Agent 可发现的 WebMCP 工具集合。

## 9. Product Thesis

> 模型应当提出 authority；环境必须证明、批准和执行 authority。

三条产品假设：

1. **Hypothesis**：与一项 AI recommendation 相比，strict / balanced / broad 的视觉对比能让 reviewer 更快识别最小可用方案。
2. **Hypothesis**：将 approval 与 exact preview hash/version 绑定，会显著减少 reviewer 对“批准后被换包”的不信任。
3. **Hypothesis**：approval 后可见的 WebMCP tool-surface contraction，是理解 least privilege 最直观的 Demo 证据。

## 10. Why Now

- **Confirmed**：GPT-5.6 已有强 reasoning、function calling、Structured Outputs、PTC、tool search 与 beta multi-agent；模型可以承担 task understanding、候选生成和工具使用。[OpenAI model](https://developers.openai.com/api/docs/models/gpt-5.6-sol)
- **Confirmed**：WebMCP 当前 imperative API 支持页面注册/注销 semantic tools 与 `toolchange`，让同一网页第一次能同时成为 Human UI 与 Agent action interface。[WebMCP spec](https://webmachinelearning.github.io/webmcp/)
- **Confirmed**：MCP permission gateways、Agent registries 与 policy simulators 已出现，说明下游 enforcement 原语正在成熟。
- **Confirmed**：AuthBench 显示强模型仍不是可靠 least-privilege oracle。
- **Strong inference**：模型能力越强、工具调用越多，authority design surface 越重要；这个产品会随模型增强而增值。

## 11. Why WebMCP

WebMCP 不是本产品的后端协议，而是核心协作表面：

1. Human 当前打开的 task、selected branch、uncommitted edits、version 和 phase，就是 Agent 通过 tools 操作的同一状态；
2. tool call 产生可见 branch card、simulation status、preview diff 与 receipt，而不是后台黑箱；
3. 页面按 `explore → review → approved/execution` 注册/注销相关 tools；
4. Human 能在 Agent run 中编辑、拒绝、批准、撤销；
5. semantic IDs 和 schemas 替代脆弱 DOM clicking。

公平比较：REST 或 server MCP 能复刻业务语义，但需要另建 auth/session/page-state binding；UI-only Agent 能点击，却不能可靠获得 policy hashes、coverage 和 atomic transaction semantics。WebMCP 让这个 shared visible workspace 成为最自然、集成成本最低的产品形态。

规范边界：WebMCP 本身不提供 transaction、approval、idempotency、rollback、receipt 或 verification；全部由 PermitBench application layer 实现。详见 `CAPABILITY_FACT_CHECK_2026.md`。

## 12. Core UX

P0 是一个单页工作台，而不是聊天应用。

```text
┌──────────────── PermitBench · v12 · Explore ────────────────┐
│ Task pack + constraints │ Policy branches          │ Compare │
│                         │                           │ / Review│
│ Refund T-1042           │ [Strict]   2/3 tasks     │ utility │
│ Amount $42.80           │ [Balanced] 3/3 + 5/5 safe│ blast   │
│ Limit <= $100           │ [Broad]    3/3 + 2/5 safe│ diff    │
│                         │                           │ checks  │
├──────────────────────────────────────────────────────────────┤
│ Visible tool surface · audit timeline · receipt / undo       │
└──────────────────────────────────────────────────────────────┘
```

### UI areas

- **Task Pack**：正向任务、负向探针、hard constraints、coverage；
- **Capability Catalog**：stable IDs、read/write、risk、argument schema；
- **Branch Board**：policy manifest、simulation progress、utility/safety score；
- **Compare / Review**：structured diff、推荐理由、preview checks、approve/reject；
- **Tool Surface Inspector**：当前页面实际注册给 Agent 的 WebMCP tools；
- **Audit Timeline**：每次 branch/simulate/preview/approve/commit/execute/verify；
- **Receipt Drawer**：policy version、task outcome、checks、undo token。

不提供 generic chat sidebar；自然语言交互发生在 ChatGPT/Agent host，网页只承载 authoritative work。

## 13. Main User Flow

### Seeded scenario

- Ticket：`T-1042`
- Order：`ORD-8821`
- Issue：商品损坏，符合退款条件
- Paid：USD 42.80
- Policy limit：单笔退款不超过 USD 100；只允许当前 ticket/order；不得批量导出 PII；不得修改用户角色；duplicate refund 必须去重。

### End-to-end story

| Step | Human / UI | Agent tool | Authoritative effect |
|---:|---|---|---|
| 1 | User 打开 Refund Agent workspace | — | load workspace v12 / explore phase |
| 2 | User 在 ChatGPT 说：“给这个 Agent 最小可用权限并证明它安全。” | `get_workspace_summary` | none |
| 3 | UI 显示 Agent 正在读取 task/constraints | same call output | none |
| 4 | Agent 创建 strict policy | `propose_policy_branch` | 新建非权威 branch `br_strict` |
| 5 | Agent 创建 balanced policy | `propose_policy_branch` | 新建 `br_balanced` |
| 6 | Agent 创建 broad policy | `propose_policy_branch` | 新建 `br_broad` |
| 7 | 三张卡片并行显示模拟进度 | `simulate_policy_branch` ×3 | 保存 simulation results，不改 active policy |
| 8 | strict 缺少 refund；broad 触发 PII/admin/amount probes；balanced 全绿 | `compare_policy_branches` | none |
| 9 | Agent 推荐 balanced；Human 可选地把 refund ceiling 从 100 调到 75 | UI edit | 若编辑则 branch revision/workspace version 前进，并要求 re-simulate；主 Demo 使用 Agent 已提出的 75 |
| 10 | Agent 生成 exact activation preview | `preview_policy_activation` | 保存 preview，绑定当前 workspace version / branch revision / hash / expiry |
| 11 | UI 展示 delta、8 项 checks、tool surface before/after | preview output | none |
| 12 | Human 点击 Approve | UI-only privileged action | approval record；phase → approved |
| 13 | Agent 提交获批 preview | `commit_policy_activation` | atomic active policy v14 + receipt + undo token |
| 14 | Tool inspector 可见 design tools 消失，只剩批准的 execution tools | WebMCP toolchange | registry changed；policy 不由 registry 决定，handler 再强制检查 |
| 15 | Agent 读取订单 | `lookup_order` | read audit event |
| 16 | Agent 退款 USD 42.80 | `issue_refund` | sandbox ledger exactly-once write |
| 17 | Agent 验证任务 | `verify_task_outcome` | verification record + final receipt |
| 18 | Human 可查看 receipt，或点击 Revoke/Undo | `undo_policy_activation`（只在 review UI 明确触发后暴露） | active policy 恢复，execution tools 注销 |

## 14. Agent Flow

```text
discover phase-scoped tools
→ get compact workspace summary
→ reason about task/capabilities
→ propose isolated policy manifests
→ invoke deterministic simulations
→ compare structured results
→ stop for Human edit/approval
→ commit only approved preview
→ rediscover narrowed execution tools
→ perform constrained task
→ verify outcome / surface receipt
```

Agent stop conditions：

- 所有 positive tasks 与 negative probes 有结果；
- preview validation passed；
- Human approval required；
- commit version conflict；
- requested action exceeds policy；
- verification failed or coverage incomplete。

P0 使用单 Agent。三个 branches 是三个隔离提案，不强行调用 beta multi-agent。P1 才允许三个 subagents 各写独立 branch，单一 coordinator 比较，commit authority 始终唯一。

## 15. WebMCP Tools

P0 总计 10 个 semantic tools；任一 phase 同时最多暴露 6 个。

| Tool | Phase | R/W | Purpose |
|---|---|---|---|
| `get_workspace_summary` | all | R | compact task/constraints/version/phase/available actions |
| `propose_policy_branch` | explore | W, isolated | 创建/fork 候选或写入下一 revision，不改 active policy |
| `simulate_policy_branch` | explore | R/compute | 运行 positive tasks 与 negative probes |
| `compare_policy_branches` | explore/review | R | 返回 utility/risk/diff/recommendation inputs |
| `preview_policy_activation` | review | W, non-authoritative | 生成绑定 base version 的 exact diff/checks |
| `commit_policy_activation` | approved | W, authoritative | 只提交 Human 已批准的 preview |
| `undo_policy_activation` | post-commit, Human armed | W, authoritative | 使用 undo token 撤销 active policy |
| `lookup_order` | execution | R | 按 active policy 读取单个订单 |
| `issue_refund` | execution | W, authoritative | 在 order/amount/currency/duplicate constraints 内退款 |
| `verify_task_outcome` | execution/post | R/record | 确定性检查 task、policy、ledger，生成 receipt |

完整 schemas、失败与 idempotency 见 `WEBMCP_TOOL_SPEC.md`。

## 16. State Model

### P0 entities

| Entity | Key fields | Authority |
|---|---|---|
| `Workspace` | id, phase, version, active_policy_version_id, selected_task_pack_id | authoritative root |
| `TaskPack` | positive_tests, negative_probes, coverage_notes | seeded immutable fixture |
| `Capability` | stable id, title, read/write, argument schema, risk | catalog source |
| `Constraint` | stable id, predicate, severity, explanation | deterministic invariant |
| `Branch` | id, base_version, revision, manifest, author, status | isolated proposal |
| `Simulation` | branch_revision, tests, checks, coverage, result_hash | derived evidence |
| `Preview` | id, base_version, branch_revision, diff, checks, hash, expires_at | non-authoritative transaction candidate |
| `Approval` | preview_id/hash, actor, approved_at | Human-only authority |
| `PolicyVersion` | id, manifest, parent_id, activated_at | authoritative grant history |
| `Receipt` | id, type, before/after version, outcome, checks, undo_token | immutable proof |
| `Verification` | subject, checks, success, state_version | structured result |
| `AuditEvent` | sequence, actor, action, target, outcome, timestamp | append-only ledger |
| `RefundRecord` | order_id, amount, currency, idempotency_key, status | sandbox business ledger |

`User` 与 `AgentRun` 在 P0 不单独建复杂表：actor 作为 typed session identity 写入 events；P1 再规范化。

建议实体与 P0 合并关系：`Mutation` 由 branch revision / Preview diff / AuditEvent 表达；`Invariant` 是可执行的 typed `Constraint`；`Checkpoint` 由 `PolicyVersion` + workspace version + Receipt 表达。这样保留语义，但不为 Hackathon 建四张只含外键的表。

## 17. Branch Model

- branch 是 copy-on-write `PolicyManifest`，绑定 `workspace.base_version`；
- branch 只能创建、修改、模拟、比较或 discard，永不自动成为 active policy；
- Agent 用 `propose_policy_branch` 的 create/revise 模式写完整 manifest；Human 也可在可见 editor 中修改；
- 每次 manifest edit 增加 `branch.revision`，旧 simulation 立即标 stale；
- compare 只比较同一个 task pack 与 catalog version 下的 branches；
- “merge”不是字段级自动合并；选定 branch 后生成 activation preview；
- preview 后 Human edit 会使 preview stale，必须重新生成；
- P0 最多 3 个 active branches，避免 UI 与 Agent context 失控；
- 多 Agent（P1）只能写自己 branch，不能写 active policy 或别的 branch。

P0 manifests 示例：

```json
{
  "capabilities": [
    { "id": "orders.lookup", "resources": ["ORD-8821"] },
    { "id": "shipments.lookup", "resources": ["ORD-8821"] },
    {
      "id": "refunds.issue",
      "constraints": {
        "max_amount": 75,
        "currency": "USD",
        "order_ids": ["ORD-8821"],
        "requires_ticket": "T-1042"
      }
    }
  ]
}
```

## 18. Transaction Model

```text
branch revision
→ preview_policy_activation(expected_version)
→ deterministic validation
→ Preview{hash, base_version, expires_at}
→ Human approves exact preview hash
→ commit_policy_activation(preview_id, expected_version, idempotency_key)
→ atomic PolicyVersion + AuditEvent + Receipt
```

Invariants：

- `expected_version === workspace.version`；
- preview 未过期且未 abort；
- approval actor 是 Human approver，不是 Agent；
- approval 的 preview hash 与当前 preview 完全一致；
- underlying branch revision/catalog/task pack 未变化；
-所有 critical checks passed，coverage 不为 unknown；
- idempotency key 重放返回同一 receipt，不再创建 policy version；
- commit 原子写入，任何一步失败则 active policy 不变；
- undo 创建新的 compensating `PolicyVersion`，不删除历史。

P0 transaction API 映射：`preview_mutation` = `preview_policy_activation`；`validate_preview` 在 preview 创建与 commit 内各执行一次；`commit_preview` = `commit_policy_activation`；`abort_preview` 由 Human `Reject` UI 或 10 分钟 expiry 完成。避免再增加两个只包装同一状态机的 WebMCP tools。

## 19. Verification Model

### P0 deterministic positive tests

1. 可读取 `ORD-8821`；
2. 可读取其 shipment status；
3. 可对该订单退款 USD 42.80。

### P0 deterministic negative probes

1. 拒绝退款 USD 120；
2. 拒绝对其他 order 退款；
3. 拒绝 `customers.export_all`；
4. 拒绝 `users.set_role`；
5. duplicate refund 返回原 receipt，不重复写账。

### Activation checks

- required task coverage；
- denied capabilities absent；
- no wildcard capability/resource；
- refund ceiling ≤ organizational maximum；
- exact currency/order/ticket binding；
- no PII bulk export；
- no admin mutation；
- simulation result matches latest branch revision；
- workspace/catalog version current；
- coverage complete。

### Output contract

```json
{
  "success": true,
  "subject": "policy:pv_14/task:T-1042",
  "checks": [
    { "name": "required_task_coverage", "passed": true, "evidence": ["test_refund_42_80"] },
    { "name": "refund_ceiling", "passed": true, "actual": 75, "limit": 100 },
    { "name": "pii_export_denied", "passed": true },
    { "name": "duplicate_effect", "passed": true, "writes": 1 }
  ],
  "coverage": { "known": 8, "unknown": 0 },
  "state_version": 14,
  "receipt_id": "rcpt_01J..."
}
```

LLM 只解释结果；P0 不用 LLM judge 决定 pass/fail。P1 可用 LLM 检查自然语言 justification，但只作为 advisory check。

## 20. Permission Model

| Role | Read | Propose/branch | Preview | Approve | Commit | Undo/Admin |
|---|---:|---:|---:|---:|---:|---:|
| Viewer | ✓ | — | — | — | — | — |
| Agent | ✓ | ✓ | ✓ | — | 仅提交已获批 preview | 仅 Human armed 后请求 |
| Proposer human | ✓ | ✓ | ✓ | — | — | — |
| Approver human | ✓ | ✓ | ✓ | ✓ | 可手动 commit | ✓ |
| Admin | ✓ | ✓ | ✓ | ✓ | ✓ | reset fixture |

Security rules：

- Agent 不能通过 input 声明自己是 approver；actor 来自 session；
- Human approval 只能由可见 UI gesture 写入，WebMCP tool 不提供 `approve_preview`；
- credentials 不进入模型上下文；P0 无真实第三方 credential；
- registry scope 不是 security boundary，所有 handler 再查 active policy；
- sensitive fields 最小化，外部 ticket text 标记 untrusted 并从 constraint engine 隔离；
-所有 writes 有 explicit outcome、version 与 audit event。

P0 是公开 sandbox demo，不宣称 production-grade auth/RBAC；页面明确标注。真实身份、SSO、tenant isolation 为 P2。

## 21. Harness Architecture

```text
ChatGPT Desktop / challenge WebMCP client
        ↓ tool discovery / calls
document.modelContext registry
        ↓ phase-scoped semantic handlers
Application domain service
        ├─ compact projections
        ├─ policy simulator
        ├─ transaction + version/idempotency guard
        ├─ authorization/enforcement
        └─ verification + receipt
        ↓
IndexedDB authoritative demo state + append-only audit ledger
        ↓
React UI subscribes to the same state transitions
```

关键选择：

- P0 不内嵌 chat；外部 ChatGPT 是 Agent，网页是 authoritative workspace；
- P0 不依赖 Responses `tool_search` 与 WebMCP registry 的未知自动桥接；
- P0 不依赖 multi-agent beta；
- tool handlers 与 UI actions 调用同一 domain service，避免两套业务逻辑；
-每次 write 重新读取 current version/policy，绝不信任模型 memory；
-长输出只返回 IDs、counts、diffs 和 evidence references，不 dump 全 workspace。

详细说明见 `HARNESS_ARCHITECTURE.md`。

## 22. Model Strategy

### P0

- 目标 Agent：Challenge-supported ChatGPT Desktop / Chrome WebMCP path；
- 若客户端可选，Demo 使用 GPT-5.6；产品协议不依赖特定 reasoning 文本；
- 模型任务：理解 job、构造三个 manifest、比较 structured results、调用受限 execution tools；
- 应用任务：schema validation、business invariants、simulation、authority、transactions、verification。

### Evaluation only

- 使用 OpenAI Responses API + GPT-5.6 跑固定 benchmark；
- UI-only baseline 使用 computer use，自备隔离 browser executor；
- semantic baseline 使用与 WebMCP 等价的 tool schemas，但不假设 Responses 自动连接页面 registry；评测 harness 明确实现适配层。

### P1/P2

- P1：可选三个 subagents 各写一个 isolated branch；single-agent fallback 必须保留；
- P2：PTC 只用于读取/聚合大量 simulation results，不允许 programmatic caller 绕过 approval-sensitive writes；
- 不微调模型，不自研 planner，不把 conversation history 当数据库。

## 23. Error Recovery

| Failure | Detection | User/Agent response | State guarantee |
|---|---|---|---|
| invalid arguments | runtime schema + domain validation | field-level structured error；可重试 | zero mutation |
| stale workspace | `expected_version` mismatch | 返回 current version + changed summary；重新 preview | active policy unchanged |
| duplicate tool call | idempotency ledger | 返回原 result/receipt + `replayed:true` | exactly one logical write |
| simulation failure | test-level status + error code | retry only failed tests；显示 coverage incomplete | branch kept；不能 preview |
| partial commit | single IndexedDB transaction | whole transaction abort | no partial active policy |
| user edits after preview | preview hash/version stale | disable approval/commit；regenerate | stale approval unusable |
| user interruption | `AbortSignal` + run status | cancel compute；branch retained | no authority change |
| Agent timeout | UI run status/time budget | resume from branch/simulation records | no hidden retry |
| policy denial | handler checks active policy | explain failed constraint + safe next action | no side effect |
| duplicate refund | order + idempotency key check | return original refund receipt | one refund record |
| verification failure | deterministic checks | freeze success claim；offer retry/undo | receipt records failure |
| storage corruption/quota | startup integrity check | offer downloadable debug + reset sandbox | never claim production durability |

Recovery path to show outside main Demo：Human 在 preview 后修改金额上限，Agent commit 收到 stale error，刷新 preview 后成功。

## 24. P0 Scope

### Must build

1. 一个 seeded Refund Support Agent workspace；
2. stable task/capability/constraint IDs；
3. strict / balanced / broad 三 branch cards；
4. deterministic positive/negative policy simulator；
5. compare view：utility、safety、diff、coverage；
6. preview → Human approve → commit transaction；
7. expected version、idempotency、expiry、audit ledger；
8. phase-scoped 10 个 WebMCP tools，任一时刻 ≤6；
9. active policy 对 `lookup_order` / `issue_refund` 的 runtime enforcement；
10. task verification、receipt、undo；
11. demo reset；
12. Challenge-supported live deployment 与测试说明。

### P0 acceptance criteria

- 从 clean reset 到 final receipt 可连续完成 3 次；
- strict positive coverage 失败，broad negative probes 失败，balanced 全部通过；
- 没有 Human approval 时 commit 必须失败；
- stale preview、invalid amount、wrong order、duplicate refund 均按 spec 处理；
- approval 后 tool inspector 与实际 `document.modelContext.getTools()` 一致；
- unregister/register 在目标客户端可观察；
-所有 UI writes 和 Agent writes 走同一 reducer/domain service；
-刷新页面后 workspace/receipt 可恢复；
-公共 URL 无登录/付费限制；
-主 Demo 控制在 2:40–2:55。

## 25. P1

- Human edit branch 的 richer constraint editor；
- `get_changed_since(version)`、`get_branch_summary` 独立 tools（若 eval 证明需要）；
- 可选三 subagents 并行生成独立 branches；
- 第二个 task pack：sales email agent 或 GitHub release agent；
- export signed-like JSON receipt（明确不是密码学签名）；
- richer timeline filtering；
- accessibility、keyboard navigation、responsive polish；
- Responses-based automated eval adapter。

只有 P0 验收全部通过后才开始。

## 26. P2

- ScopeGate/Endram/OPA/Cedar 或真实 MCP gateway integration；
- AWS/GCP policy import/export 与真实 analyzer；
- SSO、multi-tenant RBAC、separation of duties；
- time-bound grants、JIT elevation、automatic expiry；
- real task trace import 与 continuously updated policy tests；
- team review、comments、policy-as-code pull requests；
- capability dependency graph 与 blast-radius visualization；
- signed receipts、external audit export；
- policy drift monitoring；
- vertical task-pack marketplace。

## 27. Evaluation

比较同一模型与同一任务下：

1. UI-only computer-use Agent；
2. WebMCP semantic Agent。

10 个任务覆盖 happy path、越权、stale、duplicate、undo。每个条件至少 3 次；保存 screen recording、tool/click trace、tokens（若 harness 可得）、mutation ledger。

核心指标：task success、unauthorized mutations、steps/tool calls、retries、tokens、time、stale recovery、duplicate-effect count、receipt correctness。

P0 targets（不是已取得结果）：

- WebMCP 10/10 benchmark tasks 达到预期 outcome；
- unauthorized authoritative writes = 0；
- duplicate refund writes = 1；
- stale commit rejection = 100%；
- semantic calls 相比 UI-only actions 中位数减少 ≥40%；
- clean happy path ≤5 分钟，视频版 ≤2:55。

完整 protocol 见 `EVALUATION_PLAN.md`。在实现前不宣称已有量化提升。

## 28. Demo Script

| Time | Story beat |
|---|---|
| 0:00–0:20 | Agent 要退款，但 broad tools 也能导出 PII、提权；普通 permission prompt 看不出“够不够、是否过宽” |
| 0:20–0:40 | UI-only Agent 在 toggle 中点击，依赖标签/DOM，无法证明 policy 与任务一致 |
| 0:40–1:10 | ChatGPT 通过 WebMCP 读取 task/constraints，创建 strict/balanced/broad，UI 实时出现 branches |
| 1:10–1:40 | 三个 simulations：strict 漏权、broad 越权、balanced 全绿；compare 显示 exact trade-off |
| 1:40–2:05 | Agent preview balanced；Human 看到 exact diff/checks，点击 Approve |
| 2:05–2:20 | Commit；设计工具消失，工具面瞬间收窄为获批 execution tools——wow moment |
| 2:20–2:43 | Agent lookup order、退款 42.80；120 美元探针被拒绝/或在验证中展示 |
| 2:43–2:55 | verification receipt + undo；一句 Why WebMCP / impact |

完整分镜与旁白见 `DEMO_PLAN.md`。

## 29. Technical Architecture

### Stack

- Frontend：React + Vite + TypeScript；
- State：Dexie/IndexedDB，Zod 或等价 runtime validation；
- UI state：轻量 store/reducer；
- WebMCP：`document.modelContext.registerTool` imperative API；`AbortController` 管 tool lifecycle；
- Simulator：纯 TypeScript deterministic evaluator；
- IDs：ULID/UUID；hash：Web Crypto SHA-256；
- Tests：Vitest（domain/tool handlers）+ Playwright（UI）+ target-client manual smoke；
- Deploy：Cloudflare Pages 或 Vercel static hosting，HTTPS；
- Telemetry：P0 本地 trace export；不发送 PII。

### Why this stack

- static client 避免 API key、auth 与 backend outage；
- IndexedDB 提供刷新后的 durable demo state 与 atomic transactions；
- deterministic local simulator 让视频不依赖网络/LLM judge；
- same-origin 单页降低 WebMCP Permissions Policy 风险；
-一个 domain service 保证 UI 与 Agent semantics 一致。

### Honest limitations

- IndexedDB 不是多用户生产数据库；
- P0 refund 是沙箱账本，不触达真实支付；
- P0 RBAC 是演示 session role，不是 production identity；
- WebMCP 仍为实验性 CG Draft，只承诺比赛环境。

## 30. Risks

前三项：

1. **Platform risk**：目标 ChatGPT/Chrome 对动态 tool lifecycle 行为不一致；
2. **Novelty risk**：Devpost gallery 出现同流程，或评委把它看成 permission dashboard；
3. **Comprehension risk**：least privilege / policy simulation 在 3 分钟中过于技术化。

其他：simulator coverage 被误解为通用安全证明、public demo 角色模型过弱、Agent 生成 invalid manifests、branch UI 过载、客户端 tool errors 不清晰、local state reset 失败、视频依赖 live model nondeterminism。

缓解与 owner 见 `RISKS_AND_KILL_CRITERIA.md`。

## 31. Kill Criteria

立即停止当前方向的条件：

- Phase 2 无法稳定演示 approval 后 tool set 收窄 + handler enforcement；
- simulator 不能用确定性 code 得到正/负 tests；
- gallery 出现相同完整 killer flow 且 6 小时内找不到本质差异；
- clean happy path 三次成功率 <80%，在删除 P1 后仍不能提高；
-五人无术语试映中，至少三人无法在 30 秒内复述“为什么 balanced 胜出”；
- P0 为了可信必须接真实 OAuth/IAM/payment，导致 5 天内无法稳定。

降级原则：先砍 P1/视觉动画/第二场景；不砍 preview、Human approval、dynamic scope、verification。若必须砍这些，产品 thesis 已失效，应 pivot。

## 32. Competitive Moat

Hackathon 阶段没有可声称的成熟 moat。潜在积累顺序：

1. **Decision evidence**：task packs、negative probes、policy outcomes 与 reviewer corrections；
2. **Capability graph**：跨 MCP/provider 的 stable semantic capability mapping；
3. **Workflow embed**：从 Agent registry、gateway、CI 到 runtime receipts 的闭环；
4. **Trust**：可复现的 deterministic checks、版本绑定与 audit；
5. **Vertical packs**：support、sales、code/deploy 等可验证 permission templates。

模型能力不是 moat；UI branch 动画不是 moat；connector 数量在 P0 也不是 moat。

## 33. Hackathon Judging Fit

| Criterion | Demo evidence | Why credible |
|---|---|---|
| WebMCP Leverage | semantic branch/simulate/preview/commit tools；approval 后 dynamic registry 收窄 | 删掉 WebMCP 后 shared page state 与 tool transition 主线明显变差 |
| Execution | 单场景完整 happy path + stale/duplicate recovery；local deterministic state | 无第三方网络依赖；每个状态可重置/复现 |
| Potential Impact | 明确 AI platform/security engineer；Agent production permissions 是高后果 job | AWS/Opal/AuthBench 证据支持，不诉诸“所有人” |
| Creativity & Ambition | authority 作为 branchable、simulatable、transactional shared object | 不是再做 agent browser、chat 或 MCP wrapper |

Top-10 thesis：一个三分钟内可见的工具面变化，同时证明 Human control、Agent usefulness、WebMCP necessity 与可靠执行。

## 34. Build Plan

从 2026-08-27 到硬截止 2026-09-04 04:00（UTC+8）倒排：

1. Phase 0 Product freeze — 0.25 天；
2. Phase 1 Core workspace — 0.75 天；
3. Phase 2 WebMCP tools — 0.75 天；
4. Phase 3 Agent integration — 0.5 天；
5. Phase 4 Transactions + verification — 0.75 天；
6. Phase 5 UI polish — 0.5 天；
7. Phase 6 Evaluation — 0.5 天；
8. Phase 7 Deployment — 0.25 天；
9. Phase 8 Demo — 0.5 天；
10. Phase 9 Submission — 0.25 天。

总计 5 天，保留约 1.5 天客户端兼容与提交缓冲。详细 deliverables、acceptance、blockers 见 `BUILD_PLAN.md`。

## 35. Final Recommendation

立即构建 PermitBench，保持以下不可谈判的 P0 核心：

```text
one support-refund job
three isolated policy branches
deterministic positive + negative simulation
visible compare
version-bound preview
human approval
atomic commit
dynamic WebMCP tool contraction
constrained execution
verification receipt + undo
```

明确不做：真实支付、通用 IAM、MCP gateway、内嵌聊天、多租户、通用 workflow canvas、beta multi-agent 依赖、第二场景（除非 P0 全绿）。

如果只剩 48 小时：删除 Human constraint editor、subagents、动画、云同步、自动 Responses eval 与第二 recovery UI；保留预制三 branches，但仍由 Agent 通过 WebMCP 创建，保留 simulator、preview/approve/commit、dynamic scope、refund execution、verify/receipt。

如果只能展示一个场景：展示 balanced policy commit 后，proposal-design tools 消失，Agent 只获得 balanced policy 允许的 execution tools；危险业务 tools 始终不可用。Agent 只能对 `ORD-8821` 退款 42.80 美元，随后 receipt 证明 USD 120、PII export、role mutation 与 duplicate effect 均被拒绝。
