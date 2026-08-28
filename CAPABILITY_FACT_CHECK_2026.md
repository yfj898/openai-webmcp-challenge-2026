# Capability Fact Check 2026

> 核查日期：2026-08-27（Asia/Shanghai）  
> 范围：OpenAI — The WebMCP Challenge 2026 官方规则与评审要求、WebMCP 规范及浏览器实现状态、与本项目相关的 OpenAI 官方模型/API 能力。  
> 来源策略：比赛事实以 OpenAI Challenge 页面和 Devpost Rules 为准；WebMCP 以 W3C Community Group 草案、官方仓库和浏览器厂商文档为准；OpenAI 能力仅采用 OpenAI Developers 官方文档。未将搜索结果摘要当作证据。

## 0. 可信度标记

- **Confirmed**：官方一手页面、规范或官方仓库直接陈述；截至访问日可以复核。
- **Strong inference**：由多项已确认事实推导，适合产品/比赛决策，但不是官方原话或保证。
- **Unknown**：公开的一手资料不足、实现细节未承诺，或比赛环境下无法提前保证。

网页和 beta 能力仍可能变化。涉及提交截止时间时，应以 [Devpost Official Rules](https://webmcp.devpost.com/rules) 的实时页面为最终操作依据。

---

## 1. Executive Findings

1. **Confirmed** — 硬截止时间是 **2026-09-03 13:00 Pacific Time**，即 **2026-09-04 04:00（UTC+8）**。当前 OpenAI 活动页与 Devpost Rules 均显示 13:00；仓库中记录的“OpenAI 页面 17:00、Devpost 13:00”差异截至本次访问已经消失。[OpenAI Challenge](https://openai.com/webmcp-challenge/) · [Devpost Rules](https://webmcp.devpost.com/rules)
2. **Confirmed** — 评审先经过可行性/主题/API 使用的 pass/fail，再按四项等权标准评分：**WebMCP Leverage、Execution、Potential Impact、Creativity & Ambition**。同分时按此顺序依次比较，因此 WebMCP Leverage 实际上还是第一 tie-breaker。[Devpost Rules](https://webmcp.devpost.com/rules)
3. **Confirmed** — WebMCP 当前是 **2026-08-26 Draft Community Group Report**，不是 W3C Recommendation，也不在 W3C standards track。可依赖的核心是网页通过 `document.modelContext` 注册、查询、执行和动态变更结构化工具；声明式 WebMCP 仍是规范中的 TODO。[WebMCP Specification](https://webmachinelearning.github.io/webmcp/)
4. **Confirmed** — 比赛可测试环境是 ChatGPT Desktop in-app browser，或 Chrome 149+ 开启测试 flag。更广泛的生态仍处于早期：Chrome 149 和 Edge 150 为 origin trial，Brave 为实验支持，Firefox 未落地，WebKit/Safari 立场反对。不能把“浏览器普遍支持”写进产品承诺。[Devpost Rules](https://webmcp.devpost.com/rules) · [Implementation Status](https://github.com/webmachinelearning/webmcp/blob/main/implementation-status.md)
5. **Confirmed** — WebMCP 本身没有提供事务、preview/commit、版本检查、幂等、rollback、receipt 或业务验证。它提供网页工具语义和调用通道；上述可靠性能力必须由应用层实现。[WebMCP Specification](https://webmachinelearning.github.io/webmcp/)
6. **Confirmed** — `gpt-5.6` 是 `gpt-5.6-sol` 的别名；支持 Responses API、function calling、Structured Outputs，以及 web/file search、computer、MCP、tool search、hosted shell、code interpreter 等 Responses 工具。模型页列出 1,050,000 token context window 和 128,000 max output。[GPT-5.6 Model](https://developers.openai.com/api/docs/models/gpt-5.6-sol)
7. **Confirmed** — Responses API 支持 background mode、工具调用、多轮状态、并行工具调用、结构化输出和可取消状态，但这不是业务 workspace 的 authoritative state、事务日志或 durable workflow engine。[Responses Migration Guide](https://developers.openai.com/api/docs/guides/migrate-to-responses) · [Create Response Reference](https://developers.openai.com/api/reference/resources/responses/methods/create)
8. **Confirmed** — GPT-5.6 的 Programmatic Tool Calling、tool search 和 multi-agent 能力真实存在；但三者边界不同：PTC 是受限 V8 中的工具编排，tool search 是 Responses 工具 schema 的延迟发现，multi-agent 仍为 beta。它们都不会自动给 WebMCP 页面提供分支隔离、权限、审批或验证。[PTC Guide](https://developers.openai.com/api/docs/guides/tools-programmatic-tool-calling) · [Tool Search Guide](https://developers.openai.com/api/docs/guides/tools-tool-search) · [Multi-Agent Guide](https://developers.openai.com/api/docs/guides/responses-multi-agent)
9. **Strong inference** — Top-10 方案应让结构化页面工具直接产生用户可见的状态变化，并在短视频中展示 WebMCP 相比 UI automation 的可靠性收益。纯 API backend、普通 chat sidebar、把 REST/MCP server 包装成页面，都会较难拿到高 WebMCP Leverage。
10. **Unknown** — ChatGPT Desktop 比赛构建中，动态 `toolchange`、annotations、取消、错误展示、用户确认 UI 的全部具体行为没有形成公开稳定契约。MVP 应在目标客户端实测，且不要把安全审批完全委托给客户端。

---

## 2. Challenge Rules and Submission Requirements

### 2.1 官方时间表

| 事项 | 核查结论 | 证据与影响 |
|---|---|---|
| 开发/提交期 | **Confirmed** — Devpost Rules：2026-08-25 11:00 PT 至 2026-09-03 13:00 PT。 | [Devpost Rules](https://webmcp.devpost.com/rules)。OpenAI landing page 对开始时间写 12:00 PT，存在一小时差异；对当前执行无实质影响。 |
| 硬截止 | **Confirmed** — 2026-09-03 13:00 PT；换算为 UTC+8 是 2026-09-04 04:00。 | [OpenAI Challenge](https://openai.com/webmcp-challenge/) 与 [Devpost Rules](https://webmcp.devpost.com/rules) 当前一致。提交计划按 Devpost Rules 保留缓冲。 |
| 评审期 | **Confirmed** — 2026-09-04 10:00 PT 至 2026-09-21 17:00 PT。 | [Devpost Rules](https://webmcp.devpost.com/rules)。应用需在评审期持续可访问。 |
| 获奖公告 | **Confirmed** — 预计 2026-09-23 14:00 PT 左右。 | [Devpost Rules](https://webmcp.devpost.com/rules)。OpenAI landing page简写为 9 月 23 日。 |
| 奖项 | **Confirmed** — Top 10 每个项目获得 OpenAI 现金 3,000 美元、Netlify 现金 500 美元及列出的 credits/订阅/实物权益；每个 winner 现金 3,500 美元，总现金奖 35,000 美元。 | [Devpost Rules — Prizes](https://webmcp.devpost.com/rules) · [OpenAI Challenge](https://openai.com/webmcp-challenge/) |

### 2.2 项目资格和范围

- **Confirmed** — Official Rules 要求个人/组织满足年龄或合法实体条件、OpenAI API supported-country 条件，并另外排除若干居住地/注册地，包括中国大陆与香港等。当前 workspace 时区不能证明参赛主体的法律 residence/domicile；必须由项目负责人对照 live Rules 确认，模糊情况直接咨询 Devpost/OpenAI。[Devpost Rules](https://webmcp.devpost.com/rules)
- **Confirmed** — 项目必须在活动期内新建，或是既有项目在活动期内完成了对 WebMCP 的“meaningful extension”；需要可用时间戳证据说明新工作。[Devpost Rules](https://webmcp.devpost.com/rules)
- **Confirmed** — 项目必须是可运行应用，而不是只提交概念、mock 或不可操作的 proof-of-concept。[Devpost Rules](https://webmcp.devpost.com/rules)
- **Confirmed** — 必须使用 WebMCP；Stage 1 会检查 Theme/Application Programming Interface requirements。[Devpost Rules](https://webmcp.devpost.com/rules)
- **Confirmed** — 应用需要有可访问 live URL，并能通过 **ChatGPT desktop in-app browser** 或 **Chrome 149+ 开启 `chrome://flags/#enable-webmcp-testing`** 使用。[Devpost Rules](https://webmcp.devpost.com/rules)
- **Confirmed** — 参赛者可以使用第三方 API、开源库或已有资产，但必须拥有相应使用权并遵守其条款。[Devpost Rules](https://webmcp.devpost.com/rules)
- **Unknown** — Rules 中“may not submit more than one Submission”与紧随其后的“each Submission must be unique”文字逻辑不够清楚。最安全操作是按每位参赛者/团队仅提交一个项目执行，不依赖多投策略。

### 2.3 必须提交的材料

| 材料 | 官方要求 | 本项目的操作含义 |
|---|---|---|
| 文本描述 | **Confirmed** — 说明项目为什么符合主题、怎样改善用户体验、人和 Agent 各自能完成什么、以及 WebMCP 如何实现。 | 描述不能只写功能清单；需要明确 before/after 和 WebMCP necessity。 |
| 公开源码 | **Confirmed** — 公共 GitHub/GitLab/Bitbucket repo，包含源码、资产和运行说明。 | 评委应能从 README 快速复现 WebMCP 路径。 |
| 开源许可 | **Confirmed** — License 应在 repo 顶部或 About/description 区域明显可见。 | 提交前同时检查 `LICENSE` 与 GitHub About。 |
| Live URL | **Confirmed** — 免费、无访问限制地维持到评审结束；若必须私有，需要提供测试凭据。 | 不依赖仅本地环境；避免付费墙和审批式邀请。 |
| Demo 视频 | **Confirmed** — 公共 YouTube，少于 3 分钟，展示 functioning application，并含解释性音频。 | 目标 2:40–2:55，避免上传后因平台时长四舍五入越界。 |
| 视频素材 | **Confirmed** — 不得使用无授权第三方商标、音乐等内容。 | 使用自有 UI、无版权音乐或不加音乐。 |
| 语言 | **Confirmed** — 提交材料必须为英文，或附英文翻译。 | 中文内部文档可以保留，最终 Devpost、README 核心段落和视频旁白/字幕需英文。 |
| 截止后修改 | **Confirmed** — 提交期结束后通常不能修改，只有管理员允许的有限修复例外。 | 不把截止后的补材料当计划；提前冻结 repo、视频和 URL。 |

### 2.4 评审流程和评分

#### Stage 1：资格/可行性 gate

- **Confirmed** — 评委先作 pass/fail 判定，检查提交 viability、是否符合主题以及是否满足 API 要求。[Devpost Rules](https://webmcp.devpost.com/rules)
- **Strong inference** — 没有 live happy path、视频看不出 WebMCP、或项目看起来只是界面原型，可能尚未进入四维评分就被挡住。

#### Stage 2：四项等权评分

| 维度 | 官方定义要点 | 可验证的产品含义 |
|---|---|---|
| WebMCP Leverage | **Confirmed** — 是否使用 WebMCP；集成是否 working、non-trivial，并体现 genuine effort。 | 至少一个核心任务必须依靠 semantic tools 完成，且 UI 对调用有可见反馈。 |
| Execution | **Confirmed** — 产品是否 coherent、working，而不只是 proof-of-concept。 | 可靠 happy path、失败反馈、部署稳定性比额外功能数量重要。 |
| Potential Impact | **Confirmed** — 是否解决真实、具体问题；用户/受众是否明确。 | 用具体 persona、紧急工作和现有痛点解释价值，避免“所有知识工作者”。 |
| Creativity & Ambition | **Confirmed** — 是否新颖、和已有方向有差异、展现足够 ambition。 | 差异化应来自 human-agent shared state 和可靠执行模型，而不是 agent 数量。 |

- **Confirmed** — 四项在 Stage 2 **等权**。[Devpost Rules](https://webmcp.devpost.com/rules)
- **Confirmed** — 同分时依次比较 WebMCP Leverage、Execution、Potential Impact、Creativity & Ambition；仍同分则由 judges vote。[Devpost Rules](https://webmcp.devpost.com/rules)
- **Strong inference** — 评委心理模型很可能是：“这是只有网页把自身语义暴露给 Agent 后才自然成立的协作体验吗？现在真的跑通了吗？三分钟内能看到价值吗？”
- **Strong inference** — “MCP wrapper”危险信号包括：页面只承载 chat；真正操作在远程 API；WebMCP 工具只是转发通用 REST；人看不到 Agent 操作的同一状态；删掉 WebMCP 后 demo 几乎不变。
- **Confirmed** — Judges 不承诺一定亲自操作项目，可以依据 description、images 和 demo video 判断。[Devpost Rules](https://webmcp.devpost.com/rules)
- **Strong inference** — 视频必须自解释；live URL 是 gate 和可信证据，但不能依赖评委手动探索才能发现 killer workflow。

### 2.5 官方活动页传达的产品方向

- **Confirmed** — OpenAI 将 WebMCP 描述为让网站向 AI Agent 提供 structured tools 的 experimental open standard，并强调“apps become meaningfully better when humans and agents use them together”。[OpenAI Challenge](https://openai.com/webmcp-challenge/)
- **Confirmed** — WebMCP 官方仓库将 client-side WebMCP 定位为 shared state、user control、interaction with web applications；其 non-goals 包括 fully autonomous headless workflows、替代 backend MCP、替代 human-facing UI。[WebMCP Repository](https://github.com/webmachinelearning/webmcp)
- **Strong inference** — 最贴合主题的 demo 是：用户正在页面里处理真实状态，Agent 通过页面注册的高层工具读取/改变这份状态，用户同步看见、干预和批准，而不是 Agent 在后台完成后返回一段答案。

---

## 3. WebMCP Specification Fact Check

### 3.1 标准成熟度

- **Confirmed** — 当前公开规范标题为 **WebMCP API — Draft Community Group Report, 26 August 2026**。[WebMCP Specification](https://webmachinelearning.github.io/webmcp/)
- **Confirmed** — 发布者是 W3C Web Machine Learning Community Group；页面明确说明它不是 W3C Standard，也不在 W3C standards track。[WebMCP Specification](https://webmachinelearning.github.io/webmcp/)
- **Strong inference** — Hackathon P0 可以针对比赛指定实现开发，但商业路线必须预留 API 和浏览器行为变化；不要把当前草案包装成已稳定跨浏览器标准。

### 3.2 当前已写入规范的 imperative API

| 能力 | 状态与官方事实 | 设计影响 |
|---|---|---|
| 入口 | **Confirmed** — 安全上下文中通过 `Document.modelContext` 暴露 `ModelContext`。 | 必须 HTTPS 部署；本地测试环境按浏览器规则配置。 |
| 注册工具 | **Confirmed** — `registerTool(tool, options)`。 | 页面按语义注册高价值工具，不需要模拟 DOM 点击。 |
| 枚举工具 | **Confirmed** — `getTools()`。 | 可用于开发调试；不要把返回值当权限系统。 |
| 执行工具 | **Confirmed** — `executeTool(name, inputArguments)`。 | 页面实现仍要做运行时输入验证、权限和业务校验。 |
| 工具变化事件 | **Confirmed** — `toolchange` event / `ontoolchange`。 | 页面可根据 workflow phase 注册/注销工具；这是 dynamic tool scope 的 Web 平台基础。 |
| 取消 | **Confirmed** — `execute` 回调可获得 `AbortSignal`；注册 options 也支持 `signal` 用于注销。 | 长任务应实现 cooperative cancellation，不能忽略 `AbortSignal`。 |
| 来源限制 | **Confirmed** — 注册 options 的 `exposedTo` 可限制允许访问工具的 origins。 | 可做 origin boundary，但不是用户角色权限的替代品。 |
| Permissions Policy | **Confirmed** — feature 名为 `tools`，默认 allowlist 是 `'self'`；跨 origin 需要显式授权。 | iframe/cross-origin 集成需单独验证，P0 最好保持 same-origin。 |

[WebMCP Specification](https://webmachinelearning.github.io/webmcp/) · [Chrome Imperative API](https://developer.chrome.com/docs/ai/webmcp/imperative-api)

### 3.3 Tool contract

- **Confirmed** — 当前 tool dictionary 要求 `name`、`description`、`execute`；可选 `title`、`inputSchema`、`annotations`。[WebMCP Specification](https://webmachinelearning.github.io/webmcp/)
- **Confirmed** — 当前规范中标准化的 annotations 是 `readOnlyHint` 和 `untrustedContentHint`。[WebMCP Specification](https://webmachinelearning.github.io/webmcp/)
- **Unknown** — `destructiveHint`、`idempotentHint`、私有 risk level 或自定义 approval metadata 不属于当前 WebMCP 规范承诺。应用可以维护自己的 metadata，但不能假设所有客户端理解或执行它。
- **Confirmed** — Chrome best practices 明确要求实现方仍对实际参数进行严格代码验证，因为 agent/browser 不保证只传入符合 schema 的值。[Chrome Best Practices](https://developer.chrome.com/docs/ai/webmcp/best-practices)
- **Strong inference** — JSON Schema 是发现和引导层；真正的 invariant、权限和版本检查必须在 tool handler 内作为强制条件执行。

### 3.4 Dynamic Tool Scope

- **Confirmed** — WebMCP 支持运行时注册、注销和 `toolchange`，因此 `explore → review → approved` 阶段只暴露相关工具在 API 层可实现。[WebMCP Specification](https://webmachinelearning.github.io/webmcp/) · [Chrome Imperative API](https://developer.chrome.com/docs/ai/webmcp/imperative-api)
- **Confirmed** — Chrome 官方 best practices 建议只在工具有用时注册，不再有用时注销；虽然没有硬性工具数量上限，但更多工具会增加 context 和选择难度。[Chrome Best Practices](https://developer.chrome.com/docs/ai/webmcp/best-practices)
- **Strong inference** — Dynamic Tool Scope 很可能降低错误工具选择和 accidental writes，但目前没有官方基准证明具体降幅。项目若声称“降低 X%”需要自己做 eval。
- **Unknown** — ChatGPT Desktop 在收到快速连续 `toolchange`、工具同名重注册或正在执行时注销工具的精确 UX/竞态行为，公开文档不足。P0 应使用简单、可重复的 phase transition 并在目标客户端实测。
- **Confirmed** — Chrome 文档指出从 Chrome 153 起，注销工具不会取消已在执行的调用；比赛指定 Chrome 149，不能把 153 的后续语义反推为比赛客户端保证。[Chrome Imperative API](https://developer.chrome.com/docs/ai/webmcp/imperative-api)

### 3.5 Declarative API 状态

- **Confirmed** — 当前规范中的 declarative section 明确是 **entirely a TODO**，并指向 explainer；具体 algorithm/steps 也仍是 TODO。[WebMCP Specification](https://webmachinelearning.github.io/webmcp/)
- **Strong inference** — 可以把 declarative WebMCP 写成未来方向或 P2 研究，但 P0 不应依赖未定型 attributes，也不应在提交中声称它是稳定规范能力。

### 3.6 WebMCP 没有替应用解决的事项

下列项目均为当前产品需要自行实现的 application semantics：

- **Confirmed** — WebMCP 没有原生 `preview_mutation → validate → commit` 事务协议。
- **Confirmed** — WebMCP 没有原生 `expected_version`、optimistic concurrency control 或 stale-state conflict resolution。
- **Confirmed** — WebMCP 没有原生 idempotency key、deduplication 或 exactly-once execution。
- **Confirmed** — WebMCP 没有原生 branch/fork/merge/rollback/checkpoint。
- **Confirmed** — WebMCP 没有原生 approval role、RBAC 或不可逆操作确认策略。
- **Confirmed** — WebMCP 没有原生 receipt、audit log 或业务 verification result。
- **Confirmed** — 规范安全章节指出工具没有普适 verification mechanism 或 behavioral contract，语义仍可能模糊。[WebMCP Specification](https://webmachinelearning.github.io/webmcp/)
- **Strong inference** — 对本项目而言，这不是缺点而是产品机会：WebMCP 负责让 Agent 调用页面的语义动作，产品负责 authoritative state、权限、事务、协作和验证。

### 3.7 安全边界

- **Confirmed** — 规范讨论的风险包括 tool metadata poisoning、tool output injection、恶意实现、overparameterization/privacy、same-origin 与 private browsing 相关风险。[WebMCP Specification](https://webmachinelearning.github.io/webmcp/)
- **Confirmed** — `untrustedContentHint` 是提示信号，不是安全保证；客户端和应用仍需验证输出、限制权限。[Chrome Secure Tools](https://developer.chrome.com/docs/ai/webmcp/secure-tools)
- **Confirmed** — Chrome 文档建议准确标注 read-only/untrusted，避免把外部文本包装成可信指令，并在代码中强制安全规则。[Chrome Secure Tools](https://developer.chrome.com/docs/ai/webmcp/secure-tools)
- **Strong inference** — 敏感 P0 写操作应始终经过应用自己的 `preview + visible human approval + version check`；即使客户端未来提供确认 UI，也不应成为唯一防线。

---

## 4. Browser and Client Support Status

| 客户端/浏览器 | 截至 2026-08-27 的官方状态 | 结论 |
|---|---|---|
| ChatGPT Desktop in-app browser | **Confirmed** — WebMCP implementation status 标为 supported；也是比赛 Rules 明列测试路径。 | 比赛必须至少完整跑通一次。具体版本/rollout 行为仍可能变化。 |
| Google Chrome | **Confirmed** — Chrome 149 origin trial；比赛允许 Chrome 149+ 开启 `#enable-webmcp-testing`。 | 属于 experimental / time-limited 路径，不等于一般用户默认可用。 |
| Microsoft Edge | **Confirmed** — Edge 150 origin trial live。 | 可作为额外兼容性验证，不是比赛 P0 必需。 |
| Brave | **Confirmed** — Brave Leo experimental support。 | 实验支持；不应扩张 QA 范围影响核心 demo。 |
| Firefox | **Confirmed** — implementation status 有跟踪项，Mozilla 标注 neutral/proposed，未显示可用实现。 | 不能声称支持。 |
| Safari / WebKit | **Confirmed** — implementation status 记录 WebKit standards position opposed，未显示可用实现。 | 不能声称支持。 |

来源：[WebMCP Implementation Status](https://github.com/webmachinelearning/webmcp/blob/main/implementation-status.md) · [Chrome Origin Trial Announcement](https://developer.chrome.com/blog/ai-webmcp-origin-trial) · [Devpost Rules](https://webmcp.devpost.com/rules)

- **Confirmed** — Chrome 将 origin trial 描述为 experimental、time-limited 的方式。[Chrome Origin Trial Announcement](https://developer.chrome.com/blog/ai-webmcp-origin-trial)
- **Strong inference** — MVP 的兼容性承诺应写成“tested in Challenge-supported ChatGPT Desktop/Chrome 149 environment”，而不是“works in all modern browsers”。
- **Unknown** — 评委实际使用的 ChatGPT Desktop build、操作系统、账号 rollout 和功能开关未公开固定；demo 不能只依赖某个未验证的桌面 build。

---

## 5. OpenAI Model and API Capability Fact Check

### 5.1 GPT-5.6

| 能力 | 核查结论 | 产品边界 |
|---|---|---|
| 模型标识 | **Confirmed** — `gpt-5.6` alias 指向 `gpt-5.6-sol`。 | 代码可使用 alias，最终 demo 前应固定实测版本/行为记录。 |
| 上下文/输出 | **Confirmed** — 1,050,000 context window；128,000 max output。 | 长上下文可用，但不是每次 dump 全 workspace 的理由。 |
| 输入/输出模态 | **Confirmed** — text input/output、image input；不支持 audio/video。 | 页面截图/vision 可用；语音或视频处理需其他模型/服务。 |
| Reasoning effort | **Confirmed** — 支持 none、low、medium（默认）、high、xhigh、max。 | P0 可按任务成本/延迟选择，关键决策用较高 effort。 |
| Function calling | **Confirmed** — 支持。 | 可调用应用外部工具；和 WebMCP 页面工具不是自动同一 registry。 |
| Structured Outputs | **Confirmed** — 支持。 | 结构合法不等于业务正确，仍需 deterministic validation。 |
| Responses tools | **Confirmed** — model page列出 web search、file search、image generation、code interpreter、hosted shell、apply patch、skills、computer use、MCP、tool search。 | 只启用任务真正需要的工具；避免工具面过大。 |
| Fine-tuning | **Confirmed** — 不支持。 | Hackathon 不应规划微调。 |

来源：[GPT-5.6 Model](https://developers.openai.com/api/docs/models/gpt-5.6-sol) · [Latest Model Guide](https://developers.openai.com/api/docs/guides/latest-model)

- **Confirmed** — OpenAI 的 GPT-5.6 指南强调 intent understanding、token efficiency、Programmatic Tool Calling、multi-agent beta、persisted reasoning 等能力，并建议只暴露相关工具、保持 prompts 精简。[Latest Model Guide](https://developers.openai.com/api/docs/guides/latest-model)
- **Strong inference** — 产品不需要自研硬编码“思考树”；更有价值的是让强模型在稳定 IDs、约束、事务边界和验证条件内行动。
- **Unknown** — 在本项目具体 WebMCP tool set 上的成功率、延迟、成本和误调用率没有官方保证，必须用自己的 benchmark 评估。

### 5.2 Responses API

- **Confirmed** — OpenAI 推荐新项目使用 Responses API；它统一了 text/image 输入、内置 web search、file search、computer use、code interpreter 和 remote MCP 等能力。[Responses Migration Guide](https://developers.openai.com/api/docs/guides/migrate-to-responses)
- **Confirmed** — Responses 可以通过 `previous_response_id` 或 conversation 延续多轮状态。[Conversation State Guide](https://developers.openai.com/api/docs/guides/conversation-state)
- **Confirmed** — create response 支持 `tools`、`parallel_tool_calls`、`max_tool_calls`、`background`，以及 structured text format；response status 包括 queued、in_progress、completed、failed、cancelled、incomplete。[Create Response Reference](https://developers.openai.com/api/reference/resources/responses/methods/create)
- **Strong inference** — `parallel_tool_calls` 是模型/请求级并行能力，不提供 branch isolation；多个写工具触达同一 workspace 时仍需版本检查或串行 commit。
- **Confirmed** — OpenAI API 的 conversation/response persistence 是模型会话机制，并未承诺成为业务数据库、权限系统、审计账本或事务引擎。[Conversation State Guide](https://developers.openai.com/api/docs/guides/conversation-state)
- **Strong inference** — authoritative workspace state 应存放在应用数据库中；Responses history 只保留推理和交互上下文。每个 tool call 重新读取/验证关键版本，而不是信任模型记忆。

### 5.3 Programmatic Tool Calling（PTC）

- **Confirmed** — PTC 让模型在 Responses 请求内生成并运行 JavaScript，以条件、循环、并行等方式协调多个工具调用，而不必把所有中间结果逐一送回模型上下文。[PTC Guide](https://developers.openai.com/api/docs/guides/tools-programmatic-tool-calling)
- **Confirmed** — 使用 `programmatic_tool_calling` 工具，并通过具体工具的 `allowed_callers` 决定 direct、programmatic 或两者均可。[PTC Guide](https://developers.openai.com/api/docs/guides/tools-programmatic-tool-calling)
- **Confirmed** — 可被程序化调用的类型包括 function/custom、MCP、apply_patch、shell、code_interpreter。[PTC Guide](https://developers.openai.com/api/docs/guides/tools-programmatic-tool-calling)
- **Confirmed** — PTC runtime 是新的隔离 V8，支持 top-level `await`，但没有 Node.js、第三方包、直接网络、通用文件系统、subprocess、console 或跨调用持久 JS state。[PTC Guide](https://developers.openai.com/api/docs/guides/tools-programmatic-tool-calling)
- **Confirmed** — 官方建议涉及写入或 approval-sensitive 的工具默认 direct call，以便模型在调用前重新判断；需要模型解释/引用的动作也更适合 direct。[PTC Guide](https://developers.openai.com/api/docs/guides/tools-programmatic-tool-calling)
- **Strong inference** — PTC 适合 branch 结果的过滤、join、排序、聚合、去重、结构化校验；它不是通用 sandbox，也不应绕过 human approval。
- **Unknown** — 公开 OpenAI 文档没有确认浏览器页面注册的 WebMCP tools 会被 Responses PTC 直接发现或按 `allowed_callers` 调用。除非自行搭建桥接层并实测，不应把两者写成自动集成。

### 5.4 Tool Search / Deferred Loading

- **Confirmed** — Responses `tool_search` 可在需要时搜索并加载标记 `defer_loading: true` 的工具，避免把所有 tool schemas 预先放进上下文。[Tool Search Guide](https://developers.openai.com/api/docs/guides/tools-tool-search)
- **Confirmed** — 当前支持 functions、namespaces 和 MCP servers；官方推荐 namespaces/MCP，并建议 namespace 中保持少于约 10 个 functions。[Tool Search Guide](https://developers.openai.com/api/docs/guides/tools-tool-search)
- **Confirmed** — Tool search 仅支持 GPT-5.4 及以上模型，GPT-5.6 支持。[Tool Search Guide](https://developers.openai.com/api/docs/guides/tools-tool-search)
- **Confirmed** — 延迟加载有助于减少 upfront tokens/cost 并保持 prompt cache，但是否提升任务成功率仍取决于 schema、描述和任务。[Tool Search Guide](https://developers.openai.com/api/docs/guides/tools-tool-search)
- **Strong inference** — 对本项目有两层不同的 tool scope：
  1. WebMCP 页面根据 workspace phase `registerTool` / unregister；
  2. Responses runtime 根据 `tool_search` 延迟加载 function/MCP schemas。
  二者理念相似但不是同一个协议或同一实现。
- **Unknown** — ChatGPT Desktop WebMCP client 是否内部采用 OpenAI Responses `tool_search`、怎样给工具排序、最多保留多少 schema，官方没有公开保证。

### 5.5 Computer Use

- **Confirmed** — Computer use 让模型基于 screenshot 返回 UI actions；开发者必须提供隔离 browser/VM、实际执行动作、截图并回传，形成 model call → execute → screenshot → repeat 循环。[Computer Use Guide](https://developers.openai.com/api/docs/guides/tools-computer-use)
- **Confirmed** — 当前文档区分 GA `computer` flow 和 legacy `computer-use-preview`；GPT-5.6 示例使用 `{ "type": "computer" }`。[Computer Use Guide](https://developers.openai.com/api/docs/guides/tools-computer-use)
- **Confirmed** — 官方建议隔离 browser/container、限制 domain/action，并对 purchase、authentication、destructive 或难以撤销的动作保留 human-in-the-loop；页面内容应视为 untrusted input。[Computer Use Guide](https://developers.openai.com/api/docs/guides/tools-computer-use)
- **Strong inference** — Computer use 是 WebMCP 的有效 baseline/补充：它可以操作没有 semantic tools 的 UI，但步骤多、易受界面变化影响；WebMCP 的价值应通过更少调用、更少错误、可验证语义动作来证明。
- **Confirmed** — 模型/API 不会替项目自动托管完整 browser session；执行环境仍是应用/harness 责任。[Computer Use Guide](https://developers.openai.com/api/docs/guides/tools-computer-use)

### 5.6 Background Mode、WebSocket Mode 与 Compaction

#### Background mode

- **Confirmed** — `background: true` 可异步运行耗时 Responses；客户端可轮询 queued/in_progress，读取结果或调用 cancel endpoint。[Background Mode Guide](https://developers.openai.com/api/docs/guides/background)
- **Confirmed** — 如果创建时使用 streaming，可以断线后根据 sequence cursor 恢复 background stream。[Background Mode Guide](https://developers.openai.com/api/docs/guides/background)
- **Confirmed** — background response 会在连接断开后继续执行。[Background Mode Guide](https://developers.openai.com/api/docs/guides/background)
- **Confirmed** — background mode 即使 `store=false` 也会为轮询暂存响应数据；当前文档说明大约 10 分钟。[Background Mode Guide](https://developers.openai.com/api/docs/guides/background)
- **Strong inference** — 它提高模型请求的连接容错，但不等于 durable application workflow：业务 checkpoint、幂等、resume cursor、状态机和补偿仍由应用实现。

#### WebSocket mode

- **Confirmed** — Responses WebSocket mode 提供持久 `/v1/responses` 连接，适合 long-running、tool-call-heavy workflows，支持并行 conversation multiplexing、fork 和 `previous_response_id` 延续。[WebSocket Mode Guide](https://developers.openai.com/api/docs/guides/websocket-mode)
- **Strong inference** — 如果 demo 只有数分钟且工具调用有限，普通 Responses 请求 + background/polling 已足够；不要为“实时”引入非必要 WebSocket 复杂度。

#### Compaction

- **Confirmed** — OpenAI 支持 server-side 和 standalone compaction，以在长对话中保留所需 conversational state 并控制 context/cost/latency。[Compaction Guide](https://developers.openai.com/api/docs/guides/compaction)
- **Confirmed** — standalone compaction 可用于 stateless/ZDR-friendly 流程。[Compaction Guide](https://developers.openai.com/api/docs/guides/compaction)
- **Strong inference** — compaction 解决模型对话上下文问题，不解决 authoritative domain state。`get_changed_since(version)` 等 compact state projection 仍有独立价值。

### 5.7 Structured Outputs

- **Confirmed** — Structured Outputs 让模型输出遵守开发者提供的 JSON Schema；GPT-5.6 支持。[Structured Outputs Guide](https://developers.openai.com/api/docs/guides/structured-outputs) · [GPT-5.6 Model](https://developers.openai.com/api/docs/models/gpt-5.6-sol)
- **Confirmed** — 可通过 function calling，或 Responses 的 `text.format` / JSON Schema response format 使用。[Structured Outputs Guide](https://developers.openai.com/api/docs/guides/structured-outputs)
- **Confirmed** — 调用方仍应处理 refusal、incomplete response 和其他未产生预期 payload 的状态。[Structured Outputs Guide](https://developers.openai.com/api/docs/guides/structured-outputs)
- **Strong inference** — Schema adherence 只证明“形状合法”，不证明内容真实、约束通过或 mutation 已生效。预算、版本、覆盖率、权限等 invariant 应由确定性代码核查，再把结果可视化。

### 5.8 Multi-Agent / Subagents

- **Confirmed** — OpenAI Responses multi-agent 能力对 GPT-5.6 可用，但当前是 **beta**，需要相应 beta header/SDK，schema 可能变化。[Multi-Agent Guide](https://developers.openai.com/api/docs/guides/responses-multi-agent)
- **Confirmed** — root agent 可以生成并协调 subagents 并行处理边界清晰的工作，再合成结果；subagents 使用同一请求里的 model/tools，并保有各自聚焦上下文。[Multi-Agent Guide](https://developers.openai.com/api/docs/guides/responses-multi-agent)
- **Confirmed** — 当前默认最多 3 个并发 subagents；文档未设固定 tree total/depth 上限，但成本和延迟仍会增长。[Multi-Agent Guide](https://developers.openai.com/api/docs/guides/responses-multi-agent)
- **Confirmed** — 官方指出 multi-agent 适合独立、并行、上下文可分离的任务；不适合严格顺序链、频繁写同一 shared mutable state 或只是在等待一个慢外部操作。[Multi-Agent Guide](https://developers.openai.com/api/docs/guides/responses-multi-agent)
- **Strong inference** — 如果产品采用多 Agent，应让每个 Agent 操作独立 branch，并由单一 merge/commit authority 处理共享状态；否则 API 原生并行会放大 stale write 和冲突。
- **Confirmed** — Responses multi-agent API 不提供产品层 branch、merge、approval、rollback 或 receipt；这些没有出现在官方能力契约中。[Multi-Agent Guide](https://developers.openai.com/api/docs/guides/responses-multi-agent)
- **Unknown** — beta 在提交当天的账号可用性、速率限制、延迟和 schema 稳定性需要以项目实际 API account 预先 smoke test；不应让 P0 happy path只能依赖 beta subagents。

---

## 6. Capability Boundaries Relevant to Product Design

| 需求 | 现有官方能力可提供 | 应用仍必须提供 |
|---|---|---|
| 理解意图/规划 | **Confirmed** — GPT-5.6 reasoning、intent understanding、tool use。 | 具体 domain constraints、明确的 outcome 与止损条件。 |
| 找到工具 | **Confirmed** — Responses tool search；WebMCP 动态 register/unregister。 | 正确 tool taxonomy、phase policy、权限过滤；两套 registry 的桥接若需要。 |
| 并行探索 | **Confirmed** — GPT-5.6 multi-agent beta、parallel tool calls、PTC 并行。 | branch isolation、资源限额、取消、结果合并与冲突处理。 |
| UI fallback | **Confirmed** — computer use 可基于截图行动。 | browser/VM、action executor、allowlist、screenshot loop、风险确认。 |
| 输出结构 | **Confirmed** — Structured Outputs / JSON Schema。 | 语义验证、业务 invariant、真实世界副作用核验。 |
| 长任务连接 | **Confirmed** — background mode、WebSocket mode、conversation state、compaction。 | durable workflow state、checkpoint、resume、补偿和 idempotency。 |
| 页面语义操作 | **Confirmed** — WebMCP imperative tools。 | authoritative data model、handler validation、transaction/preview/commit、audit。 |
| 安全审批 | **Confirmed** — annotations/origin policy 可提供部分信号和边界。 | RBAC、human approval、不可逆操作保护、敏感字段最小化。 |

- **Strong inference** — “模型一年后再强 5 倍”时，reasoning/planning 组件会商品化；authoritative state、permissions、transactions、collaboration、verification 和 durability 会变得更重要，因为更强模型能发起更多、更复杂的真实写操作。
- **Strong inference** — 产品应该把模型当 intelligence layer，把 WebMCP 当浏览器内 semantic action interface，把应用数据库/状态机当 truth and safety layer。

---

## 7. Known Unknowns Requiring Local Verification

以下问题在官方公开资料中没有足够保证，必须在目标客户端或实际 API account 上验证：

1. **Unknown** — ChatGPT Desktop 判断何时发现新注册 WebMCP tool、处理 `toolchange` 的延迟与排序。
2. **Unknown** — ChatGPT Desktop 是否展示/如何展示 `readOnlyHint`、`untrustedContentHint`，以及是否有一致的敏感操作确认 UI。
3. **Unknown** — WebMCP tool 返回对象的实用大小上限、超时、流式输出支持和错误呈现 UX。
4. **Unknown** — 比赛评委最终使用的 ChatGPT Desktop build、OS 和账号 rollout。
5. **Unknown** — Responses `tool_search` 或 PTC 与网页 WebMCP registry 是否存在 OpenAI 内部自动桥接；公开文档未承诺。
6. **Unknown** — GPT-5.6 multi-agent beta 在项目 API account 的可用权限、速率和稳定性。
7. **Unknown** — Dynamic Tool Scope 对本产品误调用率和 token 用量的实际提升幅度；需要自建 UI-only vs WebMCP benchmark。
8. **Unknown** — `untrustedContentHint` 在所有 challenge-supported clients 的具体 enforcement；应用必须把它视为提示而非 sandbox。
9. **Unknown** — Chrome 149 challenge flag 的行为与 Chrome 153 后续文档语义是否完全一致；必须以 Chrome 149/实际比赛客户端实测。
10. **Unknown** — Judges 是否会运行 live app。Rules 明确他们没有义务运行，因此视频必须单独成立。

### 最小验证清单

- **Strong inference** — 在 ChatGPT Desktop 和 Chrome 149 challenge path 各跑一次：register → discover → call → visible UI update → unregister。
- **Strong inference** — 对每个 write tool 测试：invalid JSON、schema-valid-but-invalid business value、stale version、duplicate idempotency key、取消、网络失败。
- **Strong inference** — 在实际 OpenAI account smoke test：GPT-5.6 alias、Structured Outputs、background mode；multi-agent beta 作为可降级增强项。
- **Strong inference** — 录制视频前做 clean-account / incognito-like 环境复现，避免 demo 只依赖开发机缓存或预授权。

---

## 8. Conflict Audit Against Existing Repository Materials

本节记录核查时发现的冲突。最终综合阶段已据此更新 `README.md`、`OFFICIAL_RESEARCH.md` 与 `SUBMISSION_CHECKLIST.md`；表中的“既有主张”保留为历史审计对象。

| 既有文件/主张 | 本次核查 | 处理建议 |
|---|---|---|
| `README.md` / `OFFICIAL_RESEARCH.md`：OpenAI 页面显示 9 月 3 日 17:00，Devpost 显示 13:00。 | **Confirmed conflict / resolved** — 截至 2026-08-27，OpenAI live page 已显示 **13:00 PT**，与 Devpost Rules 一致。 | **已处理**：删除“当前仍冲突”的表述，保留历史备注；执行硬截止以 Devpost 13:00 PT 为准。 |
| `OFFICIAL_RESEARCH.md`：官方开始时间 12:00 PT。 | **Confirmed partial conflict** — OpenAI landing page 写 12:00 PT；Devpost Rules 写 11:00 PT。 | 标注来源差异。因为活动已开始，不影响提交；截止时间才是关键。 |
| `SUBMISSION_CHECKLIST.md`：部署 URL、公开 repo、license、少于 3 分钟 YouTube。 | **Confirmed** — 与 Rules 一致。 | **已处理**：补强“英文或英文翻译”“评审期间免费可访问”；原 checklist 已要求清晰音频。 |
| `OFFICIAL_RESEARCH.md`：Chrome 149 + flag、WebMCP draft 2026-08-26。 | **Confirmed**。 | 保留；增加 Draft Community Group Report / not W3C Standard 的成熟度说明。 |
| `OFFICIAL_RESEARCH.md`：WebMCP imperative API 可注册结构化工具。 | **Confirmed**。 | 保留。 |
| 既有材料把 declarative WebMCP 描述为“方向”。 | **Confirmed with caution** — 当前规范 declarative section 仍 entirely TODO。 | 只能写未来方向/P2；不得当成 P0 稳定 API。 |
| `HARNESS_NATIVE_FEATURE_BLUEPRINT.md`：WebMCP annotations 可以表达读写/风险信号。 | **Confirmed only in part** — 当前标准 annotations 只确认 `readOnlyHint`、`untrustedContentHint`。 | 其他 risk/approval fields 作为 app-private metadata，不要宣称标准客户端会执行。 |
| 既有材料把 preview/commit/idempotency/receipt/rollback/verification 与 WebMCP-native 设计结合。 | **Confirmed design direction, not native protocol** — WebMCP 规范没有提供这些机制。 | 文案明确：“通过 WebMCP 暴露的 app-level semantic tools”，而不是“WebMCP 自带事务”。 |
| `MARKET_HARNESS_RESEARCH_2026.md`：GPT-5.6 支持 PTC、tool search、subagents/multi-agent、computer use、long-running workflows。 | **Confirmed with boundaries**。 | 补充：multi-agent 是 beta；PTC 是受限 V8；computer use 需自备 browser/VM；background 不等于 durable workflow。 |
| 既有材料将 dynamic tool scope 与 tool search 同时讨论。 | **Confirmed concepts, distinct mechanisms**。 | WebMCP 的动态范围 = 页面 register/unregister；Responses tool search = deferred function/MCP schema loading。不可混称同一 feature。 |
| 既有材料认为 Structured Outputs 可支撑 verification。 | **Confirmed only as transport/schema aid**。 | 结构输出不证明业务事实；必须保留 deterministic invariant checks。 |
| 既有材料认为 multi-agent branch 能避免共享可变状态冲突。 | **Strong inference** — 合理，但 branch 是应用实现，不是 Responses multi-agent 内建保证。 | 文档中拆开“API 并行能力”和“产品 branch isolation”。 |

### 冲突严重度结论

- **Confirmed** — 没有发现会推翻项目 Harness-native/WebMCP-native 总体研究方向的官方事实冲突。
- **Confirmed** — 需要立即在最终提交材料中纠正的主要事实是：OpenAI landing page 当前已经是 **13:00 PT**，旧的 17:00 差异不再成立。
- **Strong inference** — 最容易造成评委/工程误解的不是方向错误，而是把 app-layer 可靠性机制写成 WebMCP 原生能力，以及把 beta/experimental 能力写成稳定平台承诺。

---

## 9. Implementation Guardrails Derived from Official Facts

1. **Strong inference** — P0 只依赖 imperative WebMCP；declarative attributes 不进入关键路径。
2. **Strong inference** — 目标环境以 ChatGPT Desktop + Chrome 149 challenge path 双验证，其他浏览器支持仅作说明。
3. **Strong inference** — 5–10 个 semantic tools 是合适上限；按阶段注册/注销，同时让 handler 强制权限和版本约束。
4. **Strong inference** — 所有重要写入采用应用层 `preview → validate → human approve → commit → verify → receipt`；工具 annotation 只是辅助信号。
5. **Strong inference** — `expected_version` 和 `idempotency_key` 在服务端执行，不能只出现在 prompt/schema。
6. **Strong inference** — GPT-5.6 负责理解、生成方案、比较和解释；确定性代码负责金额、版本、权限、唯一性和状态转移。
7. **Strong inference** — Responses history、background 和 compaction 不能替代数据库；workspace 使用自己的 durable records。
8. **Strong inference** — multi-agent beta 只用于独立 branch exploration，并准备 single-agent fallback；共享 commit 权限保持单一。
9. **Strong inference** — Computer use 作为 benchmark/fallback，不作为 WebMCP killer flow 的主操作方式。
10. **Strong inference** — 视频先证明页面和 Agent 使用同一实时状态，再展示 branch/preview/approval/verification；不要用 API 日志替代可见 UX。

---

## 10. Official Source Register

全部来源访问日期均为 **2026-08-27**。

### Challenge

1. [OpenAI — The WebMCP Challenge](https://openai.com/webmcp-challenge/) — 活动定位、时间、奖项。
2. [Devpost — WebMCP Challenge Overview](https://webmcp.devpost.com/) — 官方活动入口、环境和奖池概览。
3. [Devpost — Official Rules](https://webmcp.devpost.com/rules) — 资格、时间、提交材料、评审流程和评分标准的控制性来源。
4. [Devpost — Resources](https://webmcp.devpost.com/resources) — 官方开发/调试/评测资源入口。

### WebMCP and browsers

5. [WebMCP API Draft Community Group Report](https://webmachinelearning.github.io/webmcp/) — 当前规范、IDL、security/privacy 和 declarative TODO。
6. [WebMCP Official Repository](https://github.com/webmachinelearning/webmcp) — 定位、explainer、non-goals。
7. [WebMCP Implementation Status](https://github.com/webmachinelearning/webmcp/blob/main/implementation-status.md) — ChatGPT、Chrome、Edge、Brave、Firefox、Safari/WebKit 状态。
8. [Chrome — WebMCP Origin Trial](https://developer.chrome.com/blog/ai-webmcp-origin-trial) — Chrome 149 origin trial 与实验性质。
9. [Chrome — Imperative API](https://developer.chrome.com/docs/ai/webmcp/imperative-api) — register/unregister、cancel、cross-origin 和工具生命周期。
10. [Chrome — WebMCP Best Practices](https://developer.chrome.com/docs/ai/webmcp/best-practices) — tool scope、schema/runtime validation、UI state 和 eval 建议。
11. [Chrome — Build Secure WebMCP Tools](https://developer.chrome.com/docs/ai/webmcp/secure-tools) — annotations、安全提示和不可信内容处理。
12. [Chrome — Web AI Agents](https://developer.chrome.com/docs/ai/agents) — 页面注册工具、浏览器暴露工具、Agent 调用的总体交互模型。

### OpenAI platform

13. [OpenAI — GPT-5.6 Model](https://developers.openai.com/api/docs/models/gpt-5.6-sol) — model alias、context/output、模态、工具与 feature support。
14. [OpenAI — Latest Model Guide](https://developers.openai.com/api/docs/guides/latest-model) — GPT-5.6 reasoning、intent、PTC、multi-agent 与工具暴露建议。
15. [OpenAI — Migrate to Responses](https://developers.openai.com/api/docs/guides/migrate-to-responses) — Responses 推荐定位和内置能力。
16. [OpenAI — Create a Response](https://developers.openai.com/api/reference/resources/responses/methods/create) — request fields、工具、background、parallel calls、status。
17. [OpenAI — Conversation State](https://developers.openai.com/api/docs/guides/conversation-state) — `previous_response_id`、conversation 与状态延续。
18. [OpenAI — Programmatic Tool Calling](https://developers.openai.com/api/docs/guides/tools-programmatic-tool-calling) — PTC runtime、supported tools、`allowed_callers` 和安全边界。
19. [OpenAI — Tool Search](https://developers.openai.com/api/docs/guides/tools-tool-search) — deferred loading、namespaces/MCP 与版本要求。
20. [OpenAI — Computer Use](https://developers.openai.com/api/docs/guides/tools-computer-use) — screenshot/action loop、harness 责任和 human-in-the-loop。
21. [OpenAI — Background Mode](https://developers.openai.com/api/docs/guides/background) — async、polling、stream resume、cancel 和 data retention caveat。
22. [OpenAI — WebSocket Mode](https://developers.openai.com/api/docs/guides/websocket-mode) — persistent Responses connection、multiplexing 和 long-running workflows。
23. [OpenAI — Compaction](https://developers.openai.com/api/docs/guides/compaction) — server-side/standalone compaction。
24. [OpenAI — Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs) — JSON Schema adherence、Responses/function calling 和 failure handling。
25. [OpenAI — Multi-Agent](https://developers.openai.com/api/docs/guides/responses-multi-agent) — GPT-5.6 beta subagents、并发、适用与不适用场景。

---

## 11. Bottom Line

- **Confirmed** — 比赛要求的是一个真实运行、非平凡使用 WebMCP、面向具体问题的产品，并且最终判断高度依赖少于 3 分钟的视频。
- **Confirmed** — WebMCP 目前足以支持 semantic tool registration、dynamic scope、页面可见状态操作和基本安全提示，但仍是早期草案/实验浏览器能力。
- **Confirmed** — GPT-5.6/Responses 已经能承担强 reasoning、工具调用、结构化输出、受限程序化编排、异步运行和 beta 并行 subagents。
- **Strong inference** — 获奖空间不在重新实现模型的 planning，而在把页面变成 human 和 Agent 共用的、可见的、结构化且安全可验证的工作环境。
- **Unknown** — 最终客户端细节和 beta API 行为必须通过项目自身 smoke tests 关闭；任何未验证能力都应有简化 fallback。
