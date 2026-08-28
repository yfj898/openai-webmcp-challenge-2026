# Final Decision

> 决策日期：2026-08-27  
> 证据标签：**Confirmed** = 官方/一手资料明确支持；**Strong inference** = 多项证据支持的判断；**Hypothesis** = 待产品实验验证；**Unknown** = 当前无法核实。

Winner:
**PermitBench — AI Agent 最小权限决策工作台**（Candidate A 的具体 wedge）

Runner-up:
**Incident Response Cockpit**（Candidate B）

Rejected:
**Agent-native Workflow / Runbook Studio**（Candidate C）

## Why winner

PermitBench 服务一个明确角色：**准备让 AI Agent 接入生产工具的 AI 平台/安全工程师**。当客服 Agent 新增退款能力、MCP server 或 OAuth scope 时，他需要回答的不是“是否信任这个模型”，而是：

> 哪一组最小、带参数约束的工具权限，既能完成真实任务，又不会扩大到 PII 导出、超额退款或角色修改？

产品把这个一次性的、散落在 Slack、工单、配置文件和试跑记录里的安全判断，变成 Human 与 Agent 共用的可见工作台：

1. Agent 读取任务、能力目录和约束；
2. 在隔离分支中提出 strict / balanced / broad 三套 policy；
3. 系统用确定性任务与攻击探针模拟每个分支；
4. Human 看到 utility、blast radius 和逐项 diff；
5. Agent 生成绑定版本的 activation preview；
6. Human 批准后才 commit；
7. 页面立刻只暴露被批准的 WebMCP 工具；
8. Agent 完成退款并生成 verification receipt；
9. Human 可撤销此次授权。

选择它的原因：

- **真实痛点**：AWS 的开源 Policy Security Assistant 明确把 IAM policy approval bottleneck、反复沟通和 least-privilege policy 生成列为要解决的问题；Opal 的供应商数据也显示访问审批存在显著等待与 unused access。[AWS sample](https://github.com/aws-samples/policy-security-assistant) · [Opal Paladin](https://www.opal.dev/blog/paladin-access-decisions-machine-speed-human-judgment)
- **模型不能替代**：AuthBench 发现 frontier coding agents 会同时漏掉必要权限、授予未使用/敏感权限，增加推理预算并不能消除问题。因此模型适合提出候选，确定性环境负责证明与执法。[AuthBench](https://arxiv.org/abs/2605.14859)
- **WebMCP 是核心交互**：Human 正在查看和编辑同一份 policy workspace，Agent 需要读取当前可见状态、创建分支、触发模拟并在批准后获得动态变化的工具面。WebMCP 将页面状态、语义工具和 Human approval 放在同一浏览上下文里。
- **三分钟可证明**：三张 policy 分支卡同时出现；strict 因缺少退款能力失败，broad 因 PII/admin 探针失败，balanced 全绿。Human 批准后，工具面从 policy-design tools 切换到仅有 `lookup_order`、受限 `issue_refund` 等执行工具。这是可见、可解释的 wow moment。
- **3–5 天可构建**：P0 使用一个 seeded support-refund 场景、纯 TypeScript 确定性模拟器、IndexedDB 状态和 10 个 semantic WebMCP tools；不需要真实云 IAM、OAuth、支付或可观测性集成。
- **随模型增强而增值**：模型越擅长提出方案与执行任务，就越需要外部的 stable IDs、最小授权、事务边界、版本检查和可验证 receipt。

## Why not runner-up

Incident Response Cockpit 的痛点更强、Demo 也直观，但现在已存在高度相似的正式产品：

- Azure SRE Agent 已支持 2–4 个 hypotheses、最多 3 个并行验证、hypothesis tree、approval、cancel 和 partial results。[Azure](https://learn.microsoft.com/en-us/azure/sre-agent/tutorial-deep-investigation)
- Datadog Bits 已覆盖 hypothesis investigation、one-click remediation、Ask/Deny guardrails、approval 和 Verify Resolution。[Datadog](https://docs.datadoghq.com/bits_ai/bits_remediation/)
- PagerDuty SRE Agent、Rootly AI SRE 也将 autonomous investigation、remediation 与 verification 产品化。[PagerDuty](https://www.pagerduty.com/platform/ai-agents/sre/) · [Rootly](https://rootly.com/ai-sre)

因此它的 branch / approve / verify 故事并不新。Hackathon 版本若没有真实 telemetry、service topology 和安全 remediation integration，会像这些产品的玩具重演；若加入真实集成，又超出 3–5 天可靠构建范围。**Strong inference：它更可能被评为执行不错的垂直 demo，而不是“WebMCP 应该存在的原因”。**

## Why not rejected

Agent-native Workflow / Runbook Studio 被淘汰，不是因为没有市场，而是因为市场过于成熟且 WebMCP 并非天然中心：

- n8n 已有 AI tool-call human approval 与暂停/恢复；
- Retool Agents 有 configurable approval gates、audit logs、replay 与 RBAC；
- LangGraph 有 persistence、interrupt 和 time-travel fork/replay；
- Temporal 已解决 durable execution、retry、pause/resume；
- Fleet Workflow Builder 已有 typed steps、approval gates、bounded retries、versioned artifacts 与 run history。

这些 workflow 的 authoritative runtime 通常在服务器，REST/MCP/queue 比网页更自然。若把 WebMCP 加到编辑器上，它容易沦为装饰；若重新实现 durable runtime，又必然过度工程。**Confirmed：已有替代品覆盖了其最有力的 feature list。Strong inference：它是基础设施 demo，不是一个清楚的产品 wedge。**

## Evidence

### 比赛与撞题

- **Confirmed**：WebMCP Challenge 四项标准等权：WebMCP Leverage、Execution、Potential Impact、Creativity & Ambition；10 个优胜项目。[Official Devpost](https://webmcp.devpost.com/)
- **Confirmed**：截至 2026-08-27，Devpost project gallery 尚未公开，因此无法完成 submission-level 的撞题排除。[Project gallery](https://webmcp.devpost.com/project-gallery)
- **Confirmed**：OpenAI WebMCP Showcase 当前公开案例集中于内容创作、消费、游戏和可视化；未见 Agent 权限决策工作台。[OpenAI Showcase](https://developers.openai.com/showcase?view=webmcp-apps)

### 痛点与技术

- **Confirmed**：AWS IAM Access Analyzer 支持 policy validation、new-access checks、access preview 和 policy generation，证明“policy 可确定性验证/模拟”有成熟原语。[Validation](https://docs.aws.amazon.com/IAM/latest/UserGuide/access-analyzer-policy-validation.html) · [Access preview](https://docs.aws.amazon.com/IAM/latest/UserGuide/access-analyzer-access-preview.html)
- **Confirmed**：Google Cloud Policy Simulator 可模拟 IAM policy change 对访问结果的影响。[Google Cloud](https://docs.cloud.google.com/policy-intelligence/docs/simulate-iam-policies)
- **Confirmed**：OpenAI Agents SDK 的 MCP 集成包含 approval policy 与 deferred tool loading；Anthropic managed agents 也提供 `always_allow` / `always_ask` 类权限策略。[OpenAI Agents SDK](https://github.com/openai/openai-agents-python/blob/main/docs/mcp.md) · [Anthropic](https://platform.claude.com/docs/en/managed-agents/permission-policies)
- **Confirmed**：ScopeGate 已提供 MCP-native per-action permission gateway、audit 与 revoke，说明 enforcement layer 正在商品化。[ScopeGate](https://scopegate.dev/)
- **Strong inference**：PermitBench 的差异不能是“细粒度 MCP 权限”，而必须是 **branch → task simulation → compare → transactional activation → visible tool-surface change** 的决策体验。

## Scorecard

| 维度 | PermitBench / A | Incident Cockpit / B | Runbook Studio / C |
|---|---:|---:|---:|
| WebMCP necessity | 10 | 9 | 6 |
| Demo wow factor | 10 | 9 | 7 |
| Novelty | 9 | 4 | 3 |
| User pain | 8 | 10 | 8 |
| Market relevance | 9 | 9 | 9 |
| Model/harness alignment | 10 | 9 | 9 |
| Technical feasibility | 9 | 6 | 7 |
| 3–5 day buildability | 9 | 5 | 6 |
| Reliability | 9 | 6 | 7 |
| Top-10 potential | 9 | 7 | 5 |
| **Total** | **92** | **74** | **67** |

分数只用于统一比较；最终决定由撞题风险、WebMCP 必要性和 Demo 证据链共同决定。

## Top-10 Gate Review

> 这是**方向进入构建的 research gate**，不是“应用已经实现/通过”的声明。实现证据仍须按 Build/Evaluation gates 关闭。

- [x] **真实痛点明确** — AWS sample、Opal vendor evidence、AuthBench；
- [x] **Persona 明确** — 为 SaaS Agent 上生产工具的 AI 平台/安全工程师；
- [x] **场景具体** — `T-1042 / ORD-8821 / USD 42.80` refund permission review；
- [x] **当前替代方案已经研究** — Slack/Jira/docs/config/IAM simulator/runtime gateway；
- [x] **直接竞品已经搜索** — ScopeGate、Opal、AWS Policy Security Assistant 等；
- [x] **撞题风险可接受** — 单原语均有 prior art，但完整闭环未发现；gallery Unknown 由每日检查与 hard kill 控制；
- [x] **WebMCP 是核心而不是装饰** — shared page state、semantic mutations、approval 后 dynamic registry；
- [x] **Human-Agent collaboration 清楚** — Agent propose/simulate/execute；Human edit/approve/undo；
- [x] **利用当前模型新能力** — GPT-5.6 tool use/Structured Outputs；不让模型承担 authority；
- [x] **顺应现代 harness** — phase scope、compact projection、versioned writes、single-agent fallback；
- [x] **有 authoritative state** — IndexedDB workspace/policy/refund ledger；
- [x] **有 structured tools** — 10 个高层 WebMCP tools，同时暴露 ≤6；
- [x] **有 preview / commit** — exact hash/version/expiry/Human approval/idempotency；
- [x] **有 verification** — deterministic positive/negative checks + ledger read-back；
- [x] **有 recovery** — stale、duplicate、abort、undo；
- [x] **multi-agent 有真实必要性才使用** — P0 不使用；P1 只允许 isolated branch exploration；
- [x] **3 分钟 Demo 能讲明白** — 2:50 分镜已冻结；
- [x] **P0 可以在剩余时间完成** — 5 天 local deterministic stack，约 1.5 天 buffer；
- [x] **技术风险可控** —无真实 provider integration；dynamic lifecycle 被前置为 Phase 2 kill test；
- [x] **至少一个 wow moment** — Human approve 后 Agent tool surface 可见收窄并立即完成受限 refund；
- [x] **与 Showcase 项目明显不同** — 当前官方 Showcase 未见 permission decision workbench；
- [x] **能解释为什么可能进入 Top 10** — 同一可见 flow 同时证明四项评分。

**Gate result：PASS — PermitBench 可以进入构建。** 其中 dynamic tool lifecycle 与 gallery collision 不是被忽略的 Unknown，而是有时间点、有客观阈值的 hard kill。

**Separate submission gate：UNVERIFIED。** Official Rules 对个人 residence / 组织 domicile 与 supported-country 有明确要求，并列出中国大陆、香港等排除地区。当前时区不能证明参赛主体资格；负责人必须按实际法律身份确认。这个 Unknown 不改变产品选择，但可阻断比赛提交。

## Confidence

**Medium-High**

高置信部分：用户痛点、相邻产品成熟度、P0 技术可实现性、WebMCP 展示路径。  
降低置信度的部分：Devpost gallery 未公开；真实评委偏好未知；动态 tool lifecycle 仍需在目标 ChatGPT/WebMCP runtime 中实测。

## Remaining unknowns

1. **Unknown**：截至提交前是否出现高度相似的 WebMCP 权限 branch/simulator 项目。
2. **Unknown**：评审环境对运行时 unregister/register tools 与 `toolchange` 的支持是否完全一致。
3. **Hypothesis**：安全工程师会把三分支对比视为优于单一 AI policy recommendation；需通过 5 人快速访谈或 benchmark 观察验证。
4. **Hypothesis**：3 分钟内评委能同时理解 “policy design” 与 “执行授权” 两层；需用无术语脚本试映验证。
5. 产品名 **PermitBench** 仅完成快速公开网页检索，未完成商标清查。

## Kill trigger

如果 Phase 2 结束前不能在至少一个官方支持的评审环境中稳定演示：

> Human 批准 policy 后，WebMCP 可用工具集合发生可观察、可调用的收窄，并且受限工具实际拒绝越权参数，

则立即放弃 PermitBench 当前方案；不要退化成静态 permission dashboard。优先转向 Runner-up 的**自包含 incident simulation cockpit**，复用 branch / preview / verify 内核。

第二 kill trigger：Devpost gallery 公布后若出现同样的 “三 policy 分支 + task/adversarial simulation + activation + dynamic WebMCP tool surface” 主流程，则在 6 小时内决定差异化或转向，禁止以 UI 换皮继续。
