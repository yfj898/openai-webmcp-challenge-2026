# PermitBench Build Plan

> Implementation snapshot — 2026-08-28: the local P0 product, deterministic domain tests, WebMCP registry contract tests, production build, and Chromium happy-path/recovery E2E are complete. `vercel.json` is ready. External Vercel publication, deployed-origin ChatGPT smoke testing, video recording, repository publication, and Devpost submission remain release actions and are not marked complete.

> Planning timezone：Asia/Shanghai / UTC+8  
> Official hard deadline：**2026-09-04 04:00 UTC+8**（2026-09-03 13:00 PT）  
> Internal submission freeze：**2026-09-03 18:00 UTC+8**，保留 10 小时上传/平台缓冲。  
> Core build budget：5 days；buffer：约 1.5 days。

## 1. Critical path

```text
product freeze
→ deterministic domain/state engine
→ WebMCP register/call/toolchange smoke
→ branch/simulate/compare UI
→ preview/approval/commit
→ active-policy execution + verify/receipt/undo
→ target-client reliability
→ eval + polish
→ deploy
→ record/submission
```

不在 critical path：真实 provider integrations、Responses subagents、第二 task pack、generic policy DSL、cloud auth、多租户。

## 2. Master schedule

| Phase | Target window | Budget | Exit condition |
|---|---|---:|---|
| 0 — Product freeze | Aug 27 | 0.25 d | PRD/tool spec/fixture frozen；kill trigger written |
| 1 — Core workspace | Aug 28 AM–PM | 0.75 d | reset → three branches → deterministic simulations works locally |
| 2 — WebMCP tools | Aug 28 PM–Aug 29 AM | 0.75 d | register/discover/call/unregister works in target client |
| 3 — Agent integration | Aug 29 | 0.5 d | Agent completes explore/compare path without DOM clicking |
| 4 — Transactions + verification | Aug 30 | 0.75 d | approval/commit/refund/verify/undo + stale/duplicate tests pass |
| 5 — UI polish | Aug 31 AM | 0.5 d | 3-minute narrative visible without developer explanation |
| 6 — Evaluation | Aug 31 PM–Sep 1 AM | 0.5 d | deterministic benchmark + small A/B report complete |
| 7 — Deployment | Sep 1 | 0.25 d | clean URL works in challenge clients after fresh reset |
| 8 — Demo | Sep 2 | 0.5 d | final public YouTube <3 min + backup capture |
| 9 — Submission | Sep 3 before 18:00 | 0.25 d | Devpost submitted and independently rechecked |
| Buffer | Sep 2 PM–Sep 4 04:00 | ~1.5 d | client/platform/video failure only；不扩功能 |

## 3. Phase 0 — Product freeze

### Goal

消除会改变架构的产品模糊点；把所有扩张冲动变成 P1/P2。

### Deliverables

- `FINAL_PRODUCT_DECISION.md`；
- `PRD.md`；
- `WEBMCP_TOOL_SPEC.md`；
-确定正式 public source repository 并开始保存 competition-period dated history；当前 workspace 经 `git status` 验证不是 Git repository，初始化/选址需由项目负责人明确执行；
- seeded support-refund fixture v1；
- capability IDs、constraints、8 个 tests/probes；
- exact P0/non-goals；
- kill criteria 与 fallback decision。

### Acceptance criteria

-参赛个人/团队/组织的 residence/domicile 与 supported-country 条件已由负责人对照 live Official Rules 明确确认；
-正式工作目录处于 Git history 中，未来可公开并添加 top-level open-source license；
-一句话能说清 Persona/job/WebMCP necessity；
- strict/balanced/broad 预期结果无歧义；
-所有 10 tools 有 contract；
-没有 unresolved P0 product choice；
-最终截止时间按 Devpost 13:00 PT。

### Blockers / decision

- **Administrative blocker**：若参赛主体资格未确认，立即向 Devpost/OpenAI 求证；产品研究仍有效，但不得把“可提交”写成已确认；
- Blocker：动态 tool scope 官方/客户端行为未知；
- Action：不在 Phase 0 讨论，Phase 2 做最早 smoke；失败即 kill，不把高风险验证拖到 UI 完成后。

## 4. Phase 1 — Core workspace

### Goal

先构建与模型/浏览器无关的 authoritative domain kernel；任何 UI/tool 都只是它的 adapter。

### Deliverables

- React/Vite/TypeScript app skeleton；
- IndexedDB schema/migrations + fixture reset；
- domain types：Workspace、Branch、Simulation、Preview、PolicyVersion、Receipt、AuditEvent、RefundRecord；
- deterministic policy matcher 与 test runner；
- branch create/edit/simulate/compare service；
-基础三栏 UI 与 tool-surface placeholder；
- unit tests for all constraints。

### Acceptance criteria

- clean reset 固定得到相同 fixture hash；
- strict = positive 2/3, safety 5/5；
- balanced = positive 3/3, safety 5/5；
- broad = positive 3/3, safety 至少 3 项失败；
- unknown capability/wildcard/invalid amount fail closed；
- branch edit increments revision and invalidates simulation；
- refresh 恢复 branches/results；
- UI action 与直接 domain call 产生相同 state/audit。

### Blockers

- Schema 过度通用：立即收窄为 fixture capability union；
- IndexedDB transaction API 不熟：用 Dexie；不要换后端；
- UI 动画拖慢：先只做静态 cards/status。

## 5. Phase 2 — WebMCP tools

### Goal

尽早关闭最大平台风险：目标客户端能否稳定发现、调用并观察 phase-scoped tools。

### Deliverables

- WebMCP capability detection/setup banner；
- tool registry adapter；
- 10 tool specs 代码化；
- explore-phase 4 tools 完整接 domain service；
- phase controller / AbortController register-unregister；
- Tool Surface Inspector 读取实际 registry；
- structured success/error envelope；
- ChatGPT Desktop 与 Chrome 149 smoke log。

### Acceptance criteria

- register → discover → call → visible UI update；
- explore phase 无 `commit_policy_activation` / `issue_refund`；
- phase change 后旧 tool 注销、新 tool 可发现；
-直接调用 stale handler 仍由 phase/policy 拒绝；
- invalid arguments/schema-valid domain-invalid 均返回 structured errors；
-取消 simulation 不产生 false success；
-两条 challenge-supported path 至少一条主线稳定，另一条有明确已知差异。

### Blockers / kill checkpoint

- **Kill**：无法稳定展示 approval 后 tool surface 收窄并 enforce；
- Client `toolchange` 延迟：只在 transaction boundary 切换，并加入明确 “Refreshing agent tools” state；仍不可靠则 kill；
- API signature 变化：薄 adapter 隔离 draft differences；不把 draft details散落业务代码。

## 6. Phase 3 — Agent integration

### Goal

让真实 Agent 完成 explore → branch → simulate → compare，且无需 DOM clicking 或内嵌 chat。

### Deliverables

- polished tool descriptions / examples；
- compact workspace projection；
- Agent demo prompt v1；
- run-status indicators；
- actual WebMCP trace capture；
- selected-branch → review transition。

### Acceptance criteria

- clean workspace 中 Agent 自主调用 summary、创建 3 branches、模拟并比较；
-不自造 capability ID；
-正确推荐 balanced；
- tool outputs 没有 full workspace dump；
-三次 run 至少 2 次无需人工纠错；
-失败能从 structured error 恢复，或明确停下等待 Human。

### Blockers

- Agent manifest 不稳定：提供 catalog IDs 与严格 schema，不硬编码 reasoning tree；必要时给一个 concise manifest example；
- 模型一次只创建一个 branch：可接受顺序执行；P0 不依赖并行；
- latency：simulation 在本地纯代码，目标每 branch <300ms。

## 7. Phase 4 — Transactions + verification

### Goal

完成权限决策到受限业务动作的权威闭环与 recovery path。

### Deliverables

- preview generation/hash/expiry；
- visible Human approval record；
- atomic commit + policy history；
- idempotency ledger；
- `lookup_order`, `issue_refund` runtime enforcement；
- `verify_task_outcome` + receipt；
- Human-armed undo + compensating policy version；
- stale/duplicate/abort/integrity tests。

### Acceptance criteria

-无 approval commit = deny；
- approval 绑定 exact preview hash；
- stale version/branch/catalog = deny；
- commit timeout + same key replay = one policy version；
- refund duplicate same/different keys = one completed record；
- wrong order / USD 120 / wrong currency = zero write；
- verify read-back 与 ledger一致；
- undo 保留 history/receipt、移除 execution tools；
- clean end-to-end 连续 3 次成功。

### Blockers

- IndexedDB atomicity/async lifecycle bug：先完成 domain transaction integration tests，再接动画；
- approval UX 被 Agent误触：approval 不注册为 tool，只接受 `isTrusted` Human UI event + demo role；
- receipt内容太多：主 drawer 只显示 outcome/checks/version，JSON 展开可选。

## 8. Phase 5 — UI polish

### Goal

让未了解 IAM/WebMCP 的评委不读文档也能理解“为什么 balanced 胜出、批准后发生了什么”。

### Deliverables

- clear pain-state empty screen；
-三 branch cards + utility/safety bars；
- exact diff/check list；
- before/after tool surface animation；
- timeline + receipt drawer；
- visible sandbox/coverage labels；
- keyboard/contrast/viewport basics；
- 5 人 comprehension test。

### Acceptance criteria

- 4/5 能复述用户/job；
- 4/5 能解释 positive + negative proof；
- 4/5 注意到 tools 收窄；
- 3/5 在 60 秒内选对 balanced；
-主 workflow 在 1440×900 与录屏分辨率无滚动迷失；
-所有 errors 用 domain language，不显示 stack trace；
-操作状态不只用红/绿色区分。

### Blockers

-三列信息过载：默认展示 headline score + failing probe，details on expand；
- security术语过多：使用 “Can finish / Cannot overreach” 主文案，least privilege 仅在 ending；
-动画不稳定：删除动画，不删除真实 tool inspector。

## 9. Phase 6 — Evaluation

### Goal

获得最小、真实、可公开的可靠性证据；验证 claims 而非追求论文规模。

### Deliverables

- B01–B10 deterministic result matrix；
- UI-only vs WebMCP 每 task 最少 3 runs（时间不足先 B01/B03/B08/B10）；
- dynamic vs static tool scope optional ablation；
- traces + CSV/Markdown summary；
- failure taxonomy / limitations；
-最终 submission claim。

### Acceptance criteria

-产品 correctness gates 全过；
-没有 excluded failure 被隐藏；
-所有 percentages 带 numerator/denominator；
-模型/client/date/fixture hash 可复现；
-若 comparative target 未达到，更新文案，不伪造 improvement；
- representative demo run 与 benchmark 结果一致。

### Blockers

- computer-use harness 不稳定：缩为 4 个高价值 paired tasks，人工审计 action trace；
- token不可得：标 N/A，不估算；
-时间不足：优先 correctness/invariants，而非 comparative statistics。

## 10. Phase 7 — Deployment

### Goal

部署一个在评审期持续可访问、可 reset、无账号障碍的 functioning app。

### Deliverables

- Cloudflare Pages/Vercel HTTPS URL；
- production build；
- clean-reset query/button；
- capability/setup instructions；
- health/version footer；
-公共 source repo + LICENSE + setup README；
-评审期可用性检查表。

### Acceptance criteria

-新设备/clean browser 打开即用；
-没有 API key、login、payment；
- ChatGPT Desktop 与 Chrome path 均从 live URL smoke；
- refresh/route/reset 正常；
- bundle 无 secrets；
- source maps/console 无 PII；
-评审窗口结束前不自动过期。

### Blockers

- host headers/CSP 阻止 WebMCP：部署首小时检查并修复；
- CDN cache stale：显示 build hash，固定 invalidation runbook；
- origin trial/token requirement 变化：按 challenge 官方 path 配置，不做广泛 browser promise。

## 11. Phase 8 — Demo

### Goal

用 2:40–2:55 的视频自足证明 pain、WebMCP leverage、wow moment、verification 与 impact。

### Deliverables

- final English script + captions；
- clean seeded capture；
- 1440p source/master；
-公开 YouTube upload <3 min；
-无第三方受限音乐/素材；
- backup local video + thumbnail/screenshots。

### Acceptance criteria

- 0:40 前出现 WebMCP 对比；
- 1:40 前 branches/simulations 结果可见；
- 2:20 前 Human approval + actual tool contraction；
- 2:45 前 refund + verification receipt；
-结尾说清 specific user 与 why WebMCP；
-陌生 reviewer 无声看字幕也能理解；
- YouTube 实际显示时长 <3:00、public、可播放。

### Blockers

- live model nondeterminism：使用经过验证的单次真实 run 连续录制；不得剪接成不可能状态；准备第二 take；
-客户端 UI 泄露私人账号：用 challenge/test account，裁掉无关区域；
-视频上传/处理慢：Sep 2 完成，不留到截止日。

## 12. Phase 9 — Submission

### Goal

在 internal freeze 前完成可验证、英文、规则合规的 Devpost submission。

### Deliverables

-英文 title/tagline/description；
-明确 Human 能做什么、Agent 能做什么、WebMCP 如何实现；
- public repo + top-level license；
- live URL；
- public YouTube <3 min；
- screenshots；
- eligibility/time-stamp evidence；
-最终 checklist 双人复核或隔 30 分钟自复核。

### Acceptance criteria

- Devpost 显示 submitted；
-所有 links 用无登录窗口打开；
- README 复现路径与 live build一致；
-英文或英文翻译完整；
-没有把 app-level transaction 宣称为 WebMCP native；
-没有把 sandbox demo 宣称 production IAM/security；
-提交确认截图/邮件保存。

### Blockers

-平台字段/上传失败：内部 freeze 预留 10 小时；
-最后一分钟 feature：一律拒绝；只修 blocker；
-截止事实变化：实时 Devpost Rules 为控制来源。

## 13. Verification matrix by phase

| Capability | Unit | Integration | Target client | Demo |
|---|---:|---:|---:|---:|
| branch isolation | ✓ | ✓ | ✓ | visible |
| deterministic simulation | ✓ | ✓ | via tool | visible |
| dynamic registration | adapter test | ✓ | **mandatory** | wow |
| preview/version/hash | ✓ | ✓ | via tool | visible |
| Human-only approval | ✓ | ✓ | **mandatory** | visible |
| idempotent commit/refund | ✓ | ✓ | retry smoke | receipt |
| policy enforcement | ✓ | ✓ | over-limit smoke | result |
| verification/receipt | ✓ | ✓ | via tool | visible |
| undo | ✓ | ✓ | armed smoke | optional end |
| refresh/reset | — | ✓ | live URL | pre-record |

## 14. Scope cuts

### If one day behind

- cut optional branch editor；
- use fixed three labels/layout；
- cut subagent experiment；
- cut second client beyond required primary + minimal secondary smoke；
- keep all transaction/reliability features。

### If only 48 hours remain

Keep：

- seeded refund fixture；
- Agent-created three branches；
- deterministic simulation/compare；
- preview + Human approve + commit；
- dynamic tool contraction；
- order lookup + constrained refund；
- verification receipt + undo；
- live URL + <3 min video。

Cut：

- free-form branch editor；
- Responses automated eval（改为 4 个 manual paired tasks）；
- tool-surface animation（保留真实 list）；
- rich timeline filters/JSON export；
- second scenario；
- multi-agent；
- PTC/background/WebSocket；
- cloud persistence/auth；
- marketing site。

### Never cut without pivot

- Human 与 Agent 看同一 state；
- branch trade-off；
- deterministic negative probes；
- exact preview + Human approval；
- dynamic WebMCP tool change；
- handler enforcement；
- verification/receipt。

## 15. Daily stop/go

每天结束只问五个问题：

1. clean happy path 今天能跑多远？
2. 新代码是否让 killer flow 更可靠或更清楚？
3. 最大未关闭风险是否前移验证？
4. 是否新增了 P0 之外的基础设施？若是，删除或移 P1。
5. 如果今晚必须录视频，当前最先失败在哪里？明天第一小时修它。

## 16. Owners

若单人：所有 owner 为项目负责人，但每阶段保留独立验收 checklist。若 2–3 人：

| Workstream | Suggested owner | Merge/decision owner |
|---|---|---|
| Domain + transactions + tests | Engineer A | Product/tech lead |
| WebMCP + target-client QA | Engineer B | Tech lead |
| UI + demo + submission | Product/Design C | Product lead |

任何人都不能在没有 domain tests 的情况下用 UI workaround 改变 authority semantics。
