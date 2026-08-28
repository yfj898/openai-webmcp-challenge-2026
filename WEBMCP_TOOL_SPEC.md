# PermitBench WebMCP Tool Specification

> Version：0.9  
> Target：WebMCP imperative API, 2026-08-26 Community Group Draft  
> Rule：工具 schema 用于发现与输入引导；所有权限、类型、版本和业务约束都在 handler 中重新验证。

## 1. Design goals

1. 只暴露 10 个高价值 semantic tools，不暴露 DOM primitives；
2. 按 workspace phase 动态注册，任一时刻不超过 6 个；
3. read、proposal、authoritative write 在名称与 handler 中明确分离；
4. 所有 authoritative writes 绑定 `expected_version`、Human approval 和 `idempotency_key`；
5. 返回 compact projection、stable IDs、明确 failure codes；
6. tool call 必须产生可见 UI effect 或可见 read status；
7. registry 不是安全边界；注销工具后，旧/并发 handler 仍必须检查 policy；
8. 只使用规范当前确认的 `readOnlyHint` 与 `untrustedContentHint` annotations；其他风险/权限 metadata 仅为 app-private，不假设客户端理解。

## 2. Phase-scoped registry

| Phase | Registered tools | Why |
|---|---|---|
| `explore` | `get_workspace_summary`, `propose_policy_branch`, `simulate_policy_branch`, `compare_policy_branches` | 只允许读取和 isolated proposal；没有 authority-changing tool |
| `review` | `get_workspace_summary`, `compare_policy_branches`, `preview_policy_activation` | 分支冻结，聚焦 exact diff/checks |
| `approved` | `get_workspace_summary`, `preview_policy_activation`, `commit_policy_activation` | commit 仅在 exact preview 已获 Human approval 后出现 |
| `execution` | `get_workspace_summary`, `lookup_order`, `issue_refund`, `verify_task_outcome` | tool surface 等于 active policy 允许的 sandbox capabilities |
| `post_commit` | `get_workspace_summary`, `verify_task_outcome`；Human 点击 “Arm undo” 后短暂加 `undo_policy_activation` | 防止 Agent 自主撤销 authority；Human 明确介入 |

Phase transition 后通过每组 `AbortController` 注销旧 tools，再注册新 tools。页面 tool inspector 调用 `document.modelContext.getTools()` 显示真实 registry；业务 handler 另查 workspace phase 与 active policy。

### 2.1 Branch operation mapping

为把工具数控制在 10 个，P0 不把 branch 生命周期拆成细碎 tools：

| Branch-native operation | P0 semantic action |
|---|---|
| `create_branch` | `propose_policy_branch(operation="create")` |
| `fork_state` | create 时可传 `source_branch_id`；未传则从 active policy fork |
| `apply_changes` | `propose_policy_branch(operation="revise", branch_id, expected_revision)`，用完整 manifest 创建下一 revision |
| `score_branch` | `simulate_policy_branch` 的 deterministic utility/safety/blast-radius outputs |
| `compare_branches` | `compare_policy_branches` |
| `merge_branch` | 不直接 merge；`preview_policy_activation` → Human approval → `commit_policy_activation` |
| `discard_branch` | Human UI 的 `Discard` 将 branch 标 archived；P0 不向 Agent 暴露删除工具，audit/evidence 不删除 |

采用 full-manifest revision 而不是 patch operations，可避免 JSON Patch 顺序、部分写与冲突语义进入 Hackathon P0。

## 3. Shared contracts

### 3.1 Success envelope

```json
{
  "ok": true,
  "data": {},
  "meta": {
    "workspace_id": "ws_refund_demo",
    "state_version": 14,
    "request_id": "req_01J...",
    "replayed": false
  }
}
```

### 3.2 Error envelope

```json
{
  "ok": false,
  "error": {
    "code": "STALE_VERSION",
    "message": "Workspace changed after this preview was created.",
    "retryable": true,
    "current_version": 14,
    "changed_fields": ["branch:br_balanced.manifest"]
  },
  "meta": {
    "workspace_id": "ws_refund_demo",
    "request_id": "req_01J..."
  }
}
```

### 3.3 Common error codes

| Code | Meaning | Mutation guarantee | Recovery |
|---|---|---|---|
| `INVALID_ARGUMENT` | JSON shape 或 field 不合法 | none | 修正字段 |
| `WORKSPACE_MISMATCH` | tool call 不是当前页面 workspace | none | 重新读取 summary |
| `PHASE_MISMATCH` | tool 在当前 phase 不允许 | none | 重新发现 tools |
| `STALE_VERSION` | `expected_version` 过时 | none | `get_workspace_summary(since_version)` 后重新 preview |
| `STALE_BRANCH` | branch revision / simulation 过时 | none | re-simulate |
| `PREVIEW_EXPIRED` | preview 超过 10 分钟或已 abort | none | 重新 preview |
| `NOT_APPROVED` | exact preview hash 无 Human approval | none | 等待 Human UI approval |
| `POLICY_DENIED` | active policy 不允许 capability/arguments | none | 停止或请求新 policy review；不能自动扩权 |
| `CONSTRAINT_FAILED` | invariant/check 未通过 | none | 修改 branch |
| `COVERAGE_INCOMPLETE` | simulator 有 unknown/error | none | 修复并重新 simulation |
| `IDEMPOTENCY_CONFLICT` | 同 key 被不同 payload 使用 | none | 使用新 key，调查 caller bug |
| `UNDO_NOT_ARMED` | Human 未开启短时 undo window | none | Human UI 点击 Arm undo |
| `ABORTED` | 调用收到 `AbortSignal` | none 或已明确返回 commit receipt | 查询 summary/receipt |
| `INTERNAL_ERROR` | 未分类异常 | transaction abort | 安全重试只限 read/compute；write 用原 idempotency key 查询 |

### 3.4 Idempotency rules

- key 格式：调用方生成 UUID/ULID，长度 16–128；
- dedupe scope：`workspace_id + tool_name + actor_id + idempotency_key`；
- store：request payload canonical hash + final response + created IDs；
- expiry：demo workspace 生命周期内不回收；
-同 key + 同 payload：返回原 response，`meta.replayed=true`；
-同 key + 不同 payload：`IDEMPOTENCY_CONFLICT`；
- handler timeout 后调用方必须使用原 key重试，不能盲目换 key；
- read-only tools 不要求 key；derived-record tools 使用 deterministic cache key。

### 3.5 App-private tool metadata

PermitBench 内部维护但不依赖客户端执行：

```ts
type AppToolPolicy = {
  authority: "read" | "proposal" | "authoritative-write";
  requiredRole: "agent" | "approver" | "admin";
  phase: WorkspacePhase[];
  needsIdempotency: boolean;
  approvalBinding?: "none" | "preview" | "human-armed";
};
```

这些不是当前 WebMCP standardized annotations。

### 3.6 Transaction operation mapping

| Transaction concept | P0 implementation |
|---|---|
| `preview_mutation` | `preview_policy_activation` 创建 immutable candidate |
| `validate_preview` | preview 创建时运行全部 checks；commit transaction 内再次运行，不另暴露一个容易失真的 “validate” tool |
| `commit_preview` | `commit_policy_activation`，要求 exact Human approval、expected version、idempotency key |
| `abort_preview` | Human UI `Reject preview` 将其标记 aborted；未处理 preview 10 分钟过期；Agent 无需额外 write tool |

## 4. Tool: `get_workspace_summary`

### Contract

- **Purpose**：提供当前工作区的 compact authoritative projection；替代 full state dump。
- **When exposed**：所有 phases。
- **Read/write**：Read only。
- **Side effects**：只写 debug access event（不增加 workspace version）。
- **Permission**：任何当前 workspace viewer/Agent。
- **Annotations**：`readOnlyHint: true`, `untrustedContentHint: true`（task/ticket text 可能含外部内容）。

### Input schema

```json
{
  "type": "object",
  "additionalProperties": false,
  "properties": {
    "since_version": { "type": "integer", "minimum": 0 },
    "include": {
      "type": "array",
      "items": {
        "enum": ["task", "constraints", "branches", "active_policy", "recent_events", "tool_surface"]
      },
      "maxItems": 6,
      "uniqueItems": true
    }
  }
}
```

### Output schema

```json
{
  "workspace_id": "ws_refund_demo",
  "phase": "explore",
  "state_version": 12,
  "task": {
    "id": "T-1042",
    "goal": "Refund damaged order ORD-8821 for USD 42.80",
    "positive_test_ids": ["pt_lookup", "pt_shipping", "pt_refund"],
    "negative_probe_ids": ["np_120", "np_other_order", "np_pii", "np_role", "np_duplicate"]
  },
  "constraint_refs": [
    { "id": "c_refund_max", "summary": "refund <= USD 100" },
    { "id": "c_no_pii_export", "summary": "bulk PII export denied" }
  ],
  "branches": [],
  "active_policy": { "version_id": "pv_0", "capability_ids": [] },
  "tool_surface": ["get_workspace_summary", "propose_policy_branch", "simulate_policy_branch", "compare_policy_branches"],
  "changed_since": null
}
```

### Failure cases / idempotency / UI effect

- Failures：`WORKSPACE_MISMATCH`（内部 session binding）、invalid `since_version`；
- Idempotency：pure read；同版本可缓存；
- UI effect：header 闪示 “Agent read v12”；Task Pack 中被读取字段短暂高亮；不得自动切换 selection。

## 5. Tool: `propose_policy_branch`

### Contract

- **Purpose**：创建 isolated policy proposal，或用完整 manifest 写入现有 branch 的下一 revision。
- **When exposed**：`explore`。
- **Read/write**：Proposal write；永不改变 active policy。
- **Side effects**：创建 `Branch` 或新 revision、增加 workspace version、使旧 simulation/preview stale、写 audit event。
- **Permission**：Agent 或 Proposer human。
- **Annotations**：`readOnlyHint: false`, `untrustedContentHint: false`。

### Input schema

```json
{
  "type": "object",
  "additionalProperties": false,
  "required": ["operation", "label", "intent", "base_version", "manifest", "idempotency_key"],
  "properties": {
    "operation": { "enum": ["create", "revise"] },
    "label": { "enum": ["strict", "balanced", "broad"] },
    "intent": { "type": "string", "minLength": 10, "maxLength": 240 },
    "base_version": { "type": "integer", "minimum": 0 },
    "branch_id": { "type": "string", "pattern": "^br_[a-z0-9_-]+$" },
    "source_branch_id": { "type": "string", "pattern": "^br_[a-z0-9_-]+$" },
    "expected_revision": { "type": "integer", "minimum": 1 },
    "manifest": {
      "type": "object",
      "additionalProperties": false,
      "required": ["capabilities"],
      "properties": {
        "capabilities": {
          "type": "array",
          "minItems": 1,
          "maxItems": 8,
          "uniqueItems": true,
          "items": {
            "type": "object",
            "additionalProperties": false,
            "required": ["id"],
            "properties": {
              "id": { "type": "string", "pattern": "^[a-z][a-z0-9_.-]+$" },
              "resources": { "type": "array", "items": { "type": "string" }, "maxItems": 5 },
              "constraints": { "type": "object" }
            }
          }
        }
      }
    },
    "idempotency_key": { "type": "string", "minLength": 16, "maxLength": 128 }
  },
  "allOf": [
    {
      "if": { "properties": { "operation": { "const": "revise" } } },
      "then": { "required": ["branch_id", "expected_revision"] }
    }
  ]
}
```

### Output schema

```json
{
  "branch": {
    "id": "br_balanced",
    "operation": "create",
    "label": "balanced",
    "base_version": 12,
    "revision": 1,
    "status": "draft",
    "capability_ids": ["orders.lookup", "shipments.lookup", "refunds.issue"],
    "manifest_hash": "sha256:..."
  },
  "next_actions": ["simulate_policy_branch"]
}
```

### Runtime validation

- capability IDs 必须存在于当前 catalog；
- constraints 必须符合对应 capability schema；
-拒绝 secrets、free-form executable code、wildcard resources；
- create 时 label 在当前 workspace 唯一；revise 时 label/branch 必须匹配；
- revise 的 `expected_revision` 必须等于 current branch revision；旧 simulation/preview 随新 revision 失效；
- `source_branch_id` 只复制 proposal manifest，不复制 simulation/approval；
- `base_version` 必须等于 current version；
- max 3 active branches。

### Failure cases / idempotency / UI effect

- Failures：`STALE_VERSION`, `STALE_BRANCH`, `INVALID_ARGUMENT`, `CONSTRAINT_FAILED`, `PHASE_MISMATCH`；
- Idempotency：required；重放返回同一 `branch.id/revision`；
- UI effect：create 时增加卡片，revise 时更新原卡 revision；capability chips 与 risk badges 可见；卡片标为 “Not simulated”，旧 green result 显式变 stale。

## 6. Tool: `simulate_policy_branch`

### Contract

- **Purpose**：对 branch revision 运行 positive tasks 与 negative probes。
- **When exposed**：`explore`。
- **Read/write**：Derived compute；保存 immutable `Simulation`，不改 active policy。
- **Side effects**：simulation record + audit event；workspace version 不因纯派生结果递增，branch revision 不变。
- **Permission**：Agent/Proposer/Approver。
- **Annotations**：`readOnlyHint: false`（会持久化 simulation record 并改变可见工作区）, `untrustedContentHint: false`。

### Input schema

```json
{
  "type": "object",
  "additionalProperties": false,
  "required": ["branch_id", "expected_revision", "test_scope"],
  "properties": {
    "branch_id": { "type": "string", "pattern": "^br_[a-z0-9_-]+$" },
    "expected_revision": { "type": "integer", "minimum": 1 },
    "test_scope": { "enum": ["all", "positive", "negative"] }
  }
}
```

### Output schema

```json
{
  "simulation_id": "sim_br_balanced_r1",
  "branch_id": "br_balanced",
  "branch_revision": 1,
  "success": true,
  "utility": { "passed": 3, "total": 3 },
  "safety": { "passed": 5, "total": 5 },
  "tests": [
    { "id": "pt_refund", "kind": "positive", "passed": true, "evidence": ["refunds.issue", "max_amount:75"] },
    { "id": "np_120", "kind": "negative", "passed": true, "decision": "denied", "failed_constraint": "max_amount" }
  ],
  "coverage": { "known": 8, "unknown": 0 },
  "result_hash": "sha256:..."
}
```

### Failure cases / idempotency / UI effect

- Failures：`STALE_BRANCH`, `COVERAGE_INCOMPLETE`, `ABORTED`, invalid test scope；
- Idempotency：cache key = task pack version + catalog version + branch manifest hash + scope；重复调用返回相同 result；
- Cancellation：每个 probe 后检查 `AbortSignal`；已完成项可显示 partial，但 partial 不可用于 preview；
- UI effect：branch card 显示逐项进度；完成后 utility/safety bars、red/green evidence 和 coverage badge 更新。

## 7. Tool: `compare_policy_branches`

### Contract

- **Purpose**：返回 2–3 个同基线 branch 的 structured diff 与 trade-offs。
- **When exposed**：`explore`, `review`。
- **Read/write**：Read only。
- **Side effects**：none（debug access event 可忽略）。
- **Permission**：Viewer/Agent。
- **Annotations**：`readOnlyHint: true`, `untrustedContentHint: false`。

### Input schema

```json
{
  "type": "object",
  "additionalProperties": false,
  "required": ["branch_ids"],
  "properties": {
    "branch_ids": {
      "type": "array",
      "minItems": 2,
      "maxItems": 3,
      "uniqueItems": true,
      "items": { "type": "string", "pattern": "^br_[a-z0-9_-]+$" }
    },
    "include_test_details": { "type": "boolean", "default": false }
  }
}
```

### Output schema

```json
{
  "baseline": { "workspace_version": 15, "task_pack_version": 1, "catalog_version": 1 },
  "ranking": ["br_balanced", "br_strict", "br_broad"],
  "branches": [
    {
      "id": "br_balanced",
      "utility": { "passed": 3, "total": 3 },
      "safety": { "passed": 5, "total": 5 },
      "blast_radius": { "write_capabilities": 1, "resource_count": 1, "wildcards": 0 },
      "eligible_for_preview": true
    }
  ],
  "diffs": [
    { "capability_id": "customers.export_all", "present_in": ["br_broad"], "risk": "critical" }
  ],
  "recommendation_rule": "all positive tests pass, all negative probes denied, then minimize blast radius",
  "recommended_branch_id": "br_balanced"
}
```

推荐规则由代码计算，不由 LLM 自由打分。Agent 可以解释或不同意，但不能篡改 eligibility。

### Failure cases / idempotency / UI effect

- Failures：未模拟、simulation stale、baseline mismatch、coverage incomplete；
- Idempotency：pure read；
- UI effect：Compare panel 打开；三列对齐、差异 capability 高亮；推荐 badge 明确写 “rule-based”。

## 8. Tool: `preview_policy_activation`

### Contract

- **Purpose**：将一个已通过 simulation 的 branch 变为 exact、可批准、非权威 preview。
- **When exposed**：`review`, `approved`（只用于刷新过期/stale preview）。
- **Read/write**：Non-authoritative write。
- **Side effects**：创建 `Preview` + validation result + audit event；不改 active policy。
- **Permission**：Agent/Proposer/Approver。
- **Annotations**：`readOnlyHint: false`, `untrustedContentHint: false`。

### Input schema

```json
{
  "type": "object",
  "additionalProperties": false,
  "required": ["branch_id", "expected_branch_revision", "expected_version", "idempotency_key"],
  "properties": {
    "branch_id": { "type": "string" },
    "expected_branch_revision": { "type": "integer", "minimum": 1 },
    "expected_version": { "type": "integer", "minimum": 0 },
    "idempotency_key": { "type": "string", "minLength": 16, "maxLength": 128 }
  }
}
```

### Output schema

```json
{
  "preview": {
    "id": "prv_01J...",
    "base_version": 15,
    "branch_id": "br_balanced",
    "branch_revision": 1,
    "diff": {
      "add": ["orders.lookup", "shipments.lookup", "refunds.issue{max_amount:75,order:ORD-8821}"],
      "remove": []
    },
    "checks": [
      { "name": "positive_coverage", "passed": true },
      { "name": "negative_probes", "passed": true },
      { "name": "no_wildcards", "passed": true },
      { "name": "version_current", "passed": true }
    ],
    "tool_surface_after": ["lookup_order", "issue_refund", "verify_task_outcome"],
    "hash": "sha256:...",
    "expires_at": "2026-08-27T13:10:00Z",
    "approval_status": "pending"
  }
}
```

### Failure cases / idempotency / UI effect

- Failures：`STALE_VERSION`, `STALE_BRANCH`, `CONSTRAINT_FAILED`, `COVERAGE_INCOMPLETE`；
- Idempotency：required；同 payload 返回同一 unexpired preview；branch/version变化后旧 key + 新 payload 冲突；
- UI effect：Review panel 显示 before/after、8 项 checks、expiry countdown；Approve button 只在全绿时启用；tool surface after 仅为 preview，不实际注册。

## 9. Tool: `commit_policy_activation`

### Contract

- **Purpose**：原子激活 Human 已批准的 exact preview。
- **When exposed**：`approved`；只在页面存在有效 approval record 时注册。
- **Read/write**：Authoritative write。
- **Side effects**：创建 `PolicyVersion`、更新 active policy/workspace version、创建 receipt/audit；切换 phase 与 tool registry。
- **Permission**：Agent 可发起，但 authority 来自独立 Human approval；Approver 可从 UI 发起。
- **Annotations**：`readOnlyHint: false`, `untrustedContentHint: false`。

### Input schema

```json
{
  "type": "object",
  "additionalProperties": false,
  "required": ["preview_id", "expected_version", "idempotency_key"],
  "properties": {
    "preview_id": { "type": "string", "pattern": "^prv_" },
    "expected_version": { "type": "integer", "minimum": 0 },
    "idempotency_key": { "type": "string", "minLength": 16, "maxLength": 128 }
  }
}
```

### Output schema

```json
{
  "commit": {
    "policy_version_id": "pv_16",
    "previous_policy_version_id": "pv_0",
    "state_version": 16,
    "manifest_hash": "sha256:...",
    "active_tool_surface": ["get_workspace_summary", "lookup_order", "issue_refund", "verify_task_outcome"],
    "receipt_id": "rcpt_policy_01J...",
    "undo_token": "undo_01J...",
    "committed_at": "2026-08-27T13:02:10Z"
  }
}
```

### Atomic checks

在一个 IndexedDB transaction 内再次检查：current version、preview hash/expiry、Human approval actor/hash、branch/catalog/task versions、all critical checks、idempotency record。任何失败都不写 active policy。

### Failure cases / idempotency / UI effect

- Failures：`NOT_APPROVED`, `PREVIEW_EXPIRED`, `STALE_VERSION`, `CONSTRAINT_FAILED`, `IDEMPOTENCY_CONFLICT`, `ABORTED`；
- Idempotency：required；timeout 后同 key 查询/重放原 receipt；
- Abort：事务提交前 abort = none；提交后即使客户端断开，重放返回 receipt；
- UI effect：header 变 v16/Execution；green activation sweep；Branch Board read-only；真实 tool inspector 更新；receipt drawer 打开。

## 10. Tool: `undo_policy_activation`

### Contract

- **Purpose**：用 commit receipt 的 undo token 创建 compensating policy version。
- **When exposed**：`post_commit` 且 Human 在 UI 点击 “Arm undo”；60 秒后自动注销。
- **Read/write**：Authoritative write。
- **Side effects**：创建新 `PolicyVersion` 指向前一 manifest、更新 active policy、revoke execution surface、receipt/audit。
- **Permission**：Human approver/admin 必须先 arm；Agent 只能在窗口内调用。
- **Annotations**：`readOnlyHint: false`, `untrustedContentHint: false`。

### Input schema

```json
{
  "type": "object",
  "additionalProperties": false,
  "required": ["receipt_id", "undo_token", "expected_version", "idempotency_key"],
  "properties": {
    "receipt_id": { "type": "string", "pattern": "^rcpt_policy_" },
    "undo_token": { "type": "string", "pattern": "^undo_" },
    "expected_version": { "type": "integer", "minimum": 0 },
    "idempotency_key": { "type": "string", "minLength": 16, "maxLength": 128 }
  }
}
```

### Output schema

```json
{
  "undo": {
    "policy_version_id": "pv_17",
    "restored_from": "pv_0",
    "state_version": 17,
    "active_tool_surface": ["get_workspace_summary", "compare_policy_branches", "preview_policy_activation"],
    "receipt_id": "rcpt_undo_01J..."
  }
}
```

### Failure cases / idempotency / UI effect

- Failures：`UNDO_NOT_ARMED`, invalid/used token, `STALE_VERSION`, dependency conflict（P0 无 downstream dependency）；
- Idempotency：required；重放返回相同 undo receipt；token consumed by exactly one logical undo；
- UI effect：red “Access revoked” banner；execution tools 注销；policy history 保留 pv16/pv17；不删除已完成 refund record。

## 11. Tool: `lookup_order`

### Contract

- **Purpose**：读取 active policy 允许的一个订单字段投影。
- **When exposed**：`execution`，且 active policy 包含 `orders.lookup`。
- **Read/write**：Read only。
- **Side effects**：access audit event；不改 order/workspace version。
- **Permission**：Agent；resource 必须在 active policy allowlist。
- **Annotations**：`readOnlyHint: true`, `untrustedContentHint: true`（customer/ticket fields 是外部内容）。

### Input schema

```json
{
  "type": "object",
  "additionalProperties": false,
  "required": ["order_id", "fields"],
  "properties": {
    "order_id": { "type": "string", "pattern": "^ORD-[0-9]+$" },
    "fields": {
      "type": "array",
      "minItems": 1,
      "maxItems": 6,
      "uniqueItems": true,
      "items": { "enum": ["amount", "currency", "status", "delivered_at", "shipment_status", "refund_status"] }
    }
  }
}
```

### Output schema

```json
{
  "order": {
    "id": "ORD-8821",
    "amount": 42.8,
    "currency": "USD",
    "status": "delivered",
    "shipment_status": "damaged_reported",
    "refund_status": "none"
  },
  "field_projection": ["amount", "currency", "status", "shipment_status", "refund_status"],
  "policy_version_id": "pv_16"
}
```

### Failure cases / idempotency / UI effect

- Failures：`POLICY_DENIED` for wrong order/field，not found，phase mismatch；
- Idempotency：pure read；
- UI effect：Order evidence card 高亮实际返回字段；PII 不在 schema 中，不能靠 prompt 请求。

## 12. Tool: `issue_refund`

### Contract

- **Purpose**：在 active policy 的 resource/amount/currency/ticket bounds 内写入一笔 sandbox refund。
- **When exposed**：`execution`，且 active policy 包含 `refunds.issue`。
- **Read/write**：Authoritative business write。
- **Side effects**：RefundRecord、order refund status、audit、business receipt；workspace version 增加。
- **Permission**：Agent；active policy + task binding 必须同时通过。
- **Annotations**：`readOnlyHint: false`, `untrustedContentHint: false`。

### Input schema

```json
{
  "type": "object",
  "additionalProperties": false,
  "required": ["order_id", "ticket_id", "amount", "currency", "reason_code", "expected_version", "idempotency_key"],
  "properties": {
    "order_id": { "type": "string", "pattern": "^ORD-[0-9]+$" },
    "ticket_id": { "type": "string", "pattern": "^T-[0-9]+$" },
    "amount": { "type": "number", "exclusiveMinimum": 0, "multipleOf": 0.01 },
    "currency": { "const": "USD" },
    "reason_code": { "enum": ["damaged_item", "not_received", "approved_exception"] },
    "expected_version": { "type": "integer", "minimum": 0 },
    "idempotency_key": { "type": "string", "minLength": 16, "maxLength": 128 }
  }
}
```

### Output schema

```json
{
  "refund": {
    "id": "rfnd_01J...",
    "order_id": "ORD-8821",
    "ticket_id": "T-1042",
    "amount": 42.8,
    "currency": "USD",
    "status": "completed",
    "policy_version_id": "pv_16",
    "receipt_id": "rcpt_refund_01J..."
  }
}
```

### Runtime checks

- exact active policy version；
- capability `refunds.issue` present；
- order/ticket/currency match policy；
- amount ≤ active policy ceiling and order paid amount；
- eligible delivery/issue state；
- no existing completed refund；
- idempotency payload match；
- atomic order/refund/audit write。

### Failure cases / idempotency / UI effect

- Failures：`POLICY_DENIED` (amount/order/ticket), `STALE_VERSION`, already-refunded conflict, invalid state；
- Idempotency：required；同 key 重放原 refund receipt；不同 key 对已退款 order 仍不能二次写；
- UI effect：Ledger 增加 refund；Order card 状态变 completed；超额调用显示红色 constraint line，不能产生 optimistic success UI。

## 13. Tool: `verify_task_outcome`

### Contract

- **Purpose**：独立读取 task、active policy、simulation 与 sandbox ledger，生成 structured final verification。
- **When exposed**：`execution`, `post_commit`。
- **Read/write**：Derived verification write；不改变 policy/business outcome，但持久化 verification + receipt。
- **Side effects**：Verification record、audit、final receipt。
- **Permission**：Viewer/Agent/Approver。
- **Annotations**：`readOnlyHint: false`（会持久化 receipt）, `untrustedContentHint: false`。

### Input schema

```json
{
  "type": "object",
  "additionalProperties": false,
  "required": ["task_id", "policy_version_id", "expected_version"],
  "properties": {
    "task_id": { "const": "T-1042" },
    "policy_version_id": { "type": "string", "pattern": "^pv_" },
    "expected_version": { "type": "integer", "minimum": 0 }
  }
}
```

### Output schema

```json
{
  "verification": {
    "id": "ver_01J...",
    "success": true,
    "task_id": "T-1042",
    "policy_version_id": "pv_16",
    "checks": [
      { "name": "required_task_completed", "passed": true, "evidence_ids": ["rfnd_01J..."] },
      { "name": "refund_ceiling", "passed": true, "actual": 42.8, "limit": 75 },
      { "name": "pii_export_denied", "passed": true },
      { "name": "admin_mutation_denied", "passed": true },
      { "name": "duplicate_effect", "passed": true, "write_count": 1 }
    ],
    "coverage": { "known": 8, "unknown": 0 },
    "state_version": 17,
    "receipt_id": "rcpt_task_01J..."
  }
}
```

### Failure cases / idempotency / UI effect

- Failures：`STALE_VERSION`, incomplete task, policy version mismatch, `COVERAGE_INCOMPLETE`；
- Idempotency：deterministic key = task + policy version + ledger head；相同 evidence 返回同一 verification；ledger变化后新 verification；
- UI effect：Receipt Drawer 显示逐项 checks、evidence links、version；`success=false` 时绝不出现 “Done” 或 green completion。

## 14. Registration sketch

```ts
function installPhaseTools(phase: WorkspacePhase) {
  phaseController?.abort();
  phaseController = new AbortController();

  for (const spec of toolSpecsFor(phase)) {
    document.modelContext.registerTool(
      {
        name: spec.name,
        description: spec.description,
        inputSchema: spec.inputSchema,
        annotations: spec.annotations,
        execute: async (input, { signal }) =>
          runValidatedTool(spec.name, input, {
            signal,
            actor: session.actor,
            workspaceId: route.workspaceId,
          }),
      },
      { signal: phaseController.signal, exposedTo: [location.origin] },
    );
  }
}
```

实际 API signature 以目标 Chrome/ChatGPT build smoke test 为准；spec 仍是 CG Draft。不要把示意代码当跨浏览器稳定契约。

## 15. Tool-level acceptance tests

每个 write tool 必测：

- invalid JSON / unexpected property；
- schema valid 但 domain invalid；
- wrong phase；
- stale version/revision；
- duplicate same key/same payload；
- duplicate same key/different payload；
- abort before commit；
- thrown internal error；
-刷新后重放；
- UI state 与 tool output/state version 一致。

跨工具 contract tests：

1. unsimulated branch 不能 preview；
2. stale preview 不能 approve/commit；
3. Agent 无法通过任何 tool 创建 Approval；
4. commit 后 explore tools 不可发现；
5. registry 被绕过直接调用 handler 时 policy 仍拒绝；
6. undo 后 execution handler 拒绝旧 policy；
7. duplicate refund 在不同 idempotency key 下也只有一条 completed record；
8. verification 的 evidence IDs 都能在 ledger 中解析。
