# OpenAI — The WebMCP Challenge 2026

Research and product-decision workspace for the OpenAI WebMCP Challenge.

Last checked: 2026-08-27 (Asia/Singapore)

## Research & product strategy

- [`EXECUTIVE_SUMMARY.md`](./EXECUTIVE_SUMMARY.md) — 面向项目负责人的最终结论。
- [`FINAL_PRODUCT_DECISION.md`](./FINAL_PRODUCT_DECISION.md) — Winner / Runner-up / Rejected、评分、证据与 kill trigger。
- [`PRD.md`](./PRD.md) — PermitBench 完整 35 节 PRD。
- [`WEBMCP_TOOL_SPEC.md`](./WEBMCP_TOOL_SPEC.md) — 10 个 phase-scoped semantic tools 的 schemas、权限、失败、幂等与 UI effects。
- [`HARNESS_ARCHITECTURE.md`](./HARNESS_ARCHITECTURE.md) — dynamic tool scope、compact state、branch、transaction、verification 与模型边界。
- [`BUILD_PLAN.md`](./BUILD_PLAN.md) / [`DEMO_PLAN.md`](./DEMO_PLAN.md) / [`EVALUATION_PLAN.md`](./EVALUATION_PLAN.md) — 5 天构建、2:50 Demo 与 UI-only vs WebMCP 评测。
- [`COMPETITOR_LANDSCAPE.md`](./COMPETITOR_LANDSCAPE.md) / [`IDEA_DEEP_DIVE.md`](./IDEA_DEEP_DIVE.md) — 三候选深挖、逐项竞品和统一评分。
- [`RISKS_AND_KILL_CRITERIA.md`](./RISKS_AND_KILL_CRITERIA.md) / [`RESEARCH_LOG.md`](./RESEARCH_LOG.md) — 风险、kill criteria、假设与检索记录。
- [`RELEASE_RUNBOOK.md`](./RELEASE_RUNBOOK.md) — Vercel 发布、真实 Site tools smoke test 与提交前冻结步骤。
- [`CAPABILITY_FACT_CHECK_2026.md`](./CAPABILITY_FACT_CHECK_2026.md) — 官方比赛、WebMCP、浏览器与 OpenAI 2026 能力核验。
- [`MARKET_HARNESS_RESEARCH_2026.md`](./MARKET_HARNESS_RESEARCH_2026.md) — WebMCP / Browser Agent 市场、现有产品、可借鉴与应避免的设计，以及 GPT-5.6 / modern Agent Harness 趋势。
- [`HARNESS_NATIVE_FEATURE_BLUEPRINT.md`](./HARNESS_NATIVE_FEATURE_BLUEPRINT.md) — 将研究结论翻译为可实现功能：动态工具面、preview/commit、stable IDs、receipts、checkpoint、branch isolation、verification、batch tools 和 eval。
- [`OFFICIAL_RESEARCH.md`](./OFFICIAL_RESEARCH.md) — 比赛官方规则与技术资料。
- [`SUBMISSION_CHECKLIST.md`](./SUBMISSION_CHECKLIST.md) — 提交执行检查表。

### Final product decision

**Winner：PermitBench — AI Agent 最小权限决策工作台。**

> 让 AI 平台/安全工程师与 Agent 在同一 WebMCP 工作台中分支、模拟并激活一套经过任务证明的最小工具权限。

核心 Demo：strict / balanced / broad 三个权限分支 → deterministic task/safety simulation → exact preview → Human approval → dynamic WebMCP tool-surface contraction → 受限退款 → verification receipt / undo。

## Working implementation

PermitBench is now a runnable, local-first React application. It contains the complete P0 path rather than a mocked slide deck:

- deterministic permission evaluation for 3 required tasks and 5 adversarial probes;
- isolated `strict`, `balanced`, and `broad` policy branches;
- rule-based comparison and eligibility—no LLM judge decides whether a policy is safe;
- immutable activation preview bound to branch revision, manifest hash, and workspace version;
- Human-only approval followed by commit-time revalidation;
- phase-scoped WebMCP registration through `document.modelContext.registerTool`;
- active-policy enforcement inside every handler, independent of tool discovery;
- bounded sandbox refund with optimistic version checks and idempotency records;
- independent verification receipt and a 60-second Human-armed undo path;
- authoritative state, receipts, and audit history persisted in IndexedDB;
- a guided local harness for browsers where WebMCP is unavailable.

No OpenAI API key or backend service is required. ChatGPT Work or Codex supplies the agent intelligence and discovers the tools registered by the live page; PermitBench supplies shared state, semantics, permissions, transactions, and evidence.

### Run locally

Requirements: Node.js 22+ and pnpm 11+.

```bash
pnpm install
pnpm dev
```

Open the URL printed by Vite. Use the single **Next evidence** action to run the complete local walkthrough, or open the page in a compatible ChatGPT built-in browser and let the agent invoke the same registered handlers.

Production build:

```bash
pnpm build
pnpm preview
```

### Test

```bash
# Domain + tool contract tests
pnpm test

# Install the browser once, then run the full branch → receipt → undo flow
pnpm exec playwright install chromium
pnpm test:e2e
```

The current automated suite verifies:

- exact `strict 2/3 + 5/5`, `balanced 3/3 + 5/5`, and `broad 3/3 + 2/5` results;
- proposals never mutate active authority;
- unsafe branches cannot enter review;
- commit is absent until an exact Human approval exists;
- stale versions and over-limit refunds produce no mutation;
- same-key retries replay one receipt, while key/payload conflicts and second refunds are blocked;
- registry tools change across Explore, Review, Approved, and Execution;
- verification succeeds from ledger evidence, then Human-armed undo removes execution tools while preserving receipts.

### Test with real Site tools

OpenAI describes Site tools as its implementation of proposed WebMCP: the Human and agent share the same live page and signed-in session. The current ChatGPT route is the built-in browser with a supported GPT-5.6 Sol or Terra model; ordinary browsers retain the complete Human UI and show an explicit fallback status. See the official [Site tools documentation](https://developers.openai.com/codex/webmcp).

Suggested agent prompt:

> Inspect this PermitBench workspace. Create strict, balanced, and broad permission branches for the refund task, simulate every branch, compare them, and explain your recommendation. Stop for me to select a branch and approve its exact preview. After I approve, commit only that preview, inspect ORD-8821, issue the USD 42.80 refund, and verify the outcome.

Expected collaboration boundary:

1. The agent proposes, simulates, compares, previews, commits, executes, and verifies through semantic tools.
2. The Human selects the branch and creates the approval in the visible UI.
3. Commit appears only after approval; operational tools appear only after commit.
4. Undo appears only after the Human arms its short window.

### Phase-scoped tool surface

| Phase | Discoverable tools |
|---|---|
| Explore | `get_workspace_summary`, `propose_policy_branch`, `simulate_policy_branch`, `compare_policy_branches` |
| Review | `get_workspace_summary`, `compare_policy_branches`, `preview_policy_activation` |
| Approved | Review tools plus `commit_policy_activation` only after a valid Human approval |
| Execution | `get_workspace_summary`, `lookup_order`, `issue_refund`, `verify_task_outcome` according to the active policy |
| Verified | `get_workspace_summary`, `verify_task_outcome`; temporary `undo_policy_activation` only after Human arming |

Tool removal uses an `AbortController` per surface revision. Registration is only a discovery layer: each handler separately validates the current phase, policy, arguments, version, and transaction preconditions.

### Implementation map

```text
src/domain/fixtures.ts      deterministic task pack and three demo manifests
src/domain/service.ts       authoritative state machine, policy checks, transactions, receipts
src/domain/storage.ts       atomic IndexedDB snapshot repository
src/domain/toolSurface.ts   phase/policy → discoverable tool projection
src/webmcp/tools.ts         10 semantic schemas and validated handlers
src/webmcp/registry.ts      dynamic registration, teardown, support status
src/App.tsx                 shared Human-Agent workspace and guided demo
src/domain/*.test.ts        domain and transaction invariants
src/webmcp/*.test.ts        tool validation and dynamic registry contracts
tests/e2e/                  complete browser flow and recovery path
```

`vercel.json` is included for a static Vercel deployment. Publishing a live URL and testing that deployed origin in the current ChatGPT desktop build remain release actions; they are intentionally not claimed by the local test suite.

## Current competition status

- Sponsor: OpenAI OpCo, LLC
- Administrator: Devpost
- Format: Online / Public
- Theme: Build a WebMCP-powered web app where humans and agents can interact, collaborate, and create together.
- Submission window: 2026-08-25 to 2026-09-03.
- **Safe working deadline: 2026-09-03 13:00 Pacific Time = 2026-09-04 04:00 Singapore Time.**
- Judging: 2026-09-04 to 2026-09-21.
- Winners: around 2026-09-23.
- Top 10 projects win.
- Total advertised cash pool: USD 35,000.

> Deadline update (verified 2026-08-27): OpenAI's event page and the Devpost Official Rules now both show Sep 3 at 1:00 PM PT. The earlier 5:00 PM discrepancy is no longer present. Treat Devpost Official Rules as the controlling live source.

## What WebMCP is

WebMCP is an experimental open web standard that lets a web application expose structured JavaScript tools directly to AI agents. Instead of an agent visually guessing how to click through a UI, the page declares tools with names, descriptions, schemas, and executable behavior.

Current imperative API shape:

```js
await document.modelContext.registerTool({
  name: "search_products",
  description: "Search the product catalog",
  inputSchema: {
    type: "object",
    properties: {
      query: { type: "string" }
    },
    required: ["query"]
  },
  async execute({ query }) {
    // Reuse application logic and update the visible UI.
    return {
      content: [
        { type: "text", text: `Searched for ${query}` }
      ]
    };
  }
});
```

The basic lifecycle is:

1. The page registers one or more tools.
2. The browser/agent discovers the active tool list and schemas.
3. The agent invokes a tool with structured arguments.
4. The browser mediates execution inside the page.
5. The page updates its own UI/state and returns a structured result to the agent.

WebMCP also has a declarative direction for exposing ordinary HTML forms as tools using attributes such as `toolname`, `tooldescription`, and `toolparamdescription`.

## Required deliverables

The submission should be considered incomplete until all of these exist:

- Working live URL accessible to judges.
- Working WebMCP implementation.
- Public source repository on GitHub, GitLab, or Bitbucket.
- Visible open-source license.
- Repository contains source, assets, and instructions needed to run the project.
- Text description explaining:
  - why the use case is a strong fit for WebMCP;
  - how it improves the user experience;
  - what humans and agents can now do together that was difficult/impossible before;
  - how WebMCP was implemented.
- Public YouTube demo video **under 3 minutes**.
- Video must show the project actually working.
- Video must include audio explaining what was built and how WebMCP is used.
- Testing instructions and credentials if authentication is required.

Judges may test the live app, but are not required to rebuild it or even test it. The Devpost description, README, video, and live experience therefore all need to stand on their own.

## How judges score it

After an initial pass/fail viability/theme check, the four Stage Two criteria are equally weighted:

1. **WebMCP Leverage** — non-trivial, genuine, skillful use of WebMCP.
2. **Execution** — coherent, complete, runnable product rather than a technical proof of concept.
3. **Potential Impact** — specific real problem, specific real audience, credible demonstrated value.
4. **Creativity & Ambition** — novelty and differentiation from existing ideas.

Tie-breaking starts with WebMCP Leverage, then moves through the remaining criteria in order. This makes WebMCP depth especially important.

## Testing environment

Officially supported testing paths:

- ChatGPT in-app browser, which supports WebMCP.
- Google Chrome 149+ with `chrome://flags/#enable-webmcp-testing` enabled, then restart Chrome.

The live app can be hosted on ChatGPT Sites, Cloudflare, Vercel, Render, Netlify, or another provider.

## Existing projects are allowed, with an important restriction

A pre-existing application can be submitted, but only the meaningful WebMCP extension added after the submission period began on 2026-08-25 is evaluated. Keep clear evidence separating old and new work, preferably dated Git commits and a README section describing the WebMCP delta.

## Eligibility notes

- Individuals must be at least the age of majority where they reside.
- Teams and eligible organizations are allowed.
- Devpost's FAQ states there is no team-size cap, although some physical/account prizes only cover a limited number of members.
- Entrants must be in an OpenAI API-supported country/territory and not otherwise excluded by the Official Rules.
- Singapore appears on OpenAI's current API-supported-country list.

## Prize structure

There are 10 winning submissions. Each winner receives, subject to the official rules:

### OpenAI

- USD 3,000 cash.
- Codex Micro.
- One year of ChatGPT Pro for up to 3 team members.
- OpenAI swag for up to 3 team members.
- Spotlight from OpenAI Developers.

### Supporters

- Cloudflare: USD 10,000 Cloudflare credits.
- Vercel: USD 300/month Vercel credits + USD 50/month Gateway credits for 12 months.
- Render: USD 300 credits.
- Netlify: USD 500 cash.
- Shopify: USD 250 limited-edition Shopify Supply gear per winning submission.
- Google Chrome: 3-month Google AI Ultra subscription per winning team member, subject to prize terms.

The advertised USD 35,000 cash pool corresponds to USD 30,000 from OpenAI across 10 winners plus USD 5,000 from Netlify across 10 winners.

## Important operational rules

- The live app must remain available for judging.
- If private/authenticated, provide judges with credentials and testing instructions.
- The code repository must be public and carry an open-source license.
- Third-party SDK/API/data usage must be properly authorized/licensed.
- Submission must be original and not infringe third-party IP.
- Avoid copyrighted music and unauthorized trademarks/materials in the demo video.
- Devpost says not to modify the submitted project/repo/live site during judging; safest practice is to freeze the submitted version after the deadline and continue only in a fork/copy.
- The Official Rules contain awkward wording around multiple submissions; safest competition strategy is one clearly differentiated submission unless Devpost/OpenAI explicitly confirms otherwise.

## Competition strategy derived from the rubric

The strongest project should not merely expose existing buttons as WebMCP tools. A winning direction should demonstrate a workflow in which:

1. The human remains visibly in control of the web product.
2. The agent can operate the product through structured tools rather than pixel/UI guessing.
3. Tool availability/state changes meaningfully as the user works.
4. Agent actions visibly update the same UI the human is using.
5. The combined human-agent workflow is materially better than either a normal website or an isolated chatbot.
6. The demo can make that improvement obvious within 2–3 minutes.

## Files in this folder

- `README.md` — condensed working brief and implementation implications.
- `OFFICIAL_RESEARCH.md` — detailed source-backed competition notes and source URLs.
- `SUBMISSION_CHECKLIST.md` — freeze/checklist to use before Devpost submission.
