# Harness-Native Feature Blueprint

> 目标：把 2026 年模型能力与 Agent Harness 的最佳实践直接翻译成 WebMCP 产品能力，而不是停留在概念调研。
> 状态：**通用能力蓝图。PermitBench 的最终 P0 取舍与 contracts 以 `PRD.md`、`WEBMCP_TOOL_SPEC.md`、`HARNESS_ARCHITECTURE.md` 为准。**

---

# 1. Architecture Thesis

我们的产品不应该只是“内置一个更聪明的聊天机器人”。

更合理的架构：

```text
Human
  │
  │ shared visual workspace
  ▼
Web App ───────── authoritative state / history / constraints
  │
  │ WebMCP semantic tools
  ▼
Browser Agent / ChatGPT / Codex
  │
  ├─ planning
  ├─ reasoning
  ├─ programmatic tool calling
  ├─ multi-agent exploration
  ├─ computer-use verification
  └─ long-horizon execution
```

## Product 应负责

- authoritative state
- schemas
- identities
- permissions
- constraints
- transactions
- history
- rollback
- verification primitives
- visual collaboration

## Model / Harness 应负责

- natural language understanding
- planning
- tool selection
- decomposition
- parallel research
- reasoning
- adaptation
- visual inspection

原则：**不要重复造模型已经具备的能力，把工程资源放到模型天然不拥有的环境能力上。**

---

# 2. P0 — 比赛必须完成的 Harness-Native 功能

## F01. Dynamic Tool Scoping

### Problem

工具过多会造成 context bloat，也提高工具选择歧义。

### Design

按照当前工作上下文动态注册：

```text
home tools
workspace tools
preview tools
history tools
branch tools
```

### Implementation sketch

```ts
const controller = new AbortController();

document.modelContext.registerTool(
  workspaceTool,
  { signal: controller.signal },
);

// leaving workspace
controller.abort();
```

### Acceptance

- 任意 phase 同时 active tools 目标 <= 8。
- tool names / schemas 保持稳定。
- route/phase 切换后无关 tools 自动消失。

---

## F02. Compact State Projection

### Tools

```text
workspace_summary
search_objects
get_objects
get_current_selection
```

### Contract

- 只返回必要字段。
- 支持 `fields` projection。
- 支持 `limit` / cursor。
- 稳定排序。
- 所有对象有 `id + version`。

### Anti-pattern

禁止把以下能力当主接口：

```text
dump_entire_workspace
get_dom
get_all_state
```

---

## F03. Preview → Commit

### Flow

```text
Agent: preview_mutation(intent / operations)
App:   diff + warnings + invariant results + preview_id

[optional human approval]

Agent: commit_preview(preview_id)
App:   receipt + new_version + undo_token
```

### Preview response

```json
{
  "preview_id": "pv_...",
  "base_version": 12,
  "changes": [],
  "warnings": [],
  "requires_confirmation": false,
  "invariants": {
    "passed": true,
    "checks": []
  }
}
```

### Commit response

```json
{
  "receipt_id": "rcpt_...",
  "new_version": 13,
  "changed_ids": [],
  "undo_token": "undo_..."
}
```

### Why

- Agent 可自主规划。
- 人只在真正高风险边界介入。
- 可以阻止 hallucinated arguments 直接污染 authoritative state。
- Demo 中 diff → commit 的视觉反馈非常明确。

---

## F04. Idempotent Mutations

所有 write tools 接受：

```text
idempotency_key
expected_version
```

### Why

Agent / harness 可能发生：

- retry
- reconnect
- replay
- resume

没有幂等与版本保护容易重复写或覆盖人类刚做的修改。

---

## F05. Checkpoint + Undo

### Tools

```text
create_checkpoint
list_checkpoints
rollback_to_checkpoint
undo_receipt
```

### UI

Timeline 展示：

```text
Human edit
Agent preview
Agent commit
Checkpoint
Agent commit
Rollback
```

既是安全能力，也是很强的 Demo 视觉资产。

---

## F06. Verification Tools

### Tools

```text
verify_workspace
verify_object
get_version_diff
```

### Response

验证必须返回具体检查项：

```json
{
  "passed": false,
  "checks": [
    {
      "name": "dependency_integrity",
      "passed": true
    },
    {
      "name": "budget_limit",
      "passed": false,
      "details": "Projected cost exceeds limit by 8%."
    }
  ]
}
```

不能只返回 boolean。

---

## F07. Action Ledger

每个 mutation 记录：

```text
event_id
actor_type: human | agent
actor_label
tool_name
intent
preview_id
receipt_id
before_version
after_version
changed_ids
timestamp
```

### 用户应能直接看到

- Agent 做了什么。
- 改了哪些对象。
- 当前状态基于哪个版本。
- 是否经过 approval。
- 是否可以 undo。

---

# 3. P1 — 显著提高获奖差异化的功能

## F08. Branching Workspaces

### Goal

顺应现代 multi-agent，而不是让 subagents 同时争抢一份 mutable state。

### Tools

```text
fork_branch
list_branches
branch_summary
compare_branches
merge_branch
discard_branch
```

### Gold Demo Prompt

```text
Give me three approaches.
Optimize one for speed, one for quality, and one for cost.
Compare them and apply the best balanced option.
```

执行：

```text
fork speed
fork quality
fork cost
→ parallel work
→ compare
→ preview merge
→ commit
```

这是一个非常符合 2026 模型能力的新型 UI / state model。

---

## F09. Structured Compare

branch diff 不应只返回自然语言。

```json
{
  "dimensions": [
    {
      "name": "cost",
      "a": 120,
      "b": 90
    },
    {
      "name": "risk",
      "a": "low",
      "b": "medium"
    }
  ],
  "conflicts": [],
  "common_changes": []
}
```

这样模型可以 programmatically rank / filter。

---

## F10. Batch Read APIs

为 Programmatic Tool Calling 优化：

```text
query_objects
get_objects(ids[])
aggregate_objects
validate_operations(operations[])
```

### KPI

同一任务目标：

- DOM/micro-tool 路径：10–20 calls
- semantic/batch WebMCP 路径：目标 2–5 calls

可以在比赛 Demo / benchmark 中直接对比。

---

## F11. Risk-Aware Tool Metadata

使用 WebMCP 原生 annotation：

```ts
annotations: {
  readOnlyHint: true,
  untrustedContentHint: false,
}
```

应用层另外维护：

```text
risk: none | reversible | consequential
external_side_effect: boolean
human_confirmation: never | conditional | required
```

如果标准暂未定义这些额外字段，不应把私有字段伪装成 WebMCP 标准 annotation；放入应用内部 policy 或 tool result。

---

## F12. Abort-Safe Long Operations

所有可能较慢的 tool：

- 监听 `AbortSignal`。
- 事务 commit 前被取消，应保证无 authoritative side effect。
- 如果已经 commit，则返回 receipt，不伪装成“取消成功”。

---

# 4. P2 — 时间允许再实现

## F13. Resume Tokens

真正需要长流程时支持：

```text
start_operation
get_operation
resume_operation
cancel_operation
```

不要为了“看起来 Agentic”给简单操作套 async workflow。

---

## F14. Agent Identity & Attribution

类似 collaborative editor，区分：

- human changes
- root agent changes
- branch/subagent changes

增强“Human + Agent shared workspace”的真实感。

---

## F15. Visual Verification Mode

UI 提供清晰的最终状态视图：

- status summary
- key metrics
- visible warnings
- workspace version
- latest receipt
- verification status

目标是让 Agent 可以：

```text
WebMCP modify
→ WebMCP verify
→ visually inspect
→ finish
```

---

# 5. Tool Naming Standard

## Read

```text
inspect_*
get_*
list_*
search_*
compare_*
verify_*
```

## Non-mutating planning

```text
preview_*
validate_*
simulate_*
```

## Mutating

```text
create_*
update_*
commit_*
merge_*
rollback_*
delete_*
```

避免模糊词：

```text
manage
handle
process
do_action
operate
```

---

# 6. Tool Description Standard

推荐 description 只用 1–2 句说明：

1. 做什么。
2. 什么时候调用。
3. 如果必要，说明 side effect。

Good：

```text
Preview a set of workspace changes without modifying authoritative state.
Use before commit_workspace_changes to inspect the diff and invariant checks.
```

Bad：

```text
This extremely powerful tool allows the AI assistant to intelligently and
carefully process many different workspace-related operations...
```

---

# 7. Structured Output Rules

每个 tool response 建议包含：

```text
schema_version
workspace_id
workspace_version
```

Mutation additionally：

```text
receipt_id
changed_ids
```

分页：

```text
items
next_cursor
has_more
```

结构化错误：

```json
{
  "error": {
    "code": "VERSION_CONFLICT",
    "message": "Workspace changed after preview was created.",
    "recoverable": true,
    "suggested_action": "refresh_state"
  }
}
```

不要只 throw 一个模糊字符串。

---

# 8. Harness-Oriented State Model

推荐最小模型：

```text
Workspace
  id
  version
  title
  status

Branch
  id
  base_version
  head_version
  label

Object
  id
  version
  type
  payload

Preview
  id
  base_version
  operations[]
  diff
  checks[]
  expires_at

Receipt
  id
  preview_id
  before_version
  after_version
  changed_ids[]
  undo_token

Event
  id
  actor
  type
  receipt_id?
  timestamp
```

---

# 9. Eval Plan

项目不能只测试“tools 能不能调用”。

## E1. Tool Selection

准备至少 30 条用户意图，验证模型是否选择正确 semantic tool。

## E2. Round Trip Efficiency

记录：

- tool call count
- total result bytes
- completion time

比较：

- DOM-ish / micro-tool flow
- semantic WebMCP flow

## E3. Mutation Safety

测试：

- duplicate retry
- stale version
- cancelled preview
- commit twice
- undo twice

## E4. Long-run Recovery

中途 reload / reconnect 后验证：

- authoritative state 是否一致。
- receipt 是否存在。
- Agent 能否 read-back 后继续。

## E5. Multi-agent Branch Isolation

不同 branch 的修改不能互相污染。

## E6. Human-Agent Collaboration Race

测试：

```text
Human edit
→ Agent read version 12
→ Agent creates preview on version 12
→ Human changes workspace to version 13
→ Agent commit old preview
```

正确结果：`VERSION_CONFLICT`，不能静默覆盖人类修改。

---

# 10. Competition Demo Gold Path

最终 3 分钟视频可以围绕以下故事：

```text
1. Human 打开一个复杂 workspace。

2. 用户给 Agent 高层目标，而不是操作步骤。

3. Agent 用 WebMCP summary + search 快速理解状态。

4. Agent fork 2–3 个方案（P1 完成时）。

5. Agent compare / verify。

6. Agent preview 最优方案。

7. UI 显示结构化 diff + warnings。

8. Agent commit。

9. UI 即时更新，并出现 receipt / timeline。

10. 用户说 “Actually undo that one part” 或 “Go back to the checkpoint.”

11. Agent 精确 rollback。

12. 最终 structured verify + visual check。
```

这条故事线能同时体现：

- WebMCP leverage
- execution quality
- human-agent experience
- harness awareness
- safety / reliability
- originality

---

# 11. 开发优先级

## P0

- [ ] WebMCP registration lifecycle
- [ ] workspace summary / search / get
- [ ] stable IDs + versions
- [ ] preview mutation
- [ ] commit mutation
- [ ] receipts
- [ ] undo / checkpoint
- [ ] verification tools
- [ ] action ledger UI
- [ ] dynamic tool scoping
- [ ] basic eval harness

## P1

- [ ] branches
- [ ] structured branch compare
- [ ] branch merge preview
- [ ] batch query / aggregate
- [ ] risk metadata
- [ ] abort-safe execution tests
- [ ] visual verification dashboard

## P2

- [ ] resume token / async operations
- [ ] agent identity attribution
- [ ] multi-agent-specific UX polish

---

# 12. 核心验收指标

在真正提交前至少做到：

| 指标 | 目标 |
|---|---|
| 同时 active WebMCP tools | <= 8（典型 phase） |
| 普通复杂任务 semantic tool calls | 2–5 为目标 |
| mutation 是否都有 preview/receipt | 100% consequential writes |
| retry 幂等性 | 100% |
| stale version 防覆盖 | 100% |
| rollback/checkpoint 可恢复 | 100% tested golden flows |
| verification | 每个 gold flow 都有 structured verify |
| action provenance | 所有 mutation 可追溯 |
| branch isolation | 不允许 cross-branch state leak |
