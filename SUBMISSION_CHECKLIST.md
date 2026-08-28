# WebMCP Challenge Submission Checklist

Target internal freeze: **2026-09-03 18:00 SGT**  
Official-rules safe hard deadline: **2026-09-04 04:00 SGT**

## Eligibility / registration

- [ ] Joined the hackathon on Devpost.
- [ ] Entrant/team satisfies the Official Rules.
- [ ] Individual residence / organization domicile is not among the locations excluded by the live Rules (the list includes China and Hong Kong, among others).
- [ ] Entrant also satisfies the OpenAI API supported-country/territory requirement.
- [ ] Team representative is designated if submitting as a team/organization.
- [ ] Devpost profile and contact details are correct.

## WebMCP implementation

- [ ] App exposes real, useful WebMCP tools.
- [ ] Tool names are clear and stable.
- [ ] Tool descriptions explain intent rather than implementation trivia.
- [ ] Input schemas are narrow, typed, and accurate.
- [ ] Tool calls execute real product actions rather than mocked behavior.
- [ ] Agent actions visibly update the user's UI/state where appropriate.
- [ ] Errors are handled and surfaced coherently.
- [ ] Destructive/high-impact actions have appropriate human control/confirmation.
- [ ] Dynamic tool availability matches the current application state.
- [ ] Tool behavior has been tested for repeated and invalid calls.

## Browser validation

- [ ] Tested end-to-end in ChatGPT's in-app browser.
- [ ] Tested in Chrome 149+ with `chrome://flags/#enable-webmcp-testing` enabled.
- [ ] Fresh-session test passes.
- [ ] Logged-out/authenticated path behaves as documented.
- [ ] No reliance on local-only services.
- [ ] Production URL works over HTTPS.

## Product quality

- [ ] A new user can understand the product without explanation.
- [ ] Human-only workflow is visible.
- [ ] Agent-assisted workflow is visibly better.
- [ ] Human + agent collaboration is central, not decorative.
- [ ] Core use case solves a specific real problem for a specific audience.
- [ ] Main demo path completes reliably.
- [ ] UI has no obvious broken states or placeholder content.

## Evidence for pre-existing project, if applicable

- [ ] README clearly identifies work that existed before 2026-08-25.
- [ ] README clearly identifies WebMCP work added after 2026-08-25.
- [ ] Git history provides dated evidence of the competition-period work.
- [ ] Submission narrative evaluates/claims only eligible new work where required.

## Repository

- [ ] Repository is public.
- [ ] Open-source `LICENSE` exists and is visible.
- [ ] README has setup instructions.
- [ ] README has live demo URL.
- [ ] README explains the WebMCP architecture.
- [ ] README lists exposed tools and their purpose.
- [ ] README provides judge testing steps.
- [ ] No secrets, tokens, passwords, or private data committed.
- [ ] Fresh clone can install/build/run using documented commands.
- [ ] Final submitted commit SHA is recorded.
- [ ] Final submitted commit is tagged/frozen.

## Live deployment

- [ ] Production deployment matches final repository commit.
- [ ] Deployment is publicly reachable by judges.
- [ ] Deployment remains freely reachable throughout the judging period.
- [ ] Required environment variables are configured.
- [ ] Authentication test account works if needed.
- [ ] Judge credentials are included only where Devpost expects them.
- [ ] Demo data is stable and sufficient.
- [ ] No rate-limit/payment wall blocks the judging path.
- [ ] Health check immediately before submission passes.

## Devpost text

- [ ] Explains why this use case specifically needs WebMCP.
- [ ] Explains how UX improves.
- [ ] Explains what human + agent can do together that was previously difficult/impossible.
- [ ] Briefly explains technical WebMCP implementation.
- [ ] Names a real target audience/problem.
- [ ] Avoids vague claims not demonstrated by the product.
- [ ] Screenshots match the current production app.
- [ ] Submission text is in English or includes a complete English translation.

## Demo video

- [ ] Runtime is safely under 3:00.
- [ ] Public YouTube URL works in incognito/private mode.
- [ ] Audio is clear.
- [ ] First 15–20 seconds establish problem and value.
- [ ] Video shows a real agent discovering/invoking WebMCP behavior.
- [ ] Video shows visible app-state/UI changes.
- [ ] Video demonstrates the core human-agent collaboration loop.
- [ ] Video explicitly names WebMCP and why it matters.
- [ ] Video avoids copyrighted music/material without permission.
- [ ] Final YouTube processing is complete before Devpost submission.

## Rubric self-review

- [ ] **WebMCP Leverage:** non-trivial and central to the product.
- [ ] **Execution:** production-like coherent experience, not a toy PoC.
- [ ] **Potential Impact:** credible specific problem/audience/value.
- [ ] **Creativity & Ambition:** clearly different from ordinary chatbot wrappers.
- [ ] If tied, WebMCP Leverage is strong enough to win the first tie-break.

## Final freeze

- [ ] All submission fields saved.
- [ ] Live URL re-tested from a clean browser.
- [ ] Repo URL re-tested without being logged into GitHub/GitLab/Bitbucket.
- [ ] YouTube URL re-tested without being logged in.
- [ ] Final Devpost preview reviewed.
- [ ] Submit before the internal Sep 3 18:00 SGT freeze target.
- [ ] Confirm Devpost shows the submission as entered, not merely saved as draft.
- [ ] Capture screenshot/PDF of final submitted state for evidence.
- [ ] Do not modify submitted repo/deployment during judging; use a fork/copy for further work.
