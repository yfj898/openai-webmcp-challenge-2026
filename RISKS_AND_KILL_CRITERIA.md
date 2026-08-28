# PermitBench Risks and Kill Criteria

> Review cadence：每个 build phase exit；提交前每天重查 collision/platform risks。  
> Principle：风险不是 footnote。触发 kill 条件后，停止 sunk-cost rationalization。

## 1. Top three risks

### R0 — 参赛主体资格未确认（独立于产品风险）

- **Type**：Administrative / eligibility
- **Likelihood**：Unknown
- **Impact**：Critical / submission-blocking
- **Evidence**：Official Rules 要求 supported-country 条件，并排除若干个人 residence / organization domicile，包括中国大陆与香港等；当前 workspace 时区不构成法律 residence/domicile 证据。[Devpost Rules](https://webmcp.devpost.com/rules)
- **Mitigation**：负责人立即按实际个人/团队/组织身份核对 live Rules；有歧义直接书面询问 Devpost/OpenAI；不得通过虚假地址或名义主体规避。
- **Gate**：未确认资格，不得声称 “eligible/ready to submit”。这不改变 PermitBench 的产品 Winner 决策，但会阻断本次比赛提交。

### R1 — Dynamic WebMCP tool lifecycle 不稳定

- **Type**：Platform / execution
- **Likelihood**：Medium
- **Impact**：Critical
- **Evidence**：WebMCP 规范确认 register/unregister/`toolchange`，但 ChatGPT Desktop 的发现延迟、并发注销、错误 UI 没有公开稳定契约；Chrome 149 仍是 origin trial。
- **Why critical**：approval 后 tool-surface change 是核心 wow 与 necessity proof；没有它，产品会退化为 permission dashboard。
- **Earliest test**：Phase 2，live target client 的 register → discover → call → unregister → rediscover。
- **Mitigation**：imperative API only；同 origin；thin adapter；只在 transaction boundary 换 phase；handler fail closed；Chrome/ChatGPT 双 smoke。
- **Kill**：Phase 2 结束时，至少一个官方 challenge environment 不能连续 3 次正确发现收窄后的 tools 并实际 enforce。

### R2 — 撞题 / novelty 被 ScopeGate、Opal 或 Devpost submission 吞没

- **Type**：Product / competition
- **Likelihood**：Medium
- **Impact**：High
- **Evidence**：ScopeGate 已做 per-action MCP permission gateway；Opal Paladin 已做 AI access decisions；AWS sample 已做 AI policy generation/analysis。Devpost gallery 尚未公开。
- **Why critical**：若评委只看到“Agent permissions”，会把项目归类为已有 gateway/UI。
- **Mitigation**：始终展示完整组合差异：job-specific branches + positive/negative proof + exact activation + dynamic tool surface + constrained execution + receipt；每日 gallery/keyword sweep。
- **Kill**：出现相同完整 killer flow（不只是同主题），且 6 小时内不能用真实功能而非文案区别。

### R3 — 三分钟理解成本过高

- **Type**：Demo / market communication
- **Likelihood**：Medium
- **Impact**：High
- **Evidence**：least privilege、MCP、policy simulation、version-bound approval 都是技术概念；评委可能只看视频。
- **Why critical**：即使实现优秀，也可能看成基础设施 demo。
- **Mitigation**：退款这一普适 job；主 UI 用 “Can finish / Cannot overreach”；三张卡明确 “Too little / Just enough / Too much”；先 Demo 后架构；5 人试映。
- **Kill**：5 人试映中至少 3 人看完 60 秒仍无法说出“balanced 为什么胜出”或 “Human 批准了什么”。

## 2. Risk register

| ID | Risk | L | I | Early warning | Mitigation | Owner | Release gate |
|---|---|---:|---:|---|---|---|---|
| R0 | 参赛 residence/domicile/supported-country 资格未确认 | ? | Critical | 无书面/规则依据确认 | 立即对照 live Rules；必要时问 Devpost/OpenAI | Entrant representative | submission blocker |
| R1 | WebMCP dynamic registry 不稳定 | M | Critical | toolchange 延迟、旧 tool 仍可调用 | early smoke、phase boundary、handler check、thin adapter | WebMCP engineer | hard kill |
| R2 | 同主流程 competitor/submission | M | H | gallery/Showcase/search 出现 branch simulator | daily sweep、feature-by-feature compare、pivot clock | Product | hard kill if full collision |
| R3 | Demo 不易懂 | M | H |试映无法复述、术语问题多 | refund wedge、plain copy、删 feature | Product/Design | comprehension gate |
| R4 | Simulator 被误解为通用安全证明 | M | H |文案出现 “safe agent” / coverage未知 | explicit task-pack scope、coverage badge、unknown fail closed | Product/Security | zero overclaim |
| R5 | Simulator 本身逻辑错误 | L–M | Critical | broad/strict 得分异常、oracle不一致 | pure predicates、table tests、golden fixtures、mutation scan | Domain engineer | B01–B10 100% |
| R6 | Approval 可被 Agent伪造 | L | Critical | tool/input 能写 actor/approval | Human UI only、session actor、hash binding、no approval tool | Domain engineer | security test |
| R7 | Registry 被当 security boundary | M | Critical | stale handler 仍写、direct execute bypass | every handler checks phase/active policy/version | Domain engineer | bypass tests |
| R8 | Duplicate refund/commit | M | H | timeout 后出现双 record | idempotency ledger、unique business key、same receipt replay | Domain engineer | exactly one write |
| R9 | Stale approval commit | M | H | Human edit 后旧 preview 仍 enabled | version/revision/hash/expiry checks、invalidate UI | Domain engineer | 100% stale deny |
| R10 | IndexedDB corruption/quota/reset | L–M | H | refresh丢 state、fixture不一致 | schema migration、integrity check、reset/export、small data | Frontend | 3 refresh cycles |
| R11 | Client/model nondeterminism | M | H | Agent不建三 branches/选错 | strict schemas、concise descriptions、single-agent、2 recorded takes | Agent integration | 3-run threshold |
| R12 | Model outputs malicious/free-form policy | M | H | unknown capability、code/string wildcard | immutable catalog、typed manifest、no executable policy | Domain engineer | fail-closed tests |
| R13 | Ticket prompt injection | M | H | ticket asks Agent绕过 constraints | untrusted hint、field minimization、constraints separate、handler enforcement | Security | injection probes |
| R14 | App看似 mock | M | H | branch卡预制、tool list hardcoded、no ledger | real WebMCP calls、getTools inspector、domain transactions、trace IDs | Product/Engineering | video proof gate |
| R15 | Sandbox被误称 production | M | H | marketing写 “secure your production agents now” | visible sandbox label、honest limitations、P2 integrations | Product | copy review |
| R16 | Scope expands to gateway/IAM | H | H |新增 OAuth/provider/OPA connector | P2 list、48h cut policy、PRD freeze | Owner | no P0 connector |
| R17 | UI polish挤压 reliability | H | H | Phase 4未过却做动画 | critical path、never-cut list、phase exits | Owner | no Phase 5 early |
| R18 | Evaluation不公平/样本太小 | M | M | UI baseline故意差、只展示最好 run | paired controls、all traces、n/N、limitations | Eval owner | protocol review |
| R19 | Chrome/ChatGPT support变化 | M | H | build/flag/API behavior变化 | daily official check、two clients、record build info | WebMCP engineer | live smoke pre-submit |
| R20 | Public URL/CSP/cache失败 | L–M | H | local works/live fails | early deploy、HTTPS/same origin、build hash、backup host | Deploy owner | clean-device smoke |
| R21 | Deadline/Devpost error | L | Critical | video/upload未就绪 Sep 3 | Sep 2 video、Sep 3 18:00 internal freeze、10h buffer | Owner | submission proof |
| R22 | Name collision/trademark | M | L for hackathon | search result/claim | working-name disclaimer、post-hackathon clearance | Product | no blocker unless major brand conflict |
| R23 | P0 local role不是 production RBAC | Certain | M | reviewer问 auth | explicit sandbox；Agent无 approval tool；P2 SSO/RBAC | Product | honest disclosure |
| R24 | Tool annotations被误当安全控制 | M | H | handler依赖 `readOnlyHint` | app checks；只称 hint；standard fields only | Engineering | code review |
| R25 | 当前 workspace 不是 Git repository | Certain now | H by submission | 无 dated commits/public repo | Phase 0 确定正式 repo；保存 competition-period history；提交前 public + LICENSE | Owner | submission blocker |

Legend：L = likelihood，I = impact；L/M/H = Low/Medium/High。

## 3. Security threat review

### 3.1 Threats and controls

| Threat | Attack | P0 control | Residual risk |
|---|---|---|---|
| Prompt injection | ticket text instructs Agent to export PII | ticket marked untrusted；not part of policy predicates；danger tools absent/denied | Model may explain poorly, but no authority bypass |
| Tool argument abuse | schema-valid amount 120/order other | domain constraint checks active policy | evaluator bug；covered by golden tests |
| Approval spoofing | Agent passes `approved:true` | no approval field/tool；session actor + visible trusted UI gesture | public demo role not production identity |
| TOCTOU | policy/branch changes after preview | expected version + branch revision + hash + expiry | client clock only display；transaction uses app timestamp |
| Replay | repeat commit/refund | idempotency ledger + business uniqueness | storage deletion/reset intentionally clears demo |
| Tool lifecycle race | stale tool invoked after unregister | handler rechecks current phase/policy | draft client behavior still platform risk |
| Output injection | order/ticket field contains instruction | field projection + untrusted hint + no HTML execution | Client may still surface text; permissions remain enforced |
| Data leakage | full customer/workspace dump | compact projection + fixed field enum | public fixture only; no real PII |
| Rollback abuse | Agent revokes/changes authority unexpectedly | Human-armed 60s undo, token, version check | demo role simplicity |
| Audit tampering | history edited/deleted | append-only records, hash/evidence refs | IndexedDB user can clear local data; not production tamper-proof |

### 3.2 Claims we must not make

- “PermitBench makes any Agent safe.”
- “WebMCP provides secure transactions/approval.”
- “Annotations enforce permissions.”
- “Browser support is universal.”
- “Receipt is cryptographically tamper-proof” in P0.
- “Refund is a real payment.”
- “AuthBench proves every model fails every permission task.”
- “No competitor exists.”

Allowed claim：

> In this task pack and sandbox ledger, PermitBench deterministically proves the approved policy completes all required tests, denies all defined probes, and binds activation to the Human-reviewed version.

## 4. Reliability failure matrix

| Failure | Expected system behavior | Bad behavior that blocks release |
|---|---|---|
| Agent retries branch create | same branch/result | duplicate branch cards |
| Agent retries commit after timeout | same policy/receipt | multiple policy versions |
| Agent retries refund | same refund receipt | two refund records |
| Human edits branch after simulation | simulation stale | old green badge remains eligible |
| Human edits after preview | approval disabled/stale | old preview commits |
| Network/client disconnect | query/retry with same key | optimistic “Done” with unknown state |
| Simulation abort | partial/coverage incomplete | partial marked pass |
| Invalid arguments | structured field error, zero write | UI partially mutates |
| Wrong phase tool | `PHASE_MISMATCH`, zero write | stale tool performs action |
| Undo after other policy change | stale/conflict, no silent overwrite | broad restore overwrites newer decision |
| Verification check fails | success=false + evidence | Agent text says done/green UI |

## 5. Product kill criteria by candidate

### Winner / PermitBench

Kill current product if any occurs：

1. dynamic tool-surface change + enforcement cannot be shown reliably by Phase 2；
2. branch/simulation requires LLM self-judgment for critical pass/fail；
3. full-flow direct collision appears and cannot be differentiated in 6 hours；
4. Human comprehension gate fails after one copy/layout simplification；
5. clean happy path remains <80% after P1 removal；
6. P0 credibility requires real provider integrations beyond time budget。

Do not kill merely because：UI不够漂亮、multi-agent不可用、token metrics unavailable、第二 browser不支持、second task pack被砍。

### Runner-up / Incident Cockpit

Only revive if：

- PermitBench hard kill occurs；
-可复用 branch/preview/verify kernel；
-采用 fully self-contained high-fidelity incident simulator；
-能在 30 秒说明与 Azure/Datadog/Rootly 的差异；
-不用接真实 production telemetry/credentials。

Kill B if：hypothesis/approval/verify 仍只是现有 SRE 产品的 WebMCP remote control，或 remediation 只有 “restart service” mock。

### Rejected / Runbook Studio

不在本次 Hackathon 回归，除非出现新的、单一、必须由可见网页共享的 high-pain workflow。禁止回归到 generic visual builder。

## 6. Pivot protocol

触发 hard kill 后：

1. 保存事实、trace、触发时间；
2. 2 小时内停止新增代码/设计；
3. 写一页 “what remains reusable”；
4. 用 4 小时 spike Runner-up 的唯一 killer path；
5. 若 B 也不能满足 WebMCP necessity + 3-min Demo，不强行提交抽象平台；
6.更新 `FINAL_PRODUCT_DECISION.md`，不要让文档与产品分叉。

Reusable kernel：branch entities、deterministic scenario runner、preview/version/idempotency、Human approval、receipt、tool registry adapter。

## 7. Pre-mortem

假设没有进入 Top 10，最可能的评委反馈：

### Failure story 1："This is a nice permission dashboard, but why WebMCP?"

Cause：视频只展示卡片，没有 actual Agent tool discovery/change。  
Prevention：Tool Surface Inspector 来自 `getTools()`；commit 前后真实 tools 可见；Agent 用新 surface 完成 refund。

### Failure story 2："Existing gateways and IAM simulators already do this."

Cause：定位写成“fine-grained MCP security”。  
Prevention：开场不卖 gateway；明确 job-specific alternative decision；展示 positive + negative proof；competitor distinction 一句话。

### Failure story 3："It looks mocked."

Cause：预制 branches、假进度、无 trace/ledger。  
Prevention：real tool calls/request IDs；deterministic simulator；sandbox transaction；receipt evidence 可展开；公开 source。

### Failure story 4："Too much architecture, no product."

Cause：讲 idempotency/branch/harness 超过 pain/job。  
Prevention：退款先行；technical terms 放 tooltips/README；三分钟只讲用户可见因果链。

### Failure story 5："The safety claim is misleading."

Cause：把 8 个 probes 说成 universal safety。  
Prevention：coverage badge；task-pack wording；limitations；unknown fail closed。

### Failure story 6："The demo failed in our client."

Cause：只在开发机或一个 ChatGPT build 测过。  
Prevention：live deployment early；ChatGPT Desktop + Chrome 149 smoke；build/fixture hash；备用 host；视频自足。

## 8. Remaining unknowns

| Unknown | Current confidence | Close by | If not closed |
|---|---|---|---|
| ChatGPT `toolchange` UX/latency | Low–Medium | Phase 2 live smoke | hard kill if core fails |
| Responses ↔ page WebMCP automatic bridge | Unknown | official docs/local test | P0 assumes no bridge |
| Gallery collision | Unknown | daily until submission | collision protocol |
| Branch UX user preference | Hypothesis | Phase 5 five-person test | collapse alternatives, keep evidence |
| Quantified WebMCP advantage | Unknown | Phase 6 paired eval | soften claim to semantic/transactional difference |
| Browser support after trial | Unknown | P2 | no broad support promise |
| Production buyer willingness-to-pay | Unknown | post-hackathon interviews | not needed for challenge, no revenue claim |

## 9. Go/no-go checklist

### Product gate

- [ ] specific AI platform/security engineer persona；
- [ ] one refund job；
- [ ] direct competitors acknowledged；
- [ ] branch is decision value, not animation；
- [ ] delete WebMCP materially worsens experience。

### Safety gate

- [ ] Agent cannot approve itself；
- [ ] handler checks authority independently of registry；
- [ ] stale/duplicate/invalid/abort tests pass；
- [ ] verification reads ledger；
- [ ] coverage claim scoped；
- [ ] sandbox limitation visible。

### Demo gate

- [ ] real calls / actual registry；
- [ ] Human intervention visible；
- [ ] wow before 2:20；
- [ ] receipt before 2:45；
- [ ] stranger comprehension passed；
- [ ] video/public URL independently opened。

### Deadline gate

- [ ] internal freeze Sep 3 18:00 UTC+8；
- [ ] YouTube ready Sep 2；
- [ ] live URL stays through judging；
- [ ] Devpost confirmation saved。

只有全部关键项通过才可以使用“ready to submit”。否则按 blocker/kill 处理，不能用“基本完成”替代验证证据。
