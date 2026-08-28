# Research Log

> 维护规则：记录会改变产品决策的检索；来源优先官方/一手；每次新假设按 `Hypothesis → Search → Evidence → Belief update` 处理。  
> 最后更新：2026-08-27。

## Log

| # | Question / hypothesis | Search query | Sources | Finding | Impact / decision | Confidence |
|---:|---|---|---|---|---|---|
| 1 | 比赛真正按什么评分？ | `WebMCP Challenge 2026 official rules judging criteria` | [Devpost Rules](https://webmcp.devpost.com/rules), [OpenAI](https://openai.com/webmcp-challenge/) | 四项等权；tie-break 依次从 WebMCP Leverage 开始；先有 viability/API gate | 产品必须把 WebMCP 用在 killer flow，不能只做装饰 | Confirmed |
| 2 | 截止时间是否仍有 13:00/17:00 PT 冲突？ | `site:openai.com/webmcp-challenge deadline` + live rules check | [OpenAI](https://openai.com/webmcp-challenge/), [Devpost](https://webmcp.devpost.com/rules) | 两处当前均为 2026-09-03 13:00 PT，即 UTC+8 9/4 04:00 | 修正旧研究；按更早硬截止倒排 | Confirmed |
| 3 | WebMCP 是稳定标准吗？支持什么？ | `WebMCP specification draft registerTool toolchange annotations` | [Spec](https://webmachinelearning.github.io/webmcp/), [Chrome imperative API](https://developer.chrome.com/docs/ai/webmcp/imperative-api) | 2026-08-26 CG Draft；imperative register/unregister/toolchange 可用；declarative 仍 TODO | P0 只依赖 imperative；准备 client compatibility fallback | Confirmed |
| 4 | WebMCP 是否原生提供 transaction/approval/receipt？ | 查阅规范 IDL/security 全文 | [Spec](https://webmachinelearning.github.io/webmcp/) | 没有；仅有 tool semantics/channel，app 自己实现可靠性层 | 文案必须说 app-level semantics，不能误称标准能力 | Confirmed |
| 5 | 现有 Showcase 是否已有相似 permission workspace？ | 浏览 `OpenAI Showcase webmcp apps` | [Showcase](https://developers.openai.com/showcase?view=webmcp-apps) | 当前案例集中在创作、消费、游戏、可视化，未见权限决策工作台 | 当前展示层撞题低；不是对所有市场产品的“无人做”证明 | Confirmed |
| 6 | Devpost submissions 能否直接撞题搜索？ | 打开 project gallery | [Gallery](https://webmcp.devpost.com/project-gallery) | Gallery 尚未发布 | 撞题风险保持 Unknown；提交前每日重查 | Confirmed |
| 7 | GPT-5.6 当前能力是否支持设计？ | `site:developers.openai.com gpt-5.6 tool search PTC multi-agent` | [Model](https://developers.openai.com/api/docs/models/gpt-5.6-sol), [Latest guide](https://developers.openai.com/api/docs/guides/latest-model) | Responses/function calling/Structured Outputs/PTC/tool search/computer 等成立；multi-agent beta | 模型做提案/比较；不重造 planning engine；P0 不依赖 beta multi-agent | Confirmed |
| 8 | tool search 与 WebMCP dynamic registry 是同一能力吗？ | 对照 OpenAI tool search 与 WebMCP spec | [Tool search](https://developers.openai.com/api/docs/guides/tools-tool-search), [Spec](https://webmachinelearning.github.io/webmcp/) | 是两套机制；自动桥接未被官方确认 | 架构不假设 Responses 会直接发现页面 registry | Confirmed / Unknown bridge |
| 9 | 动态 tool scope 是否有官方设计依据？ | `Chrome WebMCP best practices register tools only when useful` | [Chrome best practices](https://developer.chrome.com/docs/ai/webmcp/best-practices) | 官方建议工具有用时注册、不再有用时注销；工具过多增加上下文/选择难度 | 将 explore/review/approved phase scope 纳入 P0，并自测收益 | Confirmed |
| 10 | Incident Cockpit 是否撞题？ | `AI SRE parallel hypotheses approval verify remediation` | [Azure](https://learn.microsoft.com/en-us/azure/sre-agent/tutorial-deep-investigation), [Datadog](https://docs.datadoghq.com/bits_ai/bits_remediation/), [PagerDuty](https://www.pagerduty.com/platform/ai-agents/sre/), [Rootly](https://rootly.com/ai-sre) | 多假设、并行调查、approval、remediation、verify 已被多家产品化 | Candidate B novelty 从高下调到 4/10；Runner-up | Confirmed |
| 11 | Runbook Studio 是否仍有 product gap？ | `agent workflow builder approval durable retry time travel 2026` | [Fleet](https://fleetctl.ai/workflows/), [n8n](https://docs.n8n.io/advanced-ai/human-in-the-loop-tools/), [Retool](https://retool.com/use-cases/ai-agents-intelligent-automation), [LangGraph](https://docs.langchain.com/oss/python/langgraph/use-time-travel), [Temporal](https://docs.temporal.io/) | UI、approval、durability、interrupt、fork/replay 已分层成熟 | Candidate C 淘汰；WebMCP 只剩 editor decoration | Confirmed |
| 12 | 原始 release/decision workspace 是否新颖？ | `AI release readiness agent shared workspace branches verification` | [Grail](https://grail.computer/workflows/release-readiness-ai-agent), [Switchyard](https://switchyard.work/), [Keshro](https://keshro.com/), [Stride](https://www.stride.page/), [Microsoft sample](https://github.com/microsoft/release-manager-assistant) | release packet、shared graph、parallel agents、Git branches/checkpoints 均已有产品 | 不做 generic A；寻找更具体 wedge | Confirmed |
| 13 | Agent permission approval 是否为真实痛点？ | `AI IAM policy approval bottleneck least privilege assistant` | [AWS Policy Security Assistant](https://github.com/aws-samples/policy-security-assistant), [Opal Paladin](https://www.opal.dev/blog/paladin-access-decisions-machine-speed-human-judgment) | AWS 明确描述反复沟通/审批瓶颈；Opal 供应商数据称等待与 unused grants 明显 | 选择 AI platform/security engineer persona；数字引用必须标 vendor-reported | Confirmed / vendor data |
| 14 | 强模型能否自行做好 least privilege？ | `agent least privilege authorization benchmark coding agents 2026` | [AuthBench](https://arxiv.org/abs/2605.14859) | frontier agents 同时存在 missing required permissions 与 unused/sensitive grants；更多 reasoning 未消除 | LLM 只能 propose；deterministic simulator/verification 是核心 | Confirmed paper result |
| 15 | 是否已有 MCP permission gateway？ | `MCP granular per agent permission gateway audit revoke` | [ScopeGate](https://scopegate.dev/), [GitHub](https://github.com/alifanov/scopegate) | per-action endpoint、audit、revocation、connectors 已有直接产品 | 不做 gateway；把 enforcement 作为 P2 integration；差异转向 decision workbench | Confirmed |
| 16 | 是否已有 AI access decision 产品？ | `AI access request decision policy as code Paladin Opal` | [Opal](https://www.opal.dev/blog/paladin-access-decisions-machine-speed-human-judgment) | Paladin 汇总 context 并 approve/escalate；OpalScript deterministic/version-controlled | branch + task/adversarial simulation 必须成为核心，不宣称发明 AI policy approval | Confirmed |
| 17 | Policy preview/simulator 是否有成熟原语？ | `AWS IAM Access Analyzer access preview validation`, `Google policy simulator` | [AWS validation](https://docs.aws.amazon.com/IAM/latest/UserGuide/access-analyzer-policy-validation.html), [AWS preview](https://docs.aws.amazon.com/IAM/latest/UserGuide/access-analyzer-access-preview.html), [Google](https://docs.cloud.google.com/policy-intelligence/docs/simulate-iam-policies) | 两大云提供确定性 policy change simulation/validation | P0 simulator 设计有先例；必须明确 coverage 与 base version | Confirmed |
| 18 | 运行时 approval/receipt 已有谁做？ | `MCP approval gate signed receipt agent authorization` | [Endram](https://app.endram.com/), [Permission Protocol](https://www.permissionprotocol.com/integrations/mcp), [Anthropic](https://platform.claude.com/docs/en/managed-agents/permission-policies) | allow/ask/deny、approval gate、receipts 已在形成 | 单次 allow dialog 不足以差异化；preview 应绑定 exact policy/version | Confirmed for public features / inference on product gap |
| 19 | 管理员审批 Agent tools 是否已有平台能力？ | `Microsoft 365 approve MCP server tools agent registry` | [Microsoft](https://learn.microsoft.com/en-us/microsoft-365/admin/manage/manage-tools-for-agent?view=o365-worldwide) | Admin 可 review/approve tool registration 并看到 tool snapshot | 企业 registry 是邻近竞品；PermitBench 聚焦 task-fit proof 而非 catalog approval | Confirmed |
| 20 | Product name 是否明显撞名？ | `"PermitBench" AI agent permissions`, `"ScopeGate" AI agent` | Search result + [ScopeGate](https://scopegate.dev/) | ScopeGate 已被直接竞品使用；未检索到 PermitBench 明显同名 | 采用 PermitBench 作为 working name；商标仍 Unknown | Strong inference |
| 21 | WebMCP 支持哪些浏览器？ | `WebMCP implementation status Chrome Edge Brave Firefox Safari` | [Implementation status](https://github.com/webmachinelearning/webmcp/blob/main/implementation-status.md) | ChatGPT Desktop supported；Chrome149/Edge150 trial；Brave experimental；Firefox 未落地；WebKit 反对 | 只承诺 challenge-supported environments | Confirmed |
| 22 | PTC/background 是否等于 sandbox/durable workflow？ | 查阅官方 PTC/background docs | [PTC](https://developers.openai.com/api/docs/guides/tools-programmatic-tool-calling), [Background](https://developers.openai.com/api/docs/guides/background) | PTC 是受限 V8；background 是响应异步/轮询，不是业务 durability | P0 不引入内部 orchestrator；业务 state 自己持久化 | Confirmed |
| 23 | 完整 branch/simulate/approve/receipt 组合是否也已撞题？ | `AI agent permission branches simulator`, `WebMCP permission simulator branch approval` | [WebMCP Kit](https://docs.nekuda.ai/quickstart), [Simulti](https://simulti.io/), [Permission Protocol Deploy Gate](https://www.permissionprotocol.com/use-cases/ai-agent-deploy-gate), [Opal Paladin update](https://www.opal.dev/blog/paladin-policy-ai) | Git-based tool implementation 已有 plan/approval/branch/verify；Agent eval 已有 parallel simulation branches；deploy gate 已绑定 exact commit receipts；Paladin 当前仍以 access recommendation/decision 为核心 | 不把 branch、approval、simulation 或 receipt 单独称创新；差异必须是 job-specific permission proof + visible runtime WebMCP activation | Confirmed public features / Strong inference on combination gap |
| 24 | 当前参赛主体是否自动符合资格？ | 复核 `Devpost Official Rules eligibility excluded countries domicile` | [Devpost Rules](https://webmcp.devpost.com/rules) | Rules 要求 supported-country 条件，并排除若干 residence/domicile，包括中国大陆与香港等；workspace 时区不能证明法律身份 | 将 eligibility 提升为独立 submission blocker；负责人必须按真实个人/团队/组织身份确认 | Confirmed rule / Unknown entrant status |

## Open questions queue

| Question | Closure method | Deadline | Decision if unresolved |
|---|---|---|---|
| ChatGPT Desktop 对 `toolchange` 的发现延迟与 UI 行为 | 在目标 build 跑 register → call → unregister smoke test | Phase 2 end | 触发 Winner kill；不接受静态 dashboard 退化 |
| Chrome 149 中 signal/unregister 与进行中调用的行为 | 实机并发/取消测试 | Phase 2 end | 写操作串行；避免 execution 中换 phase |
| 三分支是否让安全 reviewer 更快理解 | 5 个 hallway tests，计时 + 复述 | Phase 5 | 若多数人偏好单推荐，默认只展示 recommended + expandable alternatives |
| UI-only baseline 是否公平且可复现 | 固定模型、任务、seed、次数；记录视频与 trace | Phase 6 | 无法自动化时至少做 3 次人工配对试验并公开局限 |
| Gallery 是否出现同主流程项目 | 每日 15 分钟检查 | 提交前 | 按 kill criteria pivot/differentiate |
| PermitBench 名称法律可用性 | P2 商标/域名检查 | submission 后 | Hackathon 仅作 working name，不作正式商标承诺 |

## Decision summary

```text
Generic A 撞题
→ 搜索模型尚未解决的环境能力
→ 发现 least-privilege 既有强痛点、又有 simulator/enforcement 原语
→ 再搜索 direct products，确认 gateway/approval 已商品化
→ 把差异收敛到 branch + task proof + transactional activation + visible tool scope
→ 与 B/C 统一评分
→ Winner = PermitBench
```
