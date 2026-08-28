# PermitBench Executive Summary

## 我们最终做什么？

**PermitBench — AI Agent 最小权限决策工作台。**

它面向准备让 AI Agent 接入生产工具的 AI 平台/安全工程师。Human 与 Agent 在同一个 WebMCP 页面里创建、模拟和比较多套权限方案；Human 批准精确 preview 后，页面实际收窄 Agent 可发现的工具面，Agent 用被批准的能力完成任务，系统再从权威账本验证并生成 receipt。

一句话：

> PermitBench 证明一个 Agent 完成具体工作最少需要哪些能力，然后只激活这组能力。

## 为什么是它？

三个候选的统一评分：

| Rank | Direction | Score | Decision |
|---:|---|---:|---|
| 1 | Candidate A → PermitBench | 92/100 | Winner |
| 2 | Incident Response Cockpit | 74/100 | Runner-up |
| 3 | Runbook Studio | 67/100 | Rejected |

Incident Response 的 pain 最强，但 Azure SRE Agent、Datadog Bits、PagerDuty SRE Agent、Rootly AI SRE 已覆盖并行 hypotheses、approval、remediation 与 verification；Hackathon 版本要么像玩具复刻，要么被真实 telemetry integration 拖垮。

Runbook Studio 已被 n8n、Retool、Fleet、LangGraph、Temporal、Harness 分层覆盖，而且长期 workflow 的 authoritative runtime 天然在 server，WebMCP 容易只是 editor decoration。

PermitBench 的 wedge 更自包含、可确定性验证、三分钟更直观，也更能把 WebMCP 的 shared visible state 与 dynamic tool surface 变成产品主线。

## 用户是谁？

一家约 25–200 人 SaaS 公司的 **AI 平台/安全工程师**。他负责 3–10 个内部或客户可见 Agent 的 MCP tools、service permissions 和上线 review。每次 Agent 新增退款、邮件、数据库或管理员能力时，他必须在上线时限内回答：权限是否足够、是否过宽、批准的是否还是当前版本、出错后能否解释和撤销。

## 当前痛点是什么？

现在的 task intent、MCP manifest、provider scopes、policy 配置、试跑与 approval 分散在 Slack/Jira、文档、代码、console 和日志中：

-授权过窄，上线后任务中断；
-授权过宽，PII/资金/管理员 blast radius 过大；
-只跑 happy path，broad policy 也会“成功”；
-模型给一项 recommendation，Human 看不到替代方案；
-approval 不绑定 exact version；
-retry 可能重复写；
-audit 说明“做过什么”，但不证明“为何这些权限足够且最小”。

[AWS Policy Security Assistant](https://github.com/aws-samples/policy-security-assistant) 明确描述 IAM policy approval bottleneck；[AuthBench](https://arxiv.org/abs/2605.14859) 显示 frontier agents 同时会漏掉必要权限并授予未使用/敏感权限，更多推理并未消除问题。

## 与当前产品最大的区别

> Existing agent security products decide whether a tool call may run. PermitBench lets humans and agents design, compare, simulate, and activate the smallest tool surface that can finish a specific job.

我们不与 ScopeGate 比 gateway/connectors，不与 Opal 比企业 access graph，不与 AWS 比通用 IAM analyzer。PermitBench 占据的是授权生效前的 **job-specific decision experience**：

```text
task
→ isolated policy alternatives
→ positive + adversarial simulation
→ utility / blast-radius compare
→ exact version-bound preview
→ human approval
→ visible WebMCP tool activation
→ constrained task execution
→ verification receipt / undo
```

## 为什么现在的模型能力使它现在才成为可能？

GPT-5.6 已能理解复杂 intent、调用结构化工具、生成 schema-conforming 候选，并可使用 tool search、PTC 与 beta multi-agent。产品不需要自研 planner；Agent 可以真实承担候选生成、比较与执行。

但模型仍不拥有 stable domain IDs、authority、transaction、approval、idempotency 和 ground-truth verification。模型越强、可调用工具越多，这个外部可靠性层越有价值。

## 为什么 WebMCP 必要？

Human 正在查看/编辑当前 policy workspace，Agent 也必须读取并操作同一 state。WebMCP 让页面同时提供：

- Human-readable visual state；
- Agent-readable semantic tools；
- phase-scoped discovery；
- visible mutations；
- Human interrupt/edit/approve；
- approval 后 dynamic tool-surface change。

UI-only browser agent 能点击，但没有稳定 capability IDs、policy hashes、coverage、version/transaction contracts；REST/server MCP 能实现后端语义，但默认脱离当前页面 route/session/uncommitted Human edits。WebMCP 让 shared context 与 action surface 共址。

边界要诚实：WebMCP 是早期 Community Group Draft；transaction、approval、rollback、receipt 都是 PermitBench application layer，不是标准自带能力。

## 核心 wow moment

Agent 创建 strict / balanced / broad 三张 permission branch cards：

- Strict：2/3 tasks，太窄；
- Balanced：3/3 required tasks + 5/5 safety probes，刚好；
- Broad：3/3 tasks，但 USD 120、PII export、role change probes 失败，太宽。

Human 批准 balanced 的 exact preview。页面从 Review 进入 Execution，真实 WebMCP registry 中设计工具消失，只剩获批的 order lookup、受限 refund 和 verify tools。Agent 对 `ORD-8821` 退款 USD 42.80；receipt 证明超额、PII、提权和 duplicate effect 都没有发生。

## P0 有哪些功能？

-一个 seeded refund-support workspace；
- stable tasks/capabilities/constraints；
- strict / balanced / broad branches；
- deterministic positive tasks + negative probes；
- compare view；
- version-bound preview；
- Human-only approval；
- atomic/idempotent commit；
- 10 个 phase-scoped WebMCP tools（同时 ≤6）；
- active-policy runtime enforcement；
- sandbox order/refund ledger；
- structured verification receipt；
- undo/revoke；
- stale/duplicate/abort recovery；
- reset、live URL、public source、<3 min video。

## 明确不做什么？

-真实 Stripe/payment；
-通用 IAM 或 policy language；
-MCP permission gateway/connectors；
-企业 SSO、多租户、production RBAC；
-内嵌 chat sidebar；
-通用 workflow builder；
-第二垂直场景；
-依赖 beta multi-agent；
-自研 planning/orchestration engine；
-Kafka/Kubernetes/vector DB/event-sourcing platform。

## 最大的三个风险

1. **Dynamic tool lifecycle** 在评审客户端不稳定；Phase 2 不能连续跑通即 kill。
2. **撞题/定位**：ScopeGate/Opal/AWS 已覆盖相邻层，Devpost gallery 尚未公开；必须用完整 branch-to-activation flow 区分。
3. **三分钟理解成本**：security 术语可能让产品像基础设施；用退款、“Too little / Just enough / Too much” 与真实 tool change 解决。

## 为什么可能进入 Top 10？

同一个可见动作链覆盖四项评分：

- **WebMCP Leverage**：semantic tools + shared page state + dynamic registry；
- **Execution**：本地确定性 happy path、stale/duplicate recovery、receipt；
- **Potential Impact**：明确高后果 persona/job，有 AWS/AuthBench/市场证据；
- **Creativity & Ambition**：把 Agent authority 变成 branchable、simulatable、transactional、human-approved shared object。

评委能一眼看到“为什么网页应该向 Agent 暴露语义”，而不是只能相信后台模型日志。

## 如果只剩 48 小时，砍掉什么？

砍：free-form constraint editor、subagents、第二场景、动画、cloud sync、自动 Responses eval、rich timeline、JSON export、额外浏览器 QA。

不砍：Agent-created branches、deterministic simulator、compare、preview、Human approval、commit、dynamic tool surface、受限 refund、verify/receipt、undo。

## 如果只能展示一个场景，展示什么？

只展示 `T-1042 / ORD-8821 / USD 42.80`：

> 三个权限分支中只有 balanced 同时完成退款任务并拒绝所有越权探针；Human 批准它后，Agent 的 WebMCP 工具面立即收窄，Agent 完成退款并拿到一张可验证、可撤销的 receipt。

## Final go / no-go

**Product go：开始构建 PermitBench。Submission eligibility：尚未验证。**

Official Rules 对个人 residence / 组织 domicile 与 OpenAI API supported-country 有明确要求，并列出中国大陆、香港等排除地区。当前 `Asia/Shanghai` 时区不证明法律居住地；项目负责人应立即按真实参赛主体核对规则，模糊处询问 Devpost/OpenAI。不得在确认前声称“可提交”。

本地核查还确认当前 workspace **不是 Git repository**。这不影响本次研究落盘，但正式构建前应选择/初始化将公开提交的 repo，保留 competition-period dated history，并在提交前加入可见的 open-source `LICENSE`；本次没有擅自初始化或提交。

Confidence：**Medium-High**。  
Hard kill：Phase 2 无法稳定展示并 enforce approval 后的 WebMCP tool-surface change。  
Collision kill：gallery 出现同完整 flow 且无法在 6 小时内形成真实差异。  
Deadline：按 Devpost 的 **2026-09-03 13:00 PT / 2026-09-04 04:00 UTC+8** 执行。
