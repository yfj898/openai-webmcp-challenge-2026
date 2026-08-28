# Candidate A / B / C Deep Dive

> 研究截止：2026-08-27。本文只记录用于产品决策的新增研究；基础比赛与 harness 研究见 `OFFICIAL_RESEARCH.md`、`MARKET_HARNESS_RESEARCH_2026.md`、`HARNESS_NATIVE_FEATURE_BLUEPRINT.md`。

## 1. 评委心理模型

四项官方评分同权，但不是互相独立：一个好项目需要用同一条 Demo 因果链同时证明四项。

| 官方标准 | 评委真正寻找的证据 | 容易失分的信号 |
|---|---|---|
| WebMCP Leverage | Agent 通过页面提供的 semantic tools 做到 UI clicking/API wrapper 难以可靠完成的事 | generic chat sidebar、DOM click、把现有 REST 端点机械注册成 tools |
| Execution | 一个完整 happy path、一个 recovery path、清楚状态变化、真实运行而非 slides | 工具很多但主线失败、不可复现、输出只写 “Done” |
| Potential Impact | 明确用户、频繁或高风险 job、可从 wedge 扩展 | “任何人都能用”的通用平台 |
| Creativity & Ambition | 新交互原语；看完会觉得网页应当同时服务 Human 与 Agent | 再做一个 browser agent、MCP directory 或 workflow canvas |

**Strong inference：**评委的最佳心理模型不是“这个 Agent 很聪明”，而是“这个网页终于拥有一个让 Human 与 Agent 共同、可靠完成工作的新接口”。

三分钟最强证据链：

```text
同一可见状态
  → Agent 用 semantic tools 创建结构化变化
  → Human 看见差异并介入
  → 系统 preview + deterministic validation
  → Human approve
  → authoritative commit
  → structured verification + receipt
```

## 2. Candidate A — Scenario / Decision Workspace with Branches

### 2.1 原始母题的问题

“Decision Workspace”过于抽象。Launch planning、release readiness、migration planning 都已有相近产品：Grail、Harness、Switchyard、Keshro、Stride、Microsoft Release Manager Assistant 等。若继续做通用 decision canvas，容易变成漂亮但无刚需的 branch UI。

### 2.2 收敛后的 wedge：PermitBench

**Primary persona**：25–200 人 SaaS 公司的 AI 平台/安全工程师，负责批准内部或面向客户 Agent 的生产工具权限。

**触发频率**：每个 Agent 首次上线、增加 MCP server/工具、扩大数据范围或修改业务动作时；单人可能每周数次，组织随 Agent 数量增长而增加。

**痛点严重度**：不是高频点击痛点，而是高后果审批。授权过窄导致 Agent 上线后任务失败；授权过宽导致 PII、资金动作或管理员能力暴露。

**当前流程**：

```text
产品/工程写 agent task
→ Slack/Jira 请求权限
→ 安全人员看 MCP manifest、OAuth scopes、代码和文档
→ 在表格/配置文件中修改 allowlist
→ 人工跑几个 happy paths
→ broad approve / 反复退回
→ 上线后从日志发现漏权或越权
```

**断点**：

- task intent、tool schema、provider scope 和最终 policy 分散；
- 没有把“能完成任务”与“不能做危险动作”放在一次验证中；
- 单个 AI recommendation 没有可比较替代项；
- approval 常与 exact policy/version 解耦；
- retry 可能重复授权或业务动作；
- 工具变化后旧 approval 仍可能被误用；
- audit log 记录“调用过什么”，却不证明“为什么这些权限足够且最小”。

### 2.3 Agent 在产品中做什么

Agent 负责理解任务并提出候选，不负责批准自己：

1. 读取 task pack、capability catalog、risk constraints；
2. 创建 strict / balanced / broad 隔离分支；
3. 为每个分支给出 capability + argument constraint；
4. 触发确定性 simulator；
5. 比较任务覆盖、攻击探针、blast radius 与 diff；
6. 根据 Human 编辑生成 activation preview；
7. approval 后使用动态收窄的工具完成一笔受限退款；
8. 验证结果并生成 receipt。

系统而非模型负责：stable IDs、branch isolation、simulation oracle、version check、approval binding、atomic commit、idempotency、undo 与 receipt。

### 2.4 为什么需要 branches

在一般文档编辑中，branch 可能是炫技；在 least-privilege 决策中，它对应真实 trade-off：

- strict：blast radius 最小，但可能漏掉完成任务所需能力；
- balanced：满足任务，同时有金额/字段/资源范围约束；
- broad：任务成功率高，但暴露无关能力。

分支不共享可变 policy，因而 Agent 的探索不会污染 active grant；compare 面板把 abstract security discussion 变成可见证据。**Hypothesis：这是本产品需用 5 人测试验证的核心产品假设。**

### 2.5 WebMCP necessity test

| 替代方式 | 能做到什么 | 明显更差在哪里 |
|---|---|---|
| UI-only Browser Use | 点击 toggle、读取文字、提交表单 | 依赖 DOM；无法稳定获得 capability IDs、argument constraints、preview hash、coverage；点击与 active policy 的语义关系不可靠 |
| REST API | 可实现全部后端语义 | 外部 Agent 默认不知道当前浏览 route、selected task、uncommitted Human edits 与登录 session；需要单独接入、认证和状态同步 |
| Server MCP | 可提供 semantic tools | 与 Human 正在看的 page state 分离；需额外解决 workspace/session binding；难以直观展示 approval 后网页工具面实时变化 |
| WebMCP | page 同时是可视工作台与 Agent interface | Human 与 Agent 共享当前状态；tools 可按页面 phase 动态收窄；UI 对每次 semantic mutation 即时响应 |

不是说 REST/MCP 无法复刻，而是 **WebMCP 把 shared visible state、tool discovery、Human intervention 和 authority transition 合成一个可演示的产品表面**。

### 2.6 Kill criteria

- 动态 tool surface 在评审 runtime 中不可靠；
- simulator 只能用 LLM 自评，不能形成 deterministic proof；
- 真实用户更偏好单一 recommendation，三分支被认为增加负担；
- gallery 出现同主流程项目；
- Demo 必须解释 IAM/MCP 术语超过 30 秒才能理解。

### 2.7 结论

**Winner，92/100。** 原始 A 只有在收敛为 PermitBench 后成立。其获奖点不是 branch 本身，而是 **用 WebMCP 把 Agent 的 authority 变成可共同设计、验证、批准和观察变化的网页对象**。

## 3. Candidate B — Incident Response Cockpit

### 3.1 Primary persona

**轮值 on-call SRE，负责一个有 5–30 个服务的 SaaS 产品，在 P1/P2 事故发生后 5 分钟内完成初步定位与安全止血。**

频率：每月数次；严重性极高；决策时限以分钟计。当前在 PagerDuty、Datadog、Slack、Kubernetes/cloud console、GitHub 与 incident.io/Rootly 之间切换。

### 3.2 理想产品流

```text
alert + topology + deploy diff
→ Agent 建立多个 hypothesis branches
→ 并行查询 evidence
→ Human 观察置信度变化
→ preview remediation
→ approval
→ execute
→ verify SLO recovery
→ rollback / receipt
```

WebMCP 很适合共享 incident timeline、hypothesis tree 和 approval；branch 也有真实价值。

### 3.3 否定证据

- Azure SRE Agent 已有 hypothesis tree、多假设并行验证、approval/cancel；
- Datadog Bits 已有 investigation → remediation → approval → verify；
- PagerDuty SRE Agent 已有 investigation、approved automation、restoration verification；
- Rootly AI SRE 已有并行 hypothesis、confidence、telemetry/deploy/past-incident correlation；
- incident.io、FireHydrant 已占据 incident record、timeline、runbook 和 retrospective 工作流。

### 3.4 技术现实

一个可信 Demo 至少需要 metrics/logs/traces、deploy history、topology 与 remediation target。使用假数据会削弱 impact；接真实 Datadog/Kubernetes 又引入 credential、安全、网络与 flaky demo 风险。事故恢复的 verification 还需要时间窗口，难在三分钟中既真实又清晰。

### 3.5 Kill criteria

- 无法接入或高保真模拟一条完整 incident evidence chain；
- 与 Azure/Datadog/Rootly 的差异只剩 WebMCP control surface；
- remediation 只能 mock；
- Demo 的第一分钟都在解释 topology/telemetry。

### 3.6 结论

**Runner-up，74/100。** 用户痛点最强、Human-Agent collaboration 自然，但直接竞品和集成风险显著压低 novelty 与 execution confidence。

## 4. Candidate C — Agent-native Workflow / Runbook Studio

### 4.1 Primary persona

若必须具体化，最佳 persona 是：**负责部署审批与重复运维 Runbook 的平台工程师**。他希望将手工清单变成可暂停、批准、恢复和回滚的 durable workflow。

### 4.2 当前流程

Notion/Markdown Runbook + Slack approval + CI/CD job + ticket/log。context loss 与 partial failure 的确存在。

### 4.3 否定证据

但核心 feature 已被分层解决：

- Fleet / n8n / Retool：可视 workflow、Agent steps、approvals、logs；
- LangGraph：persistence、interrupt、time travel；
- Temporal：durability、retry、resume；
- Octopus / Harness：deployment approvals、verification、rollback。

### 4.4 WebMCP necessity test

大部分 Runbook 在用户离开页面后仍应执行，因此 authoritative runtime 必须在 server。网页只是 editor/monitor。Agent 通过 REST/MCP/queue 操作 workflow 已足够；WebMCP 的独特价值被压缩为“帮用户填编辑器”。

### 4.5 Kill criteria

- 无法说出唯一 killer workflow；
- P0 包含 durable scheduler、connector ecosystem 或通用 DSL；
- 主要卖点是很多 agents/tools/models；
- browser page 不是执行期间必须共享的工作表面。

### 4.6 结论

**Rejected，67/100。** 市场相关，但 wedge 不清、竞争最密、WebMCP leverage 最弱。

## 5. 取其精华，去其糟粕

### Design principles to copy

| 来源 | 吸收的设计 | PermitBench 中的对应 |
|---|---|---|
| Git | branch / diff / merge | policy branches、structured diff、只通过 preview 激活 |
| Stripe | idempotency / receipt | commit 与 refund 的 idempotency key、receipt ID |
| IAM Access Analyzer / Google Policy Simulator | policy simulation | deterministic capability + argument probe |
| Temporal | resume / durable checkpoint 思维 | versioned workspace、可恢复 preview；P0 不引入 Temporal |
| GitHub review | author ≠ approver、exact diff approval | Agent propose，Human approve exact preview hash |
| Notion / Linear | 快速、人可读的共享状态 | task、branch、constraints、checks 都在同一画布 |
| Datadog | observable execution | timeline、tool call、verification 可视化 |
| Stagehand | observe → act → extract 的语义简洁性 | summary → branch/simulate → receipt |
| 现代 Agent harness | deferred tools、context discipline | phase-scoped tools、compact projection、changed-since |

### Design anti-patterns to reject

- generic chat sidebar；
- 一次暴露所有 policy 与 execution tools；
- free-form policy text 作为 authority；
- Agent 自己证明自己安全；
- DOM-click-heavy execution；
- 单一可变全局 policy；
- 无声 retry 或 duplicate refund；
- approval 不绑定 preview hash/version；
- “simulation passed” 但不显示 coverage；
- 用 5 个 Agent 表演 multi-agent，而没有独立探索价值；
- 为 Hackathon 引入通用 IAM DSL、OAuth broker、Kafka、Kubernetes 或 vector DB。

## 6. 顺应 2026 模型能力

产品不重造 planning engine、reasoning tree 或 browser automation。强模型负责理解 task、提出三套候选、解释 trade-off、调用 semantic tools；环境负责模型不会自然拥有的权威能力：

```text
stable capability IDs
argument constraints
authoritative policy version
branch isolation
deterministic simulator
preview hash + expiry
human approval
atomic/idempotent commit
runtime enforcement
structured receipt
```

若模型一年后强 5 倍：候选 policy 会更好、更多工作可交给 Agent，PermitBench 的授权决策面更重要而非被替代。

## 7. Top-10 Gate

| Gate | 结果 | 证据/约束 |
|---|---|---|
| 真实痛点明确 | PASS | AWS sample、AuthBench、IAM simulator 产品类别 |
| Persona / 场景明确 | PASS | SaaS AI 平台/安全工程师；support-refund agent 上线 |
| 当前替代方案与直接竞品已研究 | PASS | 见 `COMPETITOR_LANDSCAPE.md` |
| 撞题风险可接受 | PASS（每日监测） | Showcase 无同类；Devpost gallery 尚未公开，由 hard kill 与每日重查控制 |
| WebMCP 核心而非装饰 | PASS | shared page state + semantic tools + dynamic activation |
| Human-Agent collaboration | PASS | Agent propose，Human edit/approve/undo |
| authoritative state / transaction / verify / recovery | PASS | 已进入 P0 spec |
| multi-agent 有必要才使用 | PASS | P0 single-agent；branches 不等于 fake multi-agent |
| 3 分钟 Demo | PASS | 一条 refund workflow，见 `DEMO_PLAN.md` |
| P0 3–5 天可构建 | PASS | local deterministic stack、零真实第三方集成 |
| Showcase 明显不同 | PASS | 当前 Showcase 未见 permission decision workbench |
| Top-10 理由成立 | PASS | 一条可见动作同时证明 leverage、execution、impact、ambition |

**最终 Gate：通过，但受动态 tool lifecycle 与 gallery 两个 kill trigger 约束。**
