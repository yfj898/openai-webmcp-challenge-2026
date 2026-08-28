# PermitBench Demo Plan

> Video target：**2:50**，hard maximum <3:00。  
> Audience：没有使用过 PermitBench、可能不了解 IAM 的 WebMCP Challenge judge。  
> One message：**Human 与 Agent 共同证明并激活完成一个 job 所需的最小工具面。**

## 1. Demo thesis

三分钟内只证明一件事：

```text
Agent proposes authority
→ deterministic environment tests it
→ Human approves an exact visible diff
→ WebMCP tool surface changes to that authority
→ Agent completes one real sandbox task
→ system verifies and issues a receipt
```

不解释通用 IAM、不展示 settings、不展示第二场景、不讲多 Agent framework。

## 2. Killer scenario

一个 SaaS 团队准备上线 Refund Support Agent。当前 ticket `T-1042` 要对损坏订单 `ORD-8821` 退款 USD 42.80。Agent 需要：

-读取这个订单；
-读取 shipment status；
-只对这个 order/ticket 发起不超过组织上限的 USD refund。

Agent 不应：

-退款 USD 120；
-对其他 order 退款；
-批量导出 customer PII；
-修改 user role；
-因 retry 重复退款。

这个例子同时满足：每个人都懂、资金风险直观、参数级约束可见、结果可确定性验证。

## 3. Wow moment

Human 点击 Approve 后：

1. exact policy commit；
2.页面 header 从 `Review v15` 变为 `Execution v16`；
3.真实 Tool Surface Inspector 里的 branch/simulation/preview tools 消失；
4.只出现获批的 `lookup_order`、受限 `issue_refund`、`verify_task_outcome`；
5. Agent 立即用这组工具完成 USD 42.80 refund；
6. receipt 展示 USD 120、PII export、role change 与 duplicate effect 均被 deterministic checks 拒绝。

一句旁白：

> “The approval didn’t just update a dashboard. It changed what the agent can discover and do.”

## 4. Timeline and shot list

| Time | Visual | Agent / Human action | Voiceover purpose |
|---|---|---|---|
| 0:00–0:12 | 支持 Agent 旁边是一组 broad permissions：Refund any amount、Export customers、Change roles；红色 blast radius | none | Pain：今天的 Agent approval 在 “too weak / too powerful” 之间盲选 |
| 0:12–0:28 | 5 秒 UI-only replay：browser agent 在 permission toggles 中点击；一个 label shift/no exact evidence；画面叠字 “Clicks ≠ proof” | scripted UI-only clip | 普通 browser automation 能操作界面，但不能稳定证明 job fit/version/negative constraints |
| 0:28–0:38 | PermitBench clean workspace；左侧 ticket/constraints，空 Branch Board，右下 Tool Surface Inspector 显示 4 explore tools | Human 打开 app | Product reveal；Human 与 Agent 共享可见 structured state |
| 0:38–0:47 | ChatGPT prompt 可见 | Human：“Give this support agent the minimum permissions it needs. Prove it with every test before asking me to approve.” | Outcome，不给模型底层步骤 |
| 0:47–1:03 | audit pulse：`get_workspace_summary`；strict/balanced/broad cards 依次出现 | Agent calls `propose_policy_branch` ×3 | WebMCP semantic action 直接产生 UI state |
| 1:03–1:27 | 三 cards 显示 tests：Strict 2/3 utility；Balanced 3/3 + 5/5 safety；Broad 3/3 + 2/5 safety；红色失败展开 | Agent calls `simulate_policy_branch` ×3 | positive + adversarial proof；不是 LLM 自评 |
| 1:27–1:40 | Compare panel：capability diff、write count、wildcards、failed probes；Balanced rule-based recommended | `compare_policy_branches` | 一眼解释 trade-off；branch 的真实价值 |
| 1:40–1:55 | Preview panel：exact add list、refund limit/order/ticket binding、8 checks、tool surface after、v15/hash | `preview_policy_activation` | Authority write 之前先看 exact result |
| 1:55–2:04 | Agent 等待；Human 点击唯一的 Approve；approval badge 显示 Human / exact hash | Human gesture | Agent 不能自批；Human control |
| 2:04–2:17 | `commit_policy_activation`；header v16；Tool Surface Inspector 平滑换成 4 execution tools | Agent commit | **Wow moment**：approval 真正改变 Agent 的可发现/可执行能力 |
| 2:17–2:33 | Order card 高亮 42.80；Refund ledger 新增一条 completed record | `lookup_order`, `issue_refund` | 不是 policy slide：Agent 用批准权限完成 job |
| 2:33–2:46 | Receipt drawer：Task complete、3/3 positive、5/5 safety、write count 1、policy v16、Undo | `verify_task_outcome` | structured read-back，非 “Done” |
| 2:46–2:55 | 简洁 end card + architecture sentence | none | Why WebMCP / impact / tagline |

目标 2:55 以内；YouTube upload 后再次核对实际显示时长。

## 5. Exact Human prompt

```text
Give this refund support agent the minimum tool permissions it needs for the current
ticket. Create distinct strict, balanced, and broad alternatives. Test each against
every required task and safety probe, compare them, and stop before activation so I
can review the exact change.
```

Approval 后：

```text
The balanced preview is approved. Activate that exact version, complete the current
refund, and verify the result from the workspace ledger.
```

不要提示 exact tool names；Agent 必须通过 WebMCP discovery 选择。

## 6. English voiceover draft

### 0:00–0:28 — Pain / baseline

> “When an AI agent needs production tools, teams usually choose between two bad options: grant too little and the job fails, or grant too much and the blast radius explodes. A browser agent can click permission toggles, but clicks do not prove that a policy completes the job, blocks dangerous alternatives, or still matches the version a human reviewed.”

### 0:28–0:47 — Product

> “PermitBench is a shared permission decision workspace for an AI platform security engineer and an agent. This page exposes four semantic WebMCP tools for the current exploration phase—not a generic DOM and not every possible action.”

### 0:47–1:27 — Branch and simulate

> “I ask for the minimum permissions. The agent reads the same task and constraints I see, then creates three isolated proposals. PermitBench runs deterministic positive tasks and adversarial probes. Strict cannot issue the required refund. Broad completes it, but also permits excessive refunds, customer export, and role changes. Balanced completes every required task and blocks every probe.”

### 1:27–2:04 — Compare / approval

> “The comparison is rule-based: first satisfy the job, then minimize blast radius. The agent previews the exact activation—one order, one ticket, US dollars, and a seventy-five-dollar ceiling. The preview is bound to this workspace version and hash. The agent cannot approve itself, so it stops. I approve exactly what is visible.”

### 2:04–2:33 — Wow / execute

> “Now watch the tool surface. The approval didn’t just update a dashboard. It changed what the agent can discover and do. Design tools disappear. Only the approved lookup, constrained refund, and verification tools remain. The agent reads order 8821 and refunds forty-two dollars and eighty cents.”

### 2:33–2:55 — Verify / close

> “PermitBench reads the ledger back and issues a structured receipt: the task completed, the amount stayed inside the approved limit, high-risk capabilities remained unavailable, and a retry cannot duplicate the refund. Existing browser agents operate interfaces. PermitBench lets humans and agents safely decide and prove the authority underneath the work.”

Approximate words：约 290；录音目标 105–115 wpm，按试录删减至 2:50。

## 7. On-screen copy

避免 IAM 术语优先，用以下短文案：

| Technical concept | Main UI copy | Detail/tooltip |
|---|---|---|
| positive task coverage | Can finish the job | 3 of 3 required tasks passed |
| negative probes | Cannot overreach | 5 of 5 unsafe requests denied |
| blast radius | Reach | write tools / resources / limits |
| policy branch | Permission option | isolated proposal, not active |
| preview hash | Exact version reviewed | content + state version binding |
| idempotency | Safe to retry | same request returns same receipt |
| verification | Proved from workspace | deterministic ledger checks |

Primary branch labels：

- Strict — “Too little”
- Balanced — “Just enough”
- Broad — “Too much”

## 8. Visual direction

- background 简洁、不要赛博安全 clichés；
- Human-owned state 用 neutral/blue；Agent proposal 用 violet；authoritative commit 用 green；denial 用 red + icon/text；
-三 branch cards 在一屏并列；
- simulation results 只显示关键失败，details 可展开；
- Tool Surface Inspector 始终在画面下方/右下，确保 wow 可见；
- timeline 用 real tool names；不要显示内部 chain-of-thought；
-版本号、preview hash 只显示短格式，hover 才全量；
- receipt 用 check list + evidence IDs，避免一屏 JSON。

## 9. Proof that WebMCP is real

视频中至少同时出现三项：

1. Tool Surface Inspector 来自 `document.modelContext.getTools()`，不是 hardcoded list；
2. Agent tool call name 与 request ID 在页面 audit timeline 中出现；
3. `propose_policy_branch` 调用直接生成可见 branch card；
4. approval/commit 后 registry list 实时变化；
5. `issue_refund` handler 的 policy denial/receipt 可见。

不打开 DevTools 讲代码，不浪费主视频时间。README/补充截图提供 implementation link。

## 10. Baseline clip rules

UI-only baseline 必须公平：

-同一页面、同一可见信息；
-不故意移动控件制造失败；
-只展示它固有的步骤/语义问题；
-不要写“Browser agents always fail”；
-旁白用 “can click, but does not get stable domain contracts by default”；
-若 A/B eval 未证实 failure-rate 差异，只说 semantic/version evidence，不说量化提升。

## 11. Recovery path clip

主视频时间不足时不完整展示，但准备 15–20 秒备选/README GIF：

```text
Preview at v15
→ Human edits refund ceiling
→ old commit call returns STALE_VERSION, zero writes
→ Agent reads changed-since
→ new preview + approval
→ commit succeeds
```

若主线录制只需 2:35，可在 2:33–2:46 用 stale recovery 取代部分 receipt details；否则保留 receipt，更易理解。

## 12. Recording protocol

1. freeze build hash、fixture hash、model/client info；
2. clean test account /无私人 tabs；
3. reset workspace 并核对 v12 / no refunds；
4.先做一次 rehearsal，不录；
5.正式 capture 必须来自一个真实连续 run；可裁剪等待，不重排因果；
6.录 2 个成功 takes；
7.单独录 clean voiceover，补英文 captions；
8. export 1440p，检查文字可读；
9.加速片段清楚标 `2×`；
10. public YouTube upload；无登录窗口复查画质、音频、字幕、时长。

## 13. Failure contingencies

| Failure during recording | Response |
|---|---|
| Agent branch manifest invalid | structured error 可保留一次（证明恢复），第二次仍失败则重录，不现场改数据 |
| toolchange discovery慢 | UI 显示真实 “Refreshing agent tools”；等待；不得硬切到假 list |
| model 选错 branch | 允许 compare rule correction；超过 8 秒或解释复杂则重录 |
| commit timeout | 用同 idempotency key retry，展示 same receipt；可成为 reliability proof |
| refund already exists | workspace reset 未成功；停止并修 reset，不改 ledger |
| YouTube 显示 3:00 |重新 export 2:50；不赌平台计时 |
| live URL down |切备用 deployment；视频仍必须显示实际 functioning build |

## 14. End card

```text
PermitBench
Prove the agent can finish the job—without granting the world.

Human-visible state · WebMCP semantic tools
Branch · Simulate · Approve · Activate · Verify
```

底部小字：`Sandbox demo · Tested in Challenge-supported WebMCP environments`。

## 15. Demo gate

- [ ] 20 秒内 pain 清楚；
- [ ] 40 秒内出现 WebMCP；
- [ ] Agent 与 Human 操作同一可见 workspace；
- [ ] branches 是隔离 proposal，不是三段文本；
- [ ] positive + negative deterministic tests 可见；
- [ ] Human approval 是独立 gesture；
- [ ] approval 后实际 tool registry 变化；
- [ ] constrained business write真实进入 sandbox ledger；
- [ ] receipt 从 read-back evidence 生成；
- [ ]没有“universally safe”过度承诺；
- [ ]视频 <3:00、公开、英文音频/字幕；
- [ ]陌生观众能复述 Why WebMCP。
