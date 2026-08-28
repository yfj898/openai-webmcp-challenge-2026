# Competitor Landscape

> 截止日期：2026-08-27。只把官方产品页、官方文档、官方 GitHub 或论文作为能力依据。  
> `—` 表示与该产品类型不适用；“未公开”表示公开资料未能确认，不等于产品内部绝对没有。

## 1. Executive conclusion

| Candidate | 市场拥挤度 | 最强撞题证据 | 决策影响 |
|---|---|---|---|
| A：Decision Workspace | 原始母题高；PermitBench wedge 中等 | ScopeGate 已做 MCP per-action enforcement；Opal Paladin 已做 AI access decision；AWS 已做 AI policy assistant | 不能卖“least privilege gateway”；必须卖 branch + task/adversarial simulation + transactional activation 的共享决策 UX |
| B：Incident Cockpit | 极高 | Azure/Datadog/PagerDuty/Rootly 已覆盖多 hypothesis、remediation、approval、verification | novelty 明显不足；真实集成成本使 Hackathon execution 风险过高 |
| C：Runbook Studio | 极高 | n8n/Retool/Fleet/LangGraph/Temporal 分别覆盖 visual workflow、approval、persistence、fork/replay、durability | WebMCP 容易成为 editor decoration；淘汰 |

**Strong inference：**PermitBench 不是“没有竞品”，而是竞争层级不同：现有产品主要提供 policy recommendation、access governance 或 runtime enforcement；本产品聚焦 **在授权生效前，让 Human 与 Agent 用同一网页对候选权限做可见的任务适用性与 blast-radius 决策**。

## 2. Capability legend

后续矩阵统一评估：

- **Multi**：是否公开支持多个 Agent 并行协作，而非管理多个 Agent identity；
- **MCP / WebMCP**：是否公开支持相应协议；
- **Branch**：是否支持同一决策的隔离候选；
- **Preview**：是否在权威写入前展示精确结果/diff；
- **Approval**：是否有显式 Human approval gate；
- **Rollback**：是否可撤销/回滚已生效变化；
- **Durable**：是否保存长流程/状态/历史；
- **Verify**：是否产生结构化、可检查的执行或 policy 验证结果。

## 3. Candidate A / PermitBench landscape

### 3.1 分类

| 类型 | 产品 |
|---|---|
| Direct competitors | ScopeGate、Opal Paladin / OpalScript、AWS Policy Security Assistant |
| Adjacent competitors | Endram、Permission Protocol、Apono、Microsoft 365 Agent Registry approvals、WebMCP Kit、Simulti |
| Substitute products | AWS IAM Access Analyzer、Google Cloud Policy Simulator、人工 IAM review、spreadsheet/Slack approval |
| Open-source alternatives | AWS Policy Security Assistant、ScopeGate self-hosted、OPA / Cedar 等 policy engines（仅执行层） |
| Emerging startups/products | FaburAI AI Control、AuthMind、Saviynt AI identity governance、Aegiron |

### 3.2 Capability matrix

| Product | Agent role | Multi | MCP | WebMCP | Branch | Preview | Approval | Rollback | Durable | Verify |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| [ScopeGate](https://scopegate.dev/) | Agent 通过 scoped MCP endpoint 执行动作 | 否（管理多 agent identity） | 是 | 未公开 | 未公开 | 未公开 | Human 配置 | revoke key | policy + audit | runtime allow/deny + log；无 task simulation |
| [Opal Paladin](https://www.opal.dev/blog/paladin-access-decisions-machine-speed-human-judgment) / [OpalScript](https://www.opal.dev/) | AI 汇总访问上下文并 approve/escalate；辅助写 policy | 未公开 | 非核心 | 未公开 | 未公开 | policy-as-code 可 review | 是 | policy 变更可回退取决于集成 | 是 | access decision evidence；无公开 task pack simulation |
| [AWS Policy Security Assistant](https://github.com/aws-samples/policy-security-assistant) | 生成、分析并对话式收敛 IAM policy | 否 | 是（2 tools） | 否 | 否 | Analyzer validation | Human portal review | 未公开 | audit log | IAM Access Analyzer findings |
| [AWS IAM Access Analyzer](https://docs.aws.amazon.com/IAM/latest/UserGuide/access-analyzer-policy-validation.html) | 无 Agent；确定性 policy analyzer | — | 否 | 否 | 否 | 是 | 外部流程 | 外部流程 | findings/history 依服务 | validation / new-access checks / access preview |
| [Google Cloud Policy Simulator](https://docs.cloud.google.com/policy-intelligence/docs/simulate-iam-policies) | 无 Agent；模拟 IAM changes | — | 否 | 否 | 否 | 是 | 外部流程 | 可应用旧 policy | 是 | 受影响 access decisions |
| [Apono](https://docs.apono.io/docs/access-flows/creating-access-flows-in-apono/access-duration) | Agent/用户请求 JIT access | 未公开 | 有集成生态，非本研究核心 | 未公开 | 否 | access request details | 是 | expiry/revoke | 是 | access flow/audit；非 task simulation |
| [Endram](https://app.endram.com/) | runtime gateway 对 agent action 作授权决策 | 未公开 | 是 | 未公开 | 否 | action decision | 可配置 | revoke/deny | receipts/logs | decision receipt |
| [Permission Protocol](https://www.permissionprotocol.com/integrations/mcp) | MCP action 进入 approval gate | 否 | 是 | 未公开 | 否 | exact action request | 是 | 未公开 | signed receipts | approval receipt |
| [Microsoft 365 Agent tools](https://learn.microsoft.com/en-us/microsoft-365/admin/manage/manage-tools-for-agent?view=o365-worldwide) | Admin review/approve Agent tool registration | 否 | 是 | 未公开 | 否 | tool snapshot | 是 | disable/reject | registry/audit | registry state；非 task simulation |
| [FaburAI AI Control](https://www.faburai.com/products/ai-control) | 用 graph/path policy 控制 Agent access | 未公开 | 未公开 | 未公开 | 未公开 | path visibility | 有治理流程 | 未公开 | 是 | policy/path analysis |
| [WebMCP Kit](https://docs.nekuda.ai/quickstart) | Agent 读网站、提 WebMCP tool plan、等 Human approve、在 Git branch 实现并验证 | 否 | 围绕 tool implementation | 是 | Git branch | plan/PR diff | 是 | Git revert | PR/history | tool registration/type/site checks |
| [Simulti](https://simulti.io/) | 用 N 个并行 simulation branches 测 Agent task performance | 是/并行 simulations | 未公开 | 未公开 | 是 | result comparison | 未公开 | — | run results | task/edge-case evaluation |

### 3.2.1 Product-by-product decision notes

| Product | Target user / problem | Core strength | Core weakness for our job | Learn | Do not copy |
|---|---|---|---|---|---|
| ScopeGate | Agent builder 要按 action 限制多个 SaaS/MCP integrations | 真正 runtime enforcement、connectors、audit/revoke | 未公开 job-specific policy alternatives 与 task proof | fail closed、per-action、revoke | connector/gateway race |
| Opal Paladin / OpalScript | Identity/security team 处理大量 access requests 与 policy | 企业 context graph、AI decision、deterministic policy | 偏 employee/app access；不直接证明 Agent job sufficiency | evidence-first recommendation、author≠approver | 通用 IGA 与大集成面 |
| AWS Policy Security Assistant | Cloud/security engineer 编写和审批 IAM policy | LLM generation + official analyzer + audit/MCP sample | AWS 单域、单 proposal、无 shared WebMCP activation | AI propose + deterministic validate | IAM JSON editor clone |
| AWS IAM Access Analyzer | IAM admin 在部署前发现 policy/security 问题 | 权威 validation/new-access/access preview | 不理解业务 job，也不产生 Agent collaboration UX | 显示 finding type、affected access、coverage | 重新实现通用云 analyzer |
| Google Policy Simulator | GCP IAM admin 预测 role/policy 变化影响 | before-apply access simulation | 单 provider、无 candidate generation | base/change/result 清楚绑定 | 把“模拟”做成黑箱分数 |
| Apono | IT/security team 提供 JIT/time-bound access | approval、expiry、access flow integrations | 面向 access request，不是 Agent tool task-fit | 默认限时、revocation | 把 Demo变成审批工单 |
| Endram | Agent platform team 在 runtime 做 authorization | 明确 decision contract 与 receipts | 单 call gate，不帮助 policy exploration | exact action decision + receipt | 每步都弹 approval |
| Permission Protocol | MCP builder 需要 Human approval gate | signed-like approval evidence / action binding | runtime request layer，非上线前 branch compare | approval 绑定 exact payload | 只卖一个 “Allow” 按钮 |
| Microsoft 365 Agent tools | M365 admin review Agent/MCP tools | 进入企业 registry/approval 主路径 | review tool snapshot，不证明 job minimality | registry snapshot 与 admin separation | catalog management |
| FaburAI AI Control | AI governance/security team 看 capability paths | graph/path blast-radius 可视性 | 公开 workflow 与 task simulation 细节有限 | path visualization、indirect reach | 复杂 graph 作为 P0 中心 |
| WebMCP Kit | 网站开发者为现有 app 正确实现 WebMCP tools | read-only plan → approval → Git branch/PR → verification 链条清楚 | 决策对象是 source code/tool implementation，不是 Agent runtime authority | approval 后才写；per-tool verification table | 把 PermitBench 做成 WebMCP codegen/devtool |
| Simulti | Agent builder 在上线/花费前测试复杂任务 | parallel branches + happy/edge-case simulation | 不公开处理 permission activation、Human exact approval 或 WebMCP shared state | 测正向与 edge cases；并排对比 | 做通用 Agent eval platform |

### 3.3 Detailed profiles

#### ScopeGate — direct collision at enforcement layer

- **问题 / target**：为 Agent builder 提供比 OAuth scopes 更细的 per-action MCP 权限、日志与一键 revoke。
- **核心 workflow**：connect service → toggle actions → issue scoped MCP endpoint → enforce/log → revoke。
- **优势**：价值主张直接；MCP-native；真实 provider integrations；开源/自托管；runtime enforcement 是 PermitBench P2 需要的下游。
- **弱点/空白**：公开产品以 toggle 与 gateway 为中心，未展示从 task intent 生成多套 policy branch、正负任务 simulation、结构化 compare 或 WebMCP shared workspace。
- **学习**：权限必须在模型外 fail closed；per-action scope、rate limit、audit、revocation 都是商业化 baseline。
- **绝不能照搬**：不要再做一个 integration gateway 或“权限 toggle 面板”；3–5 天无法在其连接器数量上竞争。

#### Opal Paladin / OpalScript — direct collision at access decision layer

- **问题 / target**：身份与安全团队面对访问请求上下文碎片、审批等待与 policy maintenance。
- **核心 workflow**：聚合 identity/usage/risk context → AI reason → approve/escalate → audit；OpalScript 提供 deterministic/version-controlled policy。
- **Agent 作用**：推荐或自动作出部分访问决定，不是执行业务任务的 Agent 自己。
- **优势**：真实企业 context、成熟 access graph、audit 与 policy-as-code；证明 AI access decision 市场成立。
- **弱点/空白**：未公开展示“完成某个 Agent job 所需最小 tool+argument set”的 branch/task simulation；面向企业 access request，Demo 解释成本高。
- **学习**：展示 evidence 和 recommendation rationale；author ≠ approver；用 deterministic policy 执行 AI 建议。
- **绝不能照搬**：不要做通用 IGA、employee access request 或依赖 10 个 enterprise connectors。

#### AWS Policy Security Assistant — closest open-source alternative

- **问题 / target**：IAM policy approval bottleneck、反复沟通和 least-privilege policy 编写。
- **核心 workflow**：web portal → natural-language policy generation/refinement → Access Analyzer validation → audit；另外暴露 2 个 MCP tools。
- **优势**：官方 sample、完整可运行、LLM + deterministic analyzer 分层正确。
- **弱点/空白**：云 IAM 单域；单一 policy refinement；无公开 branch compare、adversarial task pack、transactional activation 或 WebMCP。
- **学习**：模型生成 + analyzer 验证；对话 refinement；清晰 audit trail。
- **绝不能照搬**：不要把产品限制成 AWS IAM policy generator，也不要把 analyzer findings 当 end-to-end job proof。

#### AWS / Google policy simulators — substitute and design prior art

- **问题 / target**：IAM 管理员在应用 policy change 前预测 access impact。
- **优势**：确定性、权威、可解释；证明 preview/simulation 是安全产品的正常交互。
- **弱点/空白**：面向 cloud IAM，不理解 Agent task；不提出多个候选；Human 与业务 Agent 不共享工作空间。
- **学习**：simulation 输出必须明确 base policy、changed access 和 coverage；模型不可替代 oracle。
- **绝不能照搬**：不要造通用 IAM evaluator；P0 用小型 capability DSL + fixture 即可。

#### Endram / Permission Protocol — adjacent runtime gates

- **问题 / target**：在 Agent 工具调用时做 deterministic allow/ask/deny 并留下 receipt。
- **优势**：approval 与 exact action 绑定；receipt 是可审计事实；适合作为 P2 enforcement integration。
- **弱点/空白**：关注单次 runtime decision，而非上线前 policy alternative design。
- **学习**：approval 必须绑定 action/policy hash、版本、参数和 expiry；write credential 永不交给模型。
- **绝不能照搬**：不要让主 Demo 退化成一连串“Allow?” 弹窗。

### 3.4 Original Candidate A collision

原始的“branchable decision/release workspace”也已有高相似产品：

| Product | 相似能力 | Why not our wedge |
|---|---|---|
| [Switchyard](https://switchyard.work/) | PRD-driven workspace、Humans + AI、parallel agents、verification contracts、atomic leases | 面向软件交付；说明 shared agent workspace 已在形成，不能用抽象 workspace 参赛 |
| [Keshro](https://keshro.com/) | AI migration、isolated Git worktrees、checkpoints、rollback、audit | Git/code migration，branch 是 implementation artifact，不是 permission decision |
| [Stride](https://www.stride.page/) | Human/Agent shared delivery graph、MCP、RBAC、audit | 面向项目交付；MCP shared state 已有商业产品 |
| [Grail Release Readiness](https://grail.computer/workflows/release-readiness-ai-agent) | 汇总 GitHub/Jira/monitoring/support，生成 blockers 与 go/no-go packet | launch decision 已撞题；依赖 connectors |
| [Microsoft Release Manager Assistant](https://github.com/microsoft/release-manager-assistant) | 多 Agent、Jira/Azure DevOps MCP、release health、confirmation updates | 开源 sample，证明 release cockpit 不是空白 |
| [Harness CD](https://www.harness.io/products/continuous-delivery) | approvals、verification、rollback、release orchestration | 企业 CD 市场成熟；Hackathon 版本难有 credibility |

## 4. Candidate B / Incident Response landscape

### 4.1 分类

| 类型 | 产品 |
|---|---|
| Direct competitors | Azure SRE Agent、Datadog Bits、PagerDuty SRE Agent、Rootly AI SRE、incident.io AI SRE |
| Adjacent competitors | FireHydrant、Shoreline、Harness SRM、Datadog Incident Management |
| Substitute products | PagerDuty + Datadog + Slack + kubectl + runbook；人工 incident commander |
| Open-source alternatives | [Robusta](https://github.com/robusta-dev/robusta)、[StackStorm](https://github.com/StackStorm/st2)、Prometheus/Alertmanager |
| Emerging startups | AI SRE vendors、incident copilots、autonomous remediation products |

### 4.2 Capability matrix

| Product | Core workflow / Agent role | Multi | MCP | WebMCP | Branch/hypotheses | Preview | Approval | Rollback | Durable | Verify |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| [Azure SRE Agent](https://learn.microsoft.com/en-us/azure/sre-agent/tutorial-deep-investigation) | deep investigation，生成并验证 2–4 hypotheses | 并行验证最多 3 个 | 非核心 | 未公开 | 是，hypothesis tree | evidence/result 可见 | 是 | remediation 依 action | partial results/history | hypothesis validation |
| [Datadog Bits](https://docs.datadoghq.com/bits_ai/bits_investigation/investigate_issues/) | observe/reason/action investigation；[remediation](https://docs.datadoghq.com/bits_ai/bits_remediation/) | 内部 agentic loop，非公开多 Agent | 非核心 | 未公开 | 是，hypotheses | Kubernetes action preview | Ask/Deny | 某些动作可回退 | case/history | Verify Resolution |
| [PagerDuty SRE Agent](https://www.pagerduty.com/platform/ai-agents/sre/) | investigate → approved automation → restore | agent platform | 有扩展生态，非核心 | 未公开 | investigation paths | action context | 是 | automation-specific | incident history | restoration verification |
| [Rootly AI SRE](https://rootly.com/ai-sre) | parallel hypothesis checks，关联 telemetry/deploy/history | 是/并行 investigations | 非核心 | 未公开 | 是 | evidence/confidence | Human oversight | integration-specific | incident record | confidence/evidence |
| [incident.io](https://incident.io/) / [AI SRE](https://incident.io/blog/what-is-ai-sre-complete-guide-2026) | incident record、coordination；AI SRE 路线 | 未公开 | 非核心 | 未公开 | coming-soon 能力需谨慎 | runbook/action context | 是 | integration-specific | 是 | timeline/retrospective；autonomous remediation 仍强调 oversight |
| [FireHydrant](https://firehydrant.com/) | on-call、incident coordination、automated runbooks、AI summaries | 否 | 非核心 | 未公开 | 否 | runbook steps | 是 | step-specific | 是 | incident analytics/retros |
| [Robusta](https://github.com/robusta-dev/robusta) | Kubernetes alert enrichment 与 remediation automation | 否 | 否 | 否 | 否 | action output | 可接 approval | playbook-specific | event history | checks/alert resolution |

### 4.2.1 Product-by-product decision notes

| Product | Target user / problem | Core strength | Core weakness for Hackathon wedge | Learn | Do not copy |
|---|---|---|---|---|---|
| Azure SRE Agent | Azure on-call/SRE 快速调查复杂服务事故 | hypothesis tree、并行 evidence validation、approval/cancel | 与 Candidate B 核心故事高度同构；Azure context 深 | 把 hypotheses 变成可见/可取消对象 | 复刻 hypothesis tree 当 novelty |
| Datadog Bits | 已在 Datadog 的 SRE 从 alert 到修复 | telemetry-native evidence、guardrails、preview、Verify Resolution | 需要真实 observability data 才可信 | action 后独立 verify；evidence贴近状态 | fake metrics + restart button |
| PagerDuty SRE Agent | 轮值团队处理 pager/incident noise | incident/on-call context、approved automations、restoration check | 平台分发/集成优势不可在 5 天复制 | 把人、incident、automation串成权威记录 | “autonomous SRE” 宽泛承诺 |
| Rootly AI SRE | Incident teams 做快速并行 root-cause investigation | parallel hypotheses、confidence、deploy/history correlation | 直接占据 branch-investigation 心智 | confidence 必须链接 evidence | 用模型 confidence 代替 deterministic check |
| incident.io / AI SRE | Incident commander 协调、记录、复盘；逐步加入 AI SRE | 强 Human incident workflow、timeline、communications | autonomous部分仍在演进，但核心 cockpit 已成熟 | Human command surface 与 audit continuity | 再做 Slack incident wrapper |
| FireHydrant | On-call/incident team 标准化 runbooks 与 retros | on-call + runbook + summaries 一体化 | Agent branch/verify 差异较弱，但 workflow替代完整 | clear incident milestones/owners | 把 AI summary 当核心价值 |
| Robusta | Kubernetes operator 自动 enrich/handle alerts | 开源、Kubernetes-native、真实 playbooks | 垂直且偏 automation，不是 shared decision UI | 小而真实的 remediation fixture | 扩展到通用 observability platform |

### 4.3 What to learn / reject

**值得吸收**：

- Azure 的 hypothesis tree 把 Agent 推理过程转化为 Human 可干预对象；
- Datadog 的 evidence 紧贴 telemetry，并把 Verify Resolution 放在 action 之后；
- PagerDuty/incident.io 将 timeline、owners、communications 保持为 authoritative incident state；
- Rootly 用 confidence/evidence 而不是未经验证的自然语言断言；
- 所有成熟产品都保留 Human oversight，而不是让模型持有无限 remediation authority。

**不能照搬**：

- 不能用 fake logs + fake Kubernetes button 冒充可信 incident product；
- 不能声称多 hypothesis 是 novelty；
- 不在 P0 接五个 observability providers；
- 不把“Agent 写一段 RCA”当 structured verification；
- 不做现有产品的 WebMCP remote control。

### 4.4 Candidate B verdict

这是**痛点最强但直接撞题最严重**的方向。只有在能展示 WebMCP 独有的 shared incident workspace，并且 remediation/verification 有高保真数据时才值得回归。当前列为 Runner-up 和 PermitBench kill 后的可复用 fallback。

## 5. Candidate C / Runbook Studio landscape

### 5.1 分类

| 类型 | 产品 |
|---|---|
| Direct competitors | Fleet Workflow Builder、n8n、Retool Agents / Workflows |
| Adjacent competitors | LangGraph、Temporal、Octopus Runbooks、Harness Pipelines |
| Substitute products | GitHub Actions、Notion runbook + Slack approval、Zapier/Make |
| Open-source alternatives | n8n、LangGraph、Temporal SDK/server、StackStorm |
| Emerging products | Agent workflow canvases、AI automation builders、cloud workflow agents |

### 5.2 Capability matrix

| Product | Core workflow / Agent role | Multi | MCP | WebMCP | Branch | Preview | Approval | Rollback | Durable | Verify |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| [Fleet Workflow Builder](https://fleetctl.ai/workflows/) | visual typed steps、bounded retry、run history | 可组合 workers | 未公开 | 未公开 | versioned artifacts，非 scenario branches | step config/run view | 是 | version/re-run | 是 | step outputs/status |
| [n8n AI Agents](https://n8n.io/ai-agents/) / [HITL docs](https://docs.n8n.io/advanced-ai/human-in-the-loop-tools/) | visual automation；AI tool call 可 pause 等 approval | 支持 agent/workflow composition | 是/可连接 | 未公开 | workflow versions，非并行 alternatives | execution preview/debug | 是 | workflow-specific | 是 | run history/errors |
| [Retool Agents](https://retool.com/use-cases/ai-agents-intelligent-automation) | production data/tools、approval gates、audit、replay、RBAC | 支持多 Agent app patterns | integrations | 未公开 | replay，非 proposal branch | tool/actions 可 review | 是 | replay/compensation-specific | 是 | audit + evaluation |
| [LangGraph](https://docs.langchain.com/oss/python/langgraph/use-time-travel) | graph runtime、persistence、interrupt、time-travel fork/replay | 是 | 可集成 | 否 | 是，checkpoint fork | state inspection | 是（interrupt） | replay/fork | 是 | node/state-dependent |
| [Temporal](https://docs.temporal.io/) | crash-proof durable workflow、retry、pause/resume | orchestration patterns | 可集成 | 否 | version/workflow fork 需应用设计 | workflow state | signals/activities 实现 | compensation/reset | 是 | application-defined |
| [Octopus Runbooks](https://octopus.com/docs/runbooks) | operations runbooks、permissions、manual intervention | workers/targets | 非核心 | 否 | snapshots/versions | run preview/log | 是 | runbook-specific | 是 | step/task status |
| [Harness](https://www.harness.io/products/continuous-delivery) | pipelines、approvals、verification、rollback | orchestration | integrations | 未公开 | pipeline versions | execution plan | 是 | 是 | 是 | service verification |

### 5.2.1 Product-by-product decision notes

| Product | Target user / problem | Core strength | Core weakness for WebMCP idea | Learn | Do not copy |
|---|---|---|---|---|---|
| Fleet Workflow Builder | Ops/platform engineer 组合可靠 typed workflows | typed steps、bounded retry、versioned artifacts、run history | 已覆盖 Candidate C 的核心 feature list | step contracts、bounded retry | 通用 visual canvas |
| n8n | Ops/automation builder 连接业务 apps 与 AI | connector ecosystem、AI tool approval、pause/resume | connectors 与 server execution 是 moat；WebMCP 非必要 | approval routing、execution observability | 节点/connector 数量竞争 |
| Retool Agents | 企业 app builder 在 production data 上构建 Agent | data/actions/RBAC/audit/replay 一体 | 企业 platform 体量，页面只是多表面之一 | approval/audit/evals 同产品 | generic internal-tools platform |
| LangGraph | Agent engineer 构建 stateful graph runtime | checkpoint、interrupt、time-travel fork/replay | 是 framework，不是最终产品；仍直接覆盖技术原语 | checkpoint IDs、resume/fork semantics | 暴露 graph internals 给最终用户 |
| Temporal | 平台工程师运行长期可靠 workflows | crash-proof durability、retry、signals、compensation | 后端基础设施；WebMCP只会是 adapter | durability 与 connection lifetime 分离 | 5 天内自研 workflow engine |
| Octopus Runbooks | DevOps team 安全执行运维 runbooks | permissions、manual intervention、snapshots/history | 垂直部署/运维已成熟 | explicit step status/manual gate | 做另一个 deployment console |
| Harness | DevOps/platform team 做 CD orchestration | approvals、service verification、rollback | 企业 integrations 与真实 deployment data 难复制 | action后 verification/rollback | 用 mock pipeline 模仿企业 CD |

### 5.3 What to learn / reject

**值得吸收**：typed steps、bounded retry、checkpoint、interrupt、replay、approval separation、run history、deterministic status。

**不能照搬**：

- 通用 workflow canvas；
- connector 数量竞争；
- 在浏览器标签关闭后仍假装 client-side workflow “durable”；
- 将 LangGraph/Temporal 的 runtime feature 重新实现一遍；
- 把 WebMCP 只用于创建节点和连线。

### 5.4 Candidate C verdict

**Rejected。** 其最强 feature 被现有产品分层覆盖，而长期执行天然需要 server runtime。删除 WebMCP 后价值几乎不变，无法通过 necessity test。

## 6. Cross-market synthesis

### 6.1 已商品化，不能当创新点

- Agent tool approval；
- audit log / receipt；
- per-action MCP permission；
- policy simulation；
- hypothesis trees；
- AI remediation + verification；
- visual workflow + pause/resume；
- durable retry；
- multi-agent parallel exploration。

### 6.2 PermitBench 可占据的组合空白

截至公开资料检索，尚未找到一个产品把以下完整链条作为面向用户的核心 workflow：

```text
具体 Agent job
→ 多个 isolated permission branches
→ positive task tests + adversarial safety probes
→ utility / blast-radius comparison
→ exact version-bound activation preview
→ human approval
→ visible dynamic WebMCP tool-surface contraction
→ constrained task execution
→ verification receipt + undo
```

这是**组合差异**，不是宣称任何单个原语从未存在。撞题判断置信度为 **Medium**：Devpost gallery 仍未公开。

最新否定性检索也确认单个组合件已有清楚 prior art：WebMCP Kit 已采用 plan → Human approval → Git branch → verify，Simulti 已采用 N 个 simulation branches，Permission Protocol 已把 approval receipt 绑定 exact commit/action。它们强化了本产品的设计依据，同时把差异化门槛提高到“job-specific permission proof + visible runtime tool activation”的完整闭环；仅展示 branch/approval/receipt 已不足以获胜。

## 7. Positioning

> Existing agent security products decide whether a tool call may run. PermitBench lets humans and agents design, compare, simulate, and activate the smallest tool surface that can finish a specific job.

中文：

> 现有 Agent 安全产品主要判断某次调用能不能执行；PermitBench 让 Human 与 Agent 在上线前共同证明：完成这项工作最少需要哪些能力。

我们不是：

- Browser Use competitor；
- another chatbot；
- MCP directory；
- workflow automation clone；
- 通用 IAM gateway；
- 用 LLM 替代 policy engine 的安全产品。

## 8. Collision monitoring checklist

提交前每天一次，最多 15 分钟：

1. 检查 [Devpost gallery](https://webmcp.devpost.com/project-gallery) 是否公开；
2. 搜索 `WebMCP agent permissions`, `WebMCP least privilege`, `WebMCP policy simulator`, `WebMCP branch approval`；
3. 检查 [OpenAI WebMCP Showcase](https://developers.openai.com/showcase?view=webmcp-apps)；
4. 检查 ScopeGate、Opal、Microsoft Agent Registry 的最近发布；
5. 若撞题，比较的是完整 killer flow，而不是产品标题；触发条件见 `RISKS_AND_KILL_CRITERIA.md`。
