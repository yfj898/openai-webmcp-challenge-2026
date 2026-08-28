# WebMCP Challenge 2026 — 市场、产品与 Agent Harness 全面调研

> 调研日期：2026-08-27（Asia/Singapore）  
> 目标：判断 WebMCP 在 2026 年模型与 Agent Harness 已高度进化的背景下，什么能力仍然真正稀缺、值得做、并能形成比赛差异化。
> 状态：**基础研究，已由 `FINAL_PRODUCT_DECISION.md` 收敛。最终 Winner 是 Candidate A 的具体 wedge：PermitBench；本文中的早期候选评分不再是最终决策。**

---

## 0. 结论先行

### 0.1 市场判断

2025 年的核心问题还是：Agent 能不能看懂网页、找到按钮、点击、填写并完成流程。

到 2026 年 8 月，这一层已经明显商品化：

- GPT-5.6 已具备更强的 browser / computer use / long-horizon tool use。
- Stagehand 已提供 `act / extract / observe / agent`，并加入 WebMCP 支持。
- Playwright MCP 能通过 accessibility snapshot 做结构化浏览器操作。
- Browser Use 已形成成熟的 browser agent loop、视觉补充与工具扩展。
- Chrome DevTools MCP 已把调试、网络、性能等浏览器能力开放给 Agent。
- Cloudflare Browser Run 允许模型直接编排浏览器执行，并强调 durable execution。

因此：

> **“让 AI 会用网页”已经不足以成为产品核心创新。**

WebMCP 更有价值的新机会是：

> **让网站成为一个对 Agent 可理解、可验证、可恢复、可授权的工作环境，而不仅是一个可以被自动点击的 GUI。**

### 0.2 本项目应该优先建设的能力

1. 高层语义工具，而不是 click/type 微操作。
2. 动态工具面，避免一次暴露几十上百个 tools。
3. Preview → Commit 两阶段写操作。
4. Checkpoint / Branch / Undo / Replay。
5. Stable IDs + structured receipts。
6. Read / Write / Sensitive 清晰分级。
7. Batch / query / aggregate tools，适配 Programmatic Tool Calling。
8. 人机共享状态与可视化 diff。

### 0.3 明确不做

- 不做另一个通用 Browser Agent。
- 不做 DOM wrapper。
- 不把 UI 上每个按钮都映射成 WebMCP tool。
- 不做“聊天框 + CRUD 网站”。
- 不让 Agent 每一步都请求用户确认。
- 不为了 multi-agent 概念强行堆角色。
- 不靠超长 system prompt 教模型如何使用产品。

---

# 1. WebMCP 的技术位置

传统网页自动化主要有四条路径：

1. Screenshot / vision + 坐标点击
2. DOM / selector automation
3. Accessibility tree automation
4. 网站私有 API / 后端 MCP

WebMCP 提供第五条路径：

> **由网站自己声明“我能做什么”，并让浏览器里的 Agent 调用这些能力。**

当前 Draft API 的核心形态：

```js
document.modelContext.registerTool({
  name: "...",
  title: "...",
  description: "...",
  inputSchema: { ... },
  annotations: {
    readOnlyHint: true,
    untrustedContentHint: false,
  },
  execute: async (input, { signal }) => {
    // ...
  }
});
```

相关机制包括：

- `getTools()`
- `executeTool()`
- `toolchange` event
- `AbortSignal`
- origin / permissions-policy 边界
- `readOnlyHint`
- `untrustedContentHint`
- Declarative WebMCP（仍在演进）

### 对产品设计的关键启示

WebMCP 不只是“浏览器里的 function calling”。其独特价值在于：

- 继承网页当前登录态和 session。
- Agent 和人处在同一个可视页面状态中。
- tools 可以随页面、路由、选择和权限动态变化。
- 工具定义由第一方应用维护，比 DOM 推断更稳定。
- 浏览器仍可承担权限和执行仲裁边界。

---

# 2. 官方 WebMCP Showcase 已经覆盖什么

OpenAI 当前公开 Showcase 已经覆盖：

| 类别 | 示例 | 核心交互 |
|---|---|---|
| 文档 | Margin Editor | 人与 Agent 在同一文档编辑/评论 |
| 旅行 | WanderNote | 编辑 itinerary、共同规划 |
| 3D | Codex Modeling Studio | Agent 操作结构化 3D scene |
| 音乐 | Fieldwork // 12 | Agent 创建 / 调整 beats |
| 图片 | Webroom | Agent-compatible photo editing |
| 菜谱 | Sunday Table | meals / recipes / groceries |
| 电商 | Verdant Market | 浏览商品、共享购物车 |
| 游戏 | Crossword Desk / Cubecade | Agent 参与结构化游戏状态 |
| 设计 | Paperie | 结构化设计编辑 |
| 数据 | DuckDB-Wasm data exploration | 查询、组合、可视化数据 |

## 2.1 这些示例值得吸收的部分

### A. Agent 操作领域对象，而不是像素

推荐：

```text
add_comment
change_material
add_to_cart
update_itinerary_stop
```

而不是：

```text
click(x, y)
type(selector, text)
```

### B. 同一状态同时服务 Human 与 Agent

- 人看到高质量 UI。
- Agent 看到 schema + structured state。

### C. Agent 修改立即体现在真实 UI

这非常适合 Demo：

```text
一句自然语言目标
→ Agent 调 WebMCP
→ 页面真实改变
→ 人可以继续接手
```

## 2.2 已开始同质化的区域

以下赛道如果没有第二层创新，不建议直接进入：

- shopping cart
- travel planner
- note editor
- todo / kanban
- recipe planner
- basic dashboard
- simple image editing
- generic CRUD admin

---

# 3. 邻近产品 / 竞争技术调研

## 3.1 Stagehand / Browserbase

### 当前能力

- `act()`：自然语言操作网页
- `extract()`：结构化提取
- `observe()`：执行前发现可操作元素
- `agent()`：多步自主执行
- 支持多模型
- Browserbase 提供云浏览器、session replay、observability、identity 等基础设施
- 已加入 WebMCP：`page.listWebMCPTools()` / `page.invokeWebMCPTool()`
- Stagehand v4 强调 context management、自愈、iframe、扩展和 caching

### 取其精华

1. 确定性代码 + AI 自适应混合。
2. `observe → act` 的两阶段思想。
3. structured extraction，减少上下文。
4. session replay / logs 对调试和 Demo 都很重要。
5. caching：重复工作应尽可能移出模型循环。

### 舍其糟粕

1. 不把“自然语言 selector”作为产品核心价值。
2. 不让 Agent 每一步重新理解 DOM。
3. 不把通用 browser abstraction 当比赛创新。
4. 页面已有领域语义时，不应退回 GUI 推断。

---

## 3.2 Playwright MCP

### 当前能力

Playwright MCP 使用 accessibility snapshot 向模型提供结构化页面状态：

- 不依赖视觉模型也能执行很多操作。
- 元素有结构化 ref。
- 支持导航、表单、storage、trace、video 等。
- 支持持续 browser session。

其当前文档也明确指出，对 coding agent 来说，CLI + Skills 在某些任务上可能比持续加载大量 MCP schemas / accessibility tree 更节省 token；MCP 更适合需要持续状态、丰富 introspection、长时间浏览器上下文的 Agent loop。

### 取其精华

- 结构化状态优于 screenshot。
- 执行应尽量确定性。
- 持续 session 对登录 / SSO / 多步任务很重要。
- 浏览器状态应该可观察、可追踪。

### 舍其糟粕

- accessibility tree 仍然是在“从 UI 推导意图”。
- 复杂页面可能造成 context bloat。
- 元素 ref 是交互层 abstraction，不是业务语义层 abstraction。

结论：**WebMCP 应该比 Playwright MCP 再高一个语义层级。**

---

## 3.3 Browser Use

### 当前能力

- 自主 browser loop
- search / navigate / click / input / extract / screenshot / evaluate JS
- 自定义 tools
- structured output
- vision on demand
- human-in-the-loop

### 取其精华

- vision 应是 fallback / verification，而不是默认主路径。
- tool registry 可扩展。
- structured output 是稳定 Agent 的基础。
- HITL 应放在风险边界，而不是每一步确认。

### 舍其糟粕

- 通用 browser agent 容易“什么都能做，但每件事都不够可靠”。
- click/input 微动作链会放大长任务错误累积。

---

## 3.4 Chrome DevTools MCP

### 当前能力

Chrome DevTools MCP 已超出普通网页点击：

- 网络调试
- screenshot / screencast
- heap snapshot
- performance tracing
- memory debugging
- structured tool outputs
- slim mode / skills integration

### 取其精华

- **Agent legibility**：logs / traces / performance / runtime state 应直接可读。
- 结果必须可机器验证。
- 高级 Agent 不只是操作应用，也需要检查是否真正达到目标。

### 舍其糟粕

- DevTools 是低层平台能力，不应成为最终用户产品的主要 UX。

---

## 3.5 Cloudflare Agents + Browser Run

### 当前能力

Cloudflare 2026 Agents 体系明显走向 modern harness：

- durable agent state
- Browser Run
- Code Mode
- 模型写 CDP 代码操作浏览器
- pause / approval / resume
- persistent browser session
- Live View / recording
- background subagents

### 取其精华

1. 一个高能力执行面通常优于 50 个微工具。
2. execution state 应 durable。
3. approval 后应从原状态继续，而不是重跑。
4. 长任务需要 milestone / checkpoint。
5. 子 Agent 最好隔离工作空间，避免共享可变状态冲突。

### 舍其糟粕

- 不为了展示“会跑代码”就默认让模型执行任意代码。
- WebMCP app 已能暴露更安全的领域操作，不必退回万能 CDP。

---

## 3.6 MCP-B / WebMCP ecosystem

MCP-B 当前提供：

- WebMCP polyfill
- React integration
- transports
- WebMCP ↔ MCP bridge
- local relay
- smart DOM reader

### 取其精华

- 做标准兼容，不做私有协议孤岛。
- 保持 WebMCP 与普通 MCP 可桥接。
- 充分利用 browser origin / auth session。

### 舍其糟粕

- 不把“桥接协议”本身当最终用户价值。
- 比赛更重要的是 application 是否因 WebMCP 变得显著更好。

---

# 4. 2026 年模型能力已经变化到什么程度

## 4.1 GPT-5.6 对产品设计最重要的变化

### A. 更强 intent understanding

现代模型越来越不需要“步骤 1、步骤 2、步骤 3”式 prompt。

更合适的是给出：

- outcome
- constraints
- success criteria
- permission boundaries
- evidence requirements

然后让模型自行规划。

### B. 更强 tool use

工具选择、参数填写、长工具链增强。

含义：**WebMCP tools 应更粗粒度、更语义化。**

### C. Programmatic Tool Calling

模型可以在隔离 runtime 中写程序：

- 并行调用工具
- loop / condition
- join / filter / rank / deduplicate / validate
- 中间结果不必全部回填主 context

因此 tools 应支持 batch/query/aggregate，而不是逼模型逐项循环调用。

### D. Multi-agent

Root agent 可以创建多个专门 subagents：

- parallel research
- separate context
- compare hypotheses
- independent verification

### E. 更长、更自主的执行

模型可以持续运行多个阶段，减少用户逐步 steering。

### F. 更强 computer use + visual judgment

这允许产品形成双通道：

```text
WebMCP 完成高层语义操作
→ structured verification
→ computer use / vision 独立检查最终 UI
```

---

# 5. 2026 Agent Harness 的核心原则

## 5.1 Human steer; agents execute

现代 harness 的重点不再是给模型更多提示词，而是让环境足够“agent-legible”。

### 经验一：给地图，不给 1000 页说明书

巨型 prompt 会：

- 占 context
- 变 stale
- 淹没关键规则
- 难验证

因此：

> **progressive disclosure > monolithic prompt**

### 经验二：把状态做成 Agent 可读的系统事实

UI、logs、metrics、traces、docs、IDs 都应可直接检查。

### 经验三：失败时补环境，而不是让模型“更努力”

遇到失败应问：

> 缺的 capability / abstraction / invariant / feedback loop 是什么？

### 经验四：约束 invariant，而不是 micromanage path

例如：

- “不能产生负库存”是 invariant。
- “先点 A，再点 B，再点 C”是 micromanagement。

### 经验五：让 Agent 自己验证

完成任务后应支持：

- read-back
- diff
- tests
- receipts
- visual check

而不是只依赖 `success: true`。

---

## 5.2 Harness 效率原则

### A. Avoid context bloat

随着 tools / skills / plugins 增长，上下文会膨胀。现代 harness 已越来越倾向 deferred discovery，只在需要时暴露能力。

### B. Keep tool outputs bounded

工具返回不是越多越好，应支持：

- pagination
- summary
- filters
- projections
- maxItems
- stable cursors

### C. Preserve stable context

工具名、schema 和顺序尽量稳定；runtime state 通过数据返回，而不是不断重写 description；历史最好 append-only，便于恢复和审计。

---

# 6. 取其精华、去其糟粕矩阵

| 已有方案 | 应吸收 | 应避免 | WebMCP 下一层机会 |
|---|---|---|---|
| ChatGPT agent / CUA | 自主任务、视觉兜底、用户控制 | screenshot-first | first-party semantic tools + visual verify |
| Stagehand | observe/act、cache、hybrid automation | NL selector 作为产品核心 | preview/commit + semantic batch |
| Playwright MCP | deterministic structured state | a11y tree context 膨胀 | domain state projection |
| Browser Use | flexible loop、HITL、vision-on-demand | click/input 微动作链 | coarse-grained state transitions |
| Chrome DevTools MCP | observability、debuggability | 暴露过多底层细节 | domain-specific receipts/traces |
| Cloudflare Agents | durable execution、resume、subagents | 任意代码默认执行 | safe domain transactions |
| MCP-B | 标准兼容、polyfill、bridge | plumbing-first 产品 | user-facing agent-native workflows |
| OpenAI showcase | shared visual state、人机共同编辑 | note/travel/cart 同质化 | high-stakes / multi-stage collaborative work |

---

# 7. WebMCP Tool Design 原则

## 7.1 注册业务意图，不注册 UI 控件

Bad：

```text
click_add_button
set_title_field
open_modal
click_save
```

Good：

```text
create_scenario
preview_changes
apply_changes
compare_scenarios
verify_workspace
```

## 7.2 Read 与 Write 分开

```text
inspect_*     -> readOnly
search_*      -> readOnly
preview_*     -> no authoritative side effect
commit_*      -> write
rollback_*    -> write
```

## 7.3 重要写操作默认 two-phase

```text
intent
  ↓
preview_change()
  ↓
structured diff + risks + invariant checks
  ↓
commit_change(preview_id)
  ↓
receipt + new_version
```

## 7.4 所有对象使用稳定 ID + version

避免“第三行那个红色卡片”式引用。

推荐：

```json
{
  "id": "task_01J...",
  "version": 12
}
```

mutation 最好支持：

```text
expected_version
idempotency_key
```

## 7.5 mutation 返回 receipt，而不是只返回 success

Bad：

```json
{"success": true}
```

Good：

```json
{
  "receipt_id": "rcpt_123",
  "workspace_version": 42,
  "changed": ["task_2", "task_9"],
  "invariants": {
    "all_passed": true
  },
  "undo_token": "undo_123"
}
```

---

# 8. 顺应当前模型与 Harness 的功能蓝图

## 8.1 Progressive Tool Surface

根据：

- route
- workspace type
- selection
- permission
- operation phase

动态注册 / 注销 tools。

例如：

```text
Dashboard:
  inspect_workspaces
  open_workspace

Workspace:
  inspect_state
  search_items
  compare_items
  propose_changes

Preview:
  inspect_preview
  commit_preview
  discard_preview

History:
  inspect_history
  rollback
```

## 8.2 Agent-Friendly State Projection

不要把整个 DOM / Redux state 返回给模型。

提供：

```text
get_workspace_summary()
get_state_slice(ids, fields)
search_state(query, filters, limit)
```

输出应 compact / typed / filterable / deterministic。

## 8.3 Transactional Preview / Commit

高价值 mutation：

```text
preview → validation → approval(if needed) → commit → receipt
```

只在 irreversible / destructive / external write / costly / permission escalation 时要求人工确认。

## 8.4 Checkpoint / Branch / Replay

工具：

```text
create_checkpoint()
fork_workspace(checkpoint_id)
compare_branches(a, b)
merge_branch(branch_id)
rollback_to(checkpoint_id)
```

多 Agent 不同时修改同一 mutable workspace，而是：

```text
root
 ├─ branch A → Agent A
 ├─ branch B → Agent B
 └─ branch C → Agent C

→ compare
→ choose
→ merge
```

## 8.5 Programmatic Tool Calling Friendly API

支持 batch：

```text
get_items(ids[])
query_items(filter, sort, limit)
aggregate_items(...)
validate_plan(plan)
compare_versions(ids[])
```

不要让模型循环几十次 `get_item(id)`。

## 8.6 Verification Channel

结构化验证：

```text
verify_workspace()
verify_invariants()
get_diff()
```

可视验证：Agent 再查看最终 UI。

## 8.7 Event Ledger / Provenance

每个改变记录：

- actor
- timestamp
- intent
- preview id
- receipt
- affected IDs
- before / after version
- approval status

天然支持 undo / replay / audit / resume。

## 8.8 Cancellation / Resume

长操作应明确：

- cancelled
- paused
- resumable
- completed
- failed-with-recoverable-state

避免取消后留下未知半完成状态。

---

# 9. 机会区域评估

评分 5 为最好。

| 方向 | 新颖度 | WebMCP 必要性 | 模型能力匹配 | Demo 冲击 | 短期可做 | 总体 |
|---|---:|---:|---:|---:|---:|---:|
| 通用 shopping agent | 2 | 3 | 4 | 4 | 5 | 18 |
| Travel planner | 2 | 3 | 4 | 4 | 4 | 17 |
| Note / doc editor | 2 | 4 | 5 | 3 | 5 | 19 |
| Browser automation wrapper | 1 | 2 | 4 | 3 | 3 | 13 |
| Agent-native workflow/runbook studio | 4 | 5 | 5 | 4 | 4 | 22 |
| Scenario / decision workspace with branches | 5 | 5 | 5 | 5 | 4 | **24** |
| Incident response cockpit | 5 | 5 | 5 | 5 | 3 | 23 |
| Multi-agent evaluation laboratory | 5 | 5 | 5 | 4 | 3 | 22 |

### 当前推荐产品母题

> **一个让人和 Agent 在同一份结构化工作状态上进行“探索 → 分支 → 比较 → 审批 → 合并 → 验证”的 WebMCP-native workspace。**

它不是聊天机器人，也不是 browser wrapper。

它解决的是 2026 Agent 真正开始暴露的新问题：

> 模型已经足够能做事，但复杂工作的 authoritative state、风险、并行尝试、恢复与验证，仍缺少一个为 Agent 设计的界面和协议层。

---

# 10. 推荐产品原则

1. **Human intent, agent execution**：人给目标和限制，不微操步骤。
2. **Semantic actions over UI imitation**：Agent 调领域操作，不模拟点击。
3. **Preview before consequential commit**：安全边界确认，而不是每步确认。
4. **Every mutation is inspectable and reversible**：任何修改都有 diff / receipt / version / undo。
5. **Parallel exploration without shared-state chaos**：多 Agent 使用 branch。
6. **Verify outcomes, not tool calls**：结束条件是 invariant 通过，不是 tool 返回 success。
7. **Context is a budget**：动态 tools、bounded outputs、structured projections。
8. **Model capability should reduce product complexity**：不重复实现模型已有的 planning/language/visual reasoning。

产品工程应重点投入模型天然不拥有的：

- authoritative state
- constraints
- transactions
- history
- permissions
- verification
- collaboration semantics

---

# 11. Anti-patterns

## 11.1 Tool explosion

几十个工具同时注册。拒绝。

## 11.2 Giant system prompt

几千行 prompt 教 Agent 产品规则。拒绝。

## 11.3 Agent inside the app only

如果只有网页内置 chatbot 能操作，而外部 WebMCP Agent 不能真正使用，则 WebMCP leverage 太弱。

## 11.4 `success: true`

没有 version / diff / receipt / verification。拒绝。

## 11.5 Fake multi-agent

三个 prompt 角色顺序执行却称为 multi-agent。拒绝。

## 11.6 Destructive direct write

重要操作没有 preview / rollback。拒绝。

## 11.7 DOM mirrored as tools

按钮、dropdown、modal 原样变成 tool。拒绝。

---

# 12. 一手资料与主要来源

## WebMCP / Challenge

- OpenAI WebMCP Challenge  
  https://openai.com/webmcp-challenge/
- W3C WebMCP Draft  
  https://webmachinelearning.github.io/webmcp/
- OpenAI WebMCP Showcase  
  https://developers.openai.com/showcase?view=webmcp-apps
- MCP-B  
  https://mcp-b.ai/

## OpenAI Models / Harness

- GPT-5.6  
  https://openai.com/index/gpt-5-6/
- Model guidance  
  https://developers.openai.com/api/docs/guides/latest-model
- Harness engineering  
  https://openai.com/index/harness-engineering/
- Agents SDK evolution  
  https://openai.com/index/the-next-evolution-of-the-agents-sdk/
- GPT-5.6 harness efficiency  
  https://openai.com/index/gpt-5-6-frontier-intelligence-efficiency/
- Tool Search  
  https://developers.openai.com/api/docs/guides/tools-tool-search
- Programmatic Tool Calling  
  https://developers.openai.com/api/docs/guides/tools-programmatic-tool-calling
- Multi-agent  
  https://developers.openai.com/api/docs/guides/responses-multi-agent
- Compaction  
  https://developers.openai.com/api/docs/guides/compaction
- Sandbox Agents  
  https://developers.openai.com/api/docs/guides/agents/sandboxes

## Browser Agent Ecosystem

- Stagehand / Browserbase  
  https://www.browserbase.com/stagehand/
- Browserbase changelog  
  https://www.browserbase.com/changelog
- Microsoft Playwright MCP  
  https://github.com/microsoft/playwright-mcp
- Chrome DevTools MCP  
  https://github.com/ChromeDevTools/chrome-devtools-mcp
- Browser Use  
  https://docs.browser-use.com/
- Cloudflare Agents Browser  
  https://developers.cloudflare.com/agents/tools/browser/

---

# 13. 后续仍值得验证的问题

1. Challenge livestream 是否透露 judges 偏好的具体 interaction pattern。
2. ChatGPT in-app browser 对 WebMCP annotations / dynamic `toolchange` 的实际支持程度。
3. Preview / commit 是否会触发 ChatGPT 原生 confirmation UI，需要实测。
4. 多 iframe / cross-origin tools 的当前浏览器行为。
5. Stagehand 对动态 tool registration 的兼容行为。
6. WebMCP tool result 最佳大小及 ChatGPT 的实际截断行为。
7. 比赛 gallery 后续出现的同类产品，需要持续避免撞题。
