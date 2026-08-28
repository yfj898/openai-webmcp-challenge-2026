# WebMCP Challenge — Official Research Notes

Last verified: 2026-08-27

This file prioritizes official OpenAI, Devpost, and WebMCP specification sources.

## 1. Primary sources

### OpenAI challenge landing page

https://openai.com/webmcp-challenge/

Key facts:

- Describes WebMCP as an experimental open standard for websites to expose structured tools directly to agents.
- Challenge goal: build an app that becomes meaningfully better when people and agents use it together.
- Lists 10 winners.
- OpenAI portion of each winner prize: USD 3,000, one year ChatGPT Pro, Codex Micro, swag.
- Lists supporter prizes from Shopify, Google Chrome, Netlify, Cloudflare, Vercel, and Render.
- Shows example directions: 3D modeling, collaborative writing, crossword creation, travel itinerary work, and data exploration.
- Lists judges from OpenAI, Google Chrome, Cloudflare, Vercel, Shopify, Netlify, and MCP-B.
- States apps can be new or existing apps extended with WebMCP.
- States judges can test via ChatGPT's in-app browser or Chrome with WebMCP enabled.

Deadline update (verified 2026-08-27):

- OpenAI's landing page and the Devpost Official Rules now both display Sep 3 at 1 PM PT.
- The previously observed 5 PM / 1 PM discrepancy is no longer present.
- Continue to treat Devpost Official Rules as the controlling live source.

### Devpost overview

https://webmcp.devpost.com/

Key facts:

- Online / Public.
- Advertised cash pool: USD 35,000.
- Theme categories include Machine Learning/AI, E-commerce/Retail, Web.
- Requires a working live URL, text description, public repository, open-source license, and <3-minute public YouTube demo.
- Four equally weighted criteria: WebMCP Leverage, Execution, Potential Impact, Creativity & Ambition.

### Devpost Official Rules

https://webmcp.devpost.com/rules

Authoritative working dates:

- Registration: Aug 25, 2026 11:00 AM PT – Sep 3, 2026 1:00 PM PT.
- Submission: Aug 25, 2026 11:00 AM PT – Sep 3, 2026 1:00 PM PT.
- Judging: Sep 4, 2026 10:00 AM PT – Sep 21, 2026 5:00 PM PT.
- Winners announced: around Sep 23, 2026 2:00 PM PT.

Safe Singapore conversion:

- Submission hard stop: **Sep 4, 2026 04:00 SGT**.

Eligibility gate:

- Entrants must satisfy the age/entity and OpenAI API supported-country requirements in the live Official Rules.
- The Rules separately exclude residents/organizations domiciled in named locations, including China and Hong Kong, among others.
- A machine timezone or current physical location does not establish legal residence/domicile. The actual individual/team/entity eligibility must be confirmed against the live Rules before investing the build period.
- This is an administrative eligibility check, not legal advice; Devpost/OpenAI are the authoritative contacts for ambiguity.

Project requirements:

- Build a WebMCP-powered web app exploring a web where humans and agents interact/collaborate/create together.
- App must run consistently and match the submitted description/video.
- New apps are allowed.
- Existing apps are allowed only if meaningfully extended with WebMCP after the submission period starts.
- Existing projects should provide evidence distinguishing prior work from the new WebMCP work, e.g. dated commit history.
- Third-party SDK/API/data use must comply with the corresponding terms/licenses.

Submission requirements:

- Working live URL.
- Judges must be able to access the WebMCP functionality.
- Auth is allowed if credentials are supplied in the submission form.
- Text description must explain WebMCP fit, UX improvement, new human-agent capability, and implementation.
- Public repo on GitHub/GitLab/Bitbucket.
- Repo must contain required source/assets/instructions.
- Repo must include an open-source license visible to reviewers.
- Demo video must be <3 minutes, public on YouTube, show a working demo, and include explanatory audio.
- Video should not use third-party copyrighted/trademarked material without permission.

Testing:

- Judges may test using ChatGPT's in-app browser or WebMCP-enabled Chrome.
- Judges are not required to test the project and can decide based on the submitted description, screenshots/images, repository, and video.
- Therefore the written narrative and video are first-class judging surfaces.

Judging process:

- Stage One: pass/fail baseline viability, theme fit, and required technology use.
- Stage Two: four equally weighted criteria.

Criteria:

1. WebMCP Leverage
   - Thorough, skillful, non-trivial WebMCP usage.
   - Code should demonstrate genuine implementation effort.
2. Execution
   - Working/runnable project.
   - Complete and coherent product experience.
   - Not merely a proof of concept.
3. Potential Impact
   - Credible, specific real problem.
   - Credible, specific audience.
   - Demonstrated solution must actually address the stated problem.
4. Creativity & Ambition
   - Novelty.
   - Differentiation from existing concepts.

Tie-break order follows the criteria order, making WebMCP Leverage the first tie-break dimension.

### Devpost Resources / FAQ

https://webmcp.devpost.com/resources

Key setup guidance:

- Start with the WebMCP documentation/spec and example apps.
- Test in ChatGPT's in-app browser or Chrome with WebMCP enabled.
- Chrome path: Chrome 149+ and `chrome://flags/#enable-webmcp-testing`.
- No specific paid host or paid development tool is required.
- Public repository and visible open-source license are mandatory.
- Judges are not required to build the repository from scratch.
- Devpost recommends not touching the submitted Devpost entry, repository, or live site after the deadline while judging is underway; fork/copy if continued work is needed.
- Existing projects started before Aug 25 must clearly document what was newly added using WebMCP after Aug 25.
- FAQ states no cap on team size, but some prize components are limited by member count.

## 2. WebMCP technical sources

### Current WebMCP specification

https://webmachinelearning.github.io/webmcp/

Status observed on 2026-08-27:

- Draft Community Group Report dated 2026-08-26.
- Published by the Web Machine Learning Community Group.
- Abstract: enables web applications to provide JavaScript-based tools to AI agents.

### Specification repository / README

https://github.com/webmachinelearning/webmcp

Current core model:

```js
const controller = new AbortController();

await document.modelContext.registerTool({
  name: "add-todo",
  description: "Add a new item to the user's active todo list",
  inputSchema: {
    type: "object",
    properties: {
      text: {
        type: "string",
        description: "The text content of the todo item"
      }
    },
    required: ["text"]
  },
  async execute({ text }) {
    await addTodoItemToCollection(text);

    return {
      content: [
        {
          type: "text",
          text: `Added todo item: "${text}" successfully.`
        }
      ]
    };
  }
}, { signal: controller.signal });

// AbortSignal can be used to unregister the tool later.
// controller.abort();
```

Conceptual tool lifecycle:

1. Registration by the page.
2. Discovery by the agent/browser.
3. Structured invocation.
4. Browser-mediated page execution.
5. Structured result returned to the agent while the page can update the user's visible UI.

Relevant WebMCP properties for a competitive project:

- Tools are local to the web page's application context rather than a detached server-only MCP surface.
- Tool schemas should accurately express what is currently possible.
- Tool callbacks can reuse existing application logic and visibly update the same UI the user is working in.
- `AbortSignal` can control tool lifecycle/unregistration.
- Same-origin iframe behavior and controlled cross-origin exposure exist in the emerging spec.
- The API is still evolving, so pin/test against the actual browser environment used for judging.

### Declarative API explainer

https://github.com/webmachinelearning/webmcp/blob/main/declarative-api-explainer.md

The declarative approach can synthesize tool definitions from forms. Representative shape:

```html
<form
  toolname="search-cars"
  tooldescription="Perform a car make/model search"
>
  <input
    type="text"
    name="make"
    toolparamdescription="Vehicle make"
    required
  >
  <input
    type="text"
    name="model"
    toolparamdescription="Vehicle model"
    required
  >
  <button type="submit">Search</button>
</form>
```

This may be useful where a project needs to show that WebMCP can augment conventional accessible web semantics rather than replacing the UI.

## 3. Eligibility source

OpenAI API supported countries:

https://developers.openai.com/api/docs/supported-countries

Singapore is explicitly listed as an API-supported country as of the verification date.

Eligibility still depends on all Official Rules, age requirements, prize/legal restrictions, and the actual entrant's legal residence/status.

## 4. Prize accounting

Ten winning submissions are planned.

Per winning submission, subject to official rules:

- OpenAI: USD 3,000 cash.
- Netlify: USD 500 cash.
- Therefore cash per winner across those two sponsors is USD 3,500.
- Across 10 winners: USD 35,000 total advertised cash.

Non-cash/credit prizes include OpenAI ChatGPT Pro, Codex Micro, swag, Cloudflare credits, Vercel/Gateway credits, Render credits, Shopify gear, and Google AI Ultra subscriptions.

## 5. Sponsor/judge signals worth designing for

Judges listed on the OpenAI/Devpost pages represent:

- OpenAI browser/agent work.
- Google Chrome.
- Cloudflare.
- Vercel / Next.js.
- Shopify.
- Netlify.
- MCP-B.

Implication: a submission should be credible both as an agent interaction concept and as a polished modern web product. Browser-native tool exposure, security/trust boundaries, UI state synchronization, and deployability are likely more compelling than a thin wrapper around a chat box.

## 6. Recommended freeze policy

The official pages now agree on the hard deadline. Use this internal policy:

- Feature complete and demo video ready by Sep 2 SGT.
- Submission and final deployment freeze no later than **Sep 3 18:00 SGT**.
- Treat **Sep 4 04:00 SGT** as an absolute no-go boundary.
- After final submission, tag/freeze the submitted repo revision and deployment.
- Continue experimentation only in a separate branch/fork/copy if needed.

This gives a ten-hour buffer against upload, Devpost, DNS, deployment, YouTube processing, or authentication problems.
