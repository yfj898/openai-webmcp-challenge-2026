import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { candidateIntents, candidateManifests, createInitialState } from "./domain/fixtures";
import type { PermitBenchService } from "./domain/service";
import type {
  AppState,
  Branch,
  BranchLabel,
  Comparison,
  Preview,
  Receipt,
  Simulation,
  ToolEnvelope,
} from "./domain/types";
import type { RegistryStatus, WebMcpRegistry } from "./webmcp/registry";

interface AppProps {
  service: PermitBenchService;
  registry: WebMcpRegistry;
}

type ToolActivity = { name: string; result: unknown; at: string };

const PHASE_LABELS: Record<AppState["workspace"]["phase"], string> = {
  explore: "Explore",
  review: "Review",
  approved: "Approved",
  execution: "Execution",
  post_commit: "Verified",
};

const BRANCH_COPY: Record<BranchLabel, { eyebrow: string; thesis: string }> = {
  strict: { eyebrow: "Read only", thesis: "Safe, but cannot finish the job." },
  balanced: { eyebrow: "Task bounded", thesis: "Enough authority, nothing unrelated." },
  broad: { eyebrow: "Over-privileged", thesis: "Finishes the job, fails abuse probes." },
};

export function App({ service, registry }: AppProps) {
  const [state, setState] = useState<AppState>(() => createInitialState());
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState<string>();
  const [notice, setNotice] = useState<{ tone: "error" | "success" | "info"; text: string }>();
  const [activity, setActivity] = useState<ToolActivity>();
  const [registryStatus, setRegistryStatus] = useState<RegistryStatus>(() => registry.getStatus());

  useEffect(() => {
    let mounted = true;
    const unsubscribeState = service.subscribe((next) => mounted && setState(next));
    const unsubscribeRegistry = registry.subscribe((next) => mounted && setRegistryStatus(next));
    void service
      .initialize()
      .then(() => {
        if (!mounted) return;
        registry.start();
        setReady(true);
      })
      .catch((error) => {
        if (!mounted) return;
        setNotice({ tone: "error", text: error instanceof Error ? error.message : "Workspace failed to load." });
      });
    return () => {
      mounted = false;
      unsubscribeState();
      unsubscribeRegistry();
      registry.stop();
    };
  }, [registry, service]);

  const runAction = useCallback(
    async <T,>(label: string, action: () => Promise<T>): Promise<T | undefined> => {
      setBusy(label);
      setNotice(undefined);
      try {
        const value = await action();
        setNotice({ tone: "success", text: `${label} completed.` });
        return value;
      } catch (error) {
        setNotice({ tone: "error", text: error instanceof Error ? error.message : `${label} failed safely.` });
        return undefined;
      } finally {
        setBusy(undefined);
      }
    },
    [],
  );

  const invokeTool = useCallback(
    async (name: string, input: unknown): Promise<ToolEnvelope | undefined> => {
      const result = (await registry.invokeForDemo(name, input)) as ToolEnvelope;
      setActivity({ name, result, at: new Date().toISOString() });
      if (!result.ok) throw new Error(`${result.error.code}: ${result.error.message}`);
      return result;
    },
    [registry],
  );

  const comparison = useMemo<Comparison | undefined>(() => {
    if (state.branches.length < 2) return undefined;
    try {
      return service.comparePolicyBranches(state.branches.map((branch) => branch.id));
    } catch {
      return undefined;
    }
  }, [service, state.branches, state.simulations, state.workspace.phase]);

  const selectedBranch = state.branches.find((branch) => branch.id === state.workspace.selectedBranchId);
  const currentPreview = state.previews.find((preview) => preview.id === state.workspace.currentPreviewId);
  const activePolicy = state.policies.find((policy) => policy.id === state.workspace.activePolicyId)!;
  const verification = state.verifications.at(-1);
  const commitReceipt = [...state.receipts].reverse().find((receipt) => receipt.type === "policy_commit");

  const handleSeed = () =>
    runAction("Create three isolated branches", async () => {
      for (const label of ["strict", "balanced", "broad"] as const) {
        const current = service.snapshot();
        if (current.branches.some((branch) => branch.label === label)) continue;
        await invokeTool("propose_policy_branch", {
          operation: "create",
          label,
          intent: candidateIntents[label],
          base_version: current.workspace.version,
          manifest: candidateManifests[label],
          idempotency_key: `demo-create-${label}-0001`,
        });
      }
    });

  const handleSimulate = () =>
    runAction("Run deterministic simulations", async () => {
      for (const branch of service.snapshot().branches) {
        await invokeTool("simulate_policy_branch", {
          branch_id: branch.id,
          expected_revision: branch.revision,
          test_scope: "all",
        });
      }
      const branchIds = service.snapshot().branches.map((branch) => branch.id);
      await invokeTool("compare_policy_branches", { branch_ids: branchIds, include_test_details: true });
    });

  const handleSelect = (branchId: string) =>
    runAction("Human selected a branch", () => service.selectBranchForReview(branchId));

  const handlePreview = () =>
    selectedBranch &&
    runAction("Build exact activation preview", () =>
      invokeTool("preview_policy_activation", {
        branch_id: selectedBranch.id,
        expected_branch_revision: selectedBranch.revision,
        expected_version: state.workspace.version,
        idempotency_key: `demo-preview-${selectedBranch.id}-0001`,
      }),
    );

  const handleApprove = () => runAction("Human approval", () => service.approveCurrentPreview());

  const handleCommit = () =>
    currentPreview &&
    runAction("Commit approved policy", () =>
      invokeTool("commit_policy_activation", {
        preview_id: currentPreview.id,
        expected_version: state.workspace.version,
        idempotency_key: "demo-policy-commit-0001",
      }),
    );

  const handleExecute = () =>
    runAction("Execute bounded refund", async () => {
      await invokeTool("lookup_order", {
        order_id: "ORD-8821",
        fields: ["amount", "currency", "status", "shipment_status", "refund_status"],
      });
      await invokeTool("issue_refund", {
        order_id: "ORD-8821",
        ticket_id: "T-1042",
        amount: 42.8,
        currency: "USD",
        reason_code: "damaged_item",
        expected_version: service.snapshot().workspace.version,
        idempotency_key: "demo-refund-write-0001",
      });
    });

  const handleVerify = () =>
    runAction("Verify outcome", () =>
      invokeTool("verify_task_outcome", {
        task_id: "T-1042",
        policy_version_id: state.workspace.activePolicyId,
        expected_version: state.workspace.version,
      }),
    );

  const handleArmUndo = () => runAction("Arm undo window", () => service.armUndo());

  const handleUndo = () =>
    commitReceipt?.undoToken &&
    runAction("Revoke agent access", () =>
      invokeTool("undo_policy_activation", {
        receipt_id: commitReceipt.id,
        undo_token: commitReceipt.undoToken,
        expected_version: state.workspace.version,
        idempotency_key: "demo-policy-undo-0001",
      }),
    );

  const handleReset = () =>
    runAction("Reset demo", async () => {
      setActivity(undefined);
      await service.reset();
    });

  const primaryAction = getPrimaryAction({
    state,
    currentPreview,
    busy: Boolean(busy),
    handlers: {
      seed: handleSeed,
      simulate: handleSimulate,
      preview: handlePreview,
      approve: handleApprove,
      commit: handleCommit,
      execute: handleExecute,
      verify: handleVerify,
      armUndo: handleArmUndo,
      undo: handleUndo,
    },
  });

  if (!ready) {
    return (
      <div className="loading-shell">
        <div className="brand-mark" aria-hidden="true"><span>P</span></div>
        <p>Opening the authoritative workspace…</p>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-lockup">
          <div className="brand-mark" aria-hidden="true"><span>P</span></div>
          <div>
            <strong>PermitBench</strong>
            <span>Prove least privilege before granting it.</span>
          </div>
        </div>
        <div className="workspace-meta" aria-label="Workspace status">
          <StatusDot tone={state.workspace.phase === "post_commit" ? "success" : "live"} />
          <span>{PHASE_LABELS[state.workspace.phase]}</span>
          <code>v{state.workspace.version}</code>
          <span className="divider" />
          <span>Active</span>
          <code data-testid="active-policy-id">{activePolicy.id}</code>
        </div>
        <button className="button ghost small" onClick={handleReset} disabled={Boolean(busy)}>
          Reset demo
        </button>
      </header>

      <section className="hero-strip">
        <div>
          <span className="kicker">Live permission decision · T-1042</span>
          <h1>Can this agent finish the refund <em>without inheriting the whole support desk?</em></h1>
        </div>
        <div className="guided-action">
          <span>Next evidence</span>
          <button
            data-testid="primary-action"
            className="button primary"
            onClick={primaryAction.onClick}
            disabled={primaryAction.disabled || Boolean(busy)}
          >
            {busy ? <><Spinner /> {busy}</> : primaryAction.label}
          </button>
          <small>{primaryAction.hint}</small>
        </div>
      </section>

      {notice && (
        <div className={`notice ${notice.tone}`} role={notice.tone === "error" ? "alert" : "status"}>
          <span>{notice.tone === "error" ? "!" : notice.tone === "success" ? "✓" : "i"}</span>
          {notice.text}
          <button onClick={() => setNotice(undefined)} aria-label="Dismiss notification">×</button>
        </div>
      )}

      <main className="workspace-grid">
        <aside className="panel task-panel">
          <PanelHeading index="01" title="Task pack" meta="Authoritative" />
          <div className="ticket-card">
            <div className="ticket-title">
              <span className="ticket-icon" aria-hidden="true">↳</span>
              <div>
                <strong>Damaged delivery</strong>
                <code>T-1042</code>
              </div>
            </div>
            <p>{state.workspace.task.context}</p>
            <dl className="fact-grid">
              <div><dt>Order</dt><dd>ORD-8821</dd></div>
              <div><dt>Refund</dt><dd>USD 42.80</dd></div>
              <div><dt>Status</dt><dd>Damaged</dd></div>
              <div><dt>Deadline</dt><dd>Today</dd></div>
            </dl>
          </div>

          <section className="constraint-section">
            <div className="section-label"><span>Required actions</span><code>3</code></div>
            <ConstraintRow label="Read target order" scope="ORD-8821" />
            <ConstraintRow label="Inspect shipment" scope="ORD-8821" />
            <ConstraintRow label="Issue exact refund" scope="≤ USD 75" />
          </section>

          <section className="constraint-section">
            <div className="section-label"><span>Abuse probes</span><code>5</code></div>
            <ConstraintRow label="Oversized refund" scope="USD 120" danger />
            <ConstraintRow label="Wrong order" scope="ORD-9999" danger />
            <ConstraintRow label="Bulk PII export" scope="deny" danger />
            <ConstraintRow label="Role mutation" scope="deny" danger />
            <ConstraintRow label="Duplicate effect" scope="max 1" danger />
          </section>

          <div className="authority-note">
            <span aria-hidden="true">⌁</span>
            <p><strong>Source of truth</strong>The task, constraints, versions, and evidence live here—not in a chat transcript.</p>
          </div>
        </aside>

        <section className="panel branch-panel">
          <PanelHeading
            index="02"
            title="Isolated policy branches"
            meta={state.branches.length ? `${state.branches.length} alternatives` : "Awaiting proposals"}
          />
          {state.branches.length === 0 ? (
            <EmptyBranches />
          ) : (
            <div className="branch-stack" data-testid="branch-board">
              {state.branches.map((branch) => (
                <BranchCard
                  key={branch.id}
                  branch={branch}
                  simulation={findSimulation(state, branch)}
                  recommended={comparison?.recommendedBranchId === branch.id}
                  selected={state.workspace.selectedBranchId === branch.id}
                  canSelect={state.workspace.phase === "explore" && comparison?.recommendedBranchId === branch.id}
                  onSelect={() => handleSelect(branch.id)}
                />
              ))}
            </div>
          )}

          {comparison && (
            <div className="comparison-rule" data-testid="comparison-result">
              <span className="rule-icon" aria-hidden="true">∴</span>
              <div>
                <strong>Rule-based recommendation: Balanced</strong>
                <p>Complete all required actions, deny every abuse probe, then minimize write scope.</p>
              </div>
              <span className="confidence">8/8</span>
            </div>
          )}

          {currentPreview && currentPreview.status !== "aborted" && (
            <PreviewCard preview={currentPreview} branch={selectedBranch} />
          )}
        </section>

        <aside className="panel evidence-panel">
          <PanelHeading index="03" title="Proof & execution" meta={state.workspace.phase === "post_commit" ? "Verified" : "Live ledger"} />
          <div className="policy-card">
            <div className="policy-card-header">
              <span>Active agent authority</span>
              <code>{activePolicy.id}</code>
            </div>
            {activePolicy.manifest.capabilities.length ? (
              <div className="active-grants">
                {activePolicy.manifest.capabilities.map((grant) => (
                  <div className="grant-row" key={grant.id}>
                    <span className={grant.id === "refunds.issue" ? "grant write" : "grant"}>
                      {grant.id === "refunds.issue" ? "WRITE" : "READ"}
                    </span>
                    <div><strong>{grant.id}</strong><small>{grant.resources?.join(", ") ?? "scoped by handler"}{grant.constraints?.maxAmount ? ` · ≤ USD ${grant.constraints.maxAmount}` : ""}</small></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-policy"><span>∅</span><p>No operational tools granted yet.</p></div>
            )}
          </div>

          <section className="ledger-section">
            <div className="section-label"><span>Sandbox ledger</span><code>{state.refunds.length} writes</code></div>
            {state.refunds.length ? (
              state.refunds.map((refund) => (
                <div className="ledger-entry" key={refund.id} data-testid="refund-record">
                  <span className="receipt-check">✓</span>
                  <div><strong>USD {refund.amount.toFixed(2)} refunded</strong><small>{refund.orderId} · {refund.policyVersionId}</small></div>
                  <code>{refund.id.slice(-6)}</code>
                </div>
              ))
            ) : (
              <p className="muted-copy">No business mutation has occurred. Proposal branches remain isolated.</p>
            )}
          </section>

          {verification ? (
            <VerificationReceipt verification={verification} />
          ) : (
            <div className="verification-placeholder">
              <span aria-hidden="true">◎</span>
              <div><strong>Verification is a separate step</strong><p>“Done” is never accepted as evidence.</p></div>
            </div>
          )}

          <ReceiptTimeline receipts={state.receipts} />
        </aside>
      </main>

      <section className="tool-dock">
        <div className="tool-dock-heading">
          <div>
            <StatusDot tone={registryStatus.support === "available" ? "success" : registryStatus.support === "error" ? "danger" : "muted"} />
            <strong>Live WebMCP surface</strong>
            <span>{registryStatus.message}</span>
          </div>
          <code>{registryStatus.expectedNames.length} semantic tools · phase-scoped</code>
        </div>
        <div className="tool-chips" data-testid="tool-surface">
          {registryStatus.expectedNames.map((name) => (
            <span key={name} className={registryStatus.registeredNames.includes(name) ? "tool-chip registered" : "tool-chip"}>
              <i>{name.startsWith("get_") || name.startsWith("lookup_") || name.startsWith("compare_") ? "R" : "W"}</i>
              {name}
            </span>
          ))}
        </div>
        {activity && (
          <details className="tool-activity">
            <summary><span>Last local harness call</span><code>{activity.name}</code><small>{new Date(activity.at).toLocaleTimeString()}</small></summary>
            <pre>{JSON.stringify(activity.result, null, 2)}</pre>
          </details>
        )}
      </section>

      <footer>
        <span>PermitBench is a deterministic sandbox. No real refund or production permission is changed.</span>
        <span>WebMCP imperative API · local-first IndexedDB</span>
      </footer>
    </div>
  );
}

function getPrimaryAction({
  state,
  currentPreview,
  busy,
  handlers,
}: {
  state: AppState;
  currentPreview?: Preview;
  busy: boolean;
  handlers: Record<"seed" | "simulate" | "preview" | "approve" | "commit" | "execute" | "verify" | "armUndo" | "undo", () => void>;
}) {
  const disabled = busy;
  if (!state.branches.length) return { label: "Ask agent for 3 branches", hint: "Creates isolated proposals; active policy stays empty.", onClick: handlers.seed, disabled };
  if (state.simulations.filter((item) => item.coverage.known === 8).length < 3) return { label: "Simulate 8 checks per branch", hint: "3 required tasks + 5 adversarial probes.", onClick: handlers.simulate, disabled };
  if (state.workspace.phase === "explore") return { label: "Select the green Balanced card", hint: "Only a Human can choose which proposal enters review.", onClick: () => document.querySelector<HTMLButtonElement>("[data-review-balanced]")?.click(), disabled };
  if (state.workspace.phase === "review" && !currentPreview) return { label: "Agent previews activation", hint: "Creates an immutable diff; authority is unchanged.", onClick: handlers.preview, disabled };
  if (state.workspace.phase === "review" && currentPreview?.status === "pending") return { label: "Human approves exact preview", hint: "Approval binds this branch, revision, hash, and version.", onClick: handlers.approve, disabled };
  if (state.workspace.phase === "approved") return { label: "Agent commits approved policy", hint: "Commit revalidates every invariant atomically.", onClick: handlers.commit, disabled };
  if (state.workspace.phase === "execution" && !state.refunds.length) return { label: "Run bounded refund", hint: "Agent gets only lookup, refund, and verification tools.", onClick: handlers.execute, disabled };
  if (state.workspace.phase === "execution") return { label: "Generate verification receipt", hint: "Independent checks read the policy and ledger.", onClick: handlers.verify, disabled };
  const armed = Boolean(state.workspace.undoArmedUntil && new Date(state.workspace.undoArmedUntil).getTime() > Date.now());
  if (!armed) return { label: "Human arms undo (60s)", hint: "Undo never appears until a Human explicitly enables it.", onClick: handlers.armUndo, disabled };
  return { label: "Agent revokes access", hint: "Creates a compensating policy version; ledger evidence remains.", onClick: handlers.undo, disabled };
}

function PanelHeading({ index, title, meta }: { index: string; title: string; meta: string }) {
  return <div className="panel-heading"><span>{index}</span><h2>{title}</h2><small>{meta}</small></div>;
}

function StatusDot({ tone }: { tone: "success" | "live" | "danger" | "muted" }) {
  return <span className={`status-dot ${tone}`} aria-hidden="true" />;
}

function Spinner() {
  return <span className="spinner" aria-hidden="true" />;
}

function ConstraintRow({ label, scope, danger = false }: { label: string; scope: string; danger?: boolean }) {
  return <div className="constraint-row"><span className={danger ? "deny-mark" : "allow-mark"}>{danger ? "×" : "✓"}</span><span>{label}</span><code>{scope}</code></div>;
}

function EmptyBranches() {
  return (
    <div className="empty-branches">
      <div className="branch-ghosts" aria-hidden="true"><span /><span /><span /></div>
      <h3>One mutable policy is a bad comparison.</h3>
      <p>The agent will fork three isolated manifests so evidence from one cannot contaminate another.</p>
    </div>
  );
}

function findSimulation(state: AppState, branch: Branch): Simulation | undefined {
  return state.simulations.find(
    (simulation) => simulation.branchId === branch.id && simulation.branchRevision === branch.revision,
  );
}

function BranchCard({
  branch,
  simulation,
  recommended,
  selected,
  canSelect,
  onSelect,
}: {
  branch: Branch;
  simulation?: Simulation;
  recommended: boolean;
  selected: boolean;
  canSelect: boolean;
  onSelect: () => void;
}) {
  const copy = BRANCH_COPY[branch.label];
  return (
    <article className={`branch-card ${branch.label} ${selected ? "selected" : ""}`} data-testid={`branch-${branch.label}`}>
      <div className="branch-card-top">
        <div><span className="branch-eyebrow">{copy.eyebrow}</span><h3>{branch.label[0].toUpperCase() + branch.label.slice(1)}</h3></div>
        <div className="branch-badges">{recommended && <span className="recommended">Recommended</span>}<code>r{branch.revision}</code></div>
      </div>
      <p>{copy.thesis}</p>
      <div className="capability-list">
        {branch.manifest.capabilities.map((grant) => (
          <span key={grant.id} className={grant.id === "customers.export_all" || grant.id === "users.set_role" ? "capability dangerous" : grant.id === "refunds.issue" ? "capability write" : "capability"}>
            {grant.id}
            {grant.constraints?.maxAmount ? <small>≤ ${grant.constraints.maxAmount}</small> : null}
          </span>
        ))}
      </div>
      {simulation ? (
        <div className="simulation-block">
          <div className="score-row">
            <Score label="Task" passed={simulation.utility.passed} total={simulation.utility.total} />
            <Score label="Safety" passed={simulation.safety.passed} total={simulation.safety.total} />
            <span className={`eligibility ${simulation.success ? "pass" : "fail"}`}>{simulation.success ? "Eligible" : "Blocked"}</span>
          </div>
          <div className="check-dots" aria-label={`${simulation.checks.filter((check) => check.passed).length} of ${simulation.checks.length} checks passed`}>
            {simulation.checks.map((check) => <span key={check.id} className={check.passed ? "passed" : "failed"} title={`${check.label}: ${check.decision}`} />)}
          </div>
        </div>
      ) : (
        <div className="not-simulated"><span /><span /><span /> Not simulated</div>
      )}
      {canSelect && (
        <button className="button branch-select" data-review-balanced onClick={onSelect}>Human: review this branch</button>
      )}
      {selected && <div className="selected-banner">Human-selected for review</div>}
    </article>
  );
}

function Score({ label, passed, total }: { label: string; passed: number; total: number }) {
  return <div className="score"><span>{label}</span><strong>{passed}<small>/{total}</small></strong></div>;
}

function PreviewCard({ preview, branch }: { preview: Preview; branch?: Branch }) {
  return (
    <article className={`preview-card ${preview.status}`} data-testid="activation-preview">
      <div className="preview-header"><div><span>Immutable activation preview</span><h3>{branch?.label ?? "Policy"} → active</h3></div><code>{preview.hash.slice(7, 17)}</code></div>
      <div className="preview-diff">
        <span className="before">BEFORE · no tools</span><span className="arrow">→</span><span className="after">AFTER · {preview.toolSurfaceAfter.length} tools</span>
      </div>
      <div className="preview-checks">
        {preview.checks.map((check) => <div key={check.name}><span>{check.passed ? "✓" : "×"}</span><div><strong>{check.label}</strong><small>{check.detail}</small></div></div>)}
      </div>
      <div className="preview-footer"><span className={`approval-state ${preview.status}`}>{preview.status === "approved" ? "Human approved" : preview.status === "committed" ? "Committed" : "Awaiting Human"}</span><small>Expires {new Date(preview.expiresAt).toLocaleTimeString()}</small></div>
    </article>
  );
}

function VerificationReceipt({ verification }: { verification: AppState["verifications"][number] }) {
  return (
    <article className={`verification-receipt ${verification.success ? "verified" : "failed"}`} data-testid="verification-receipt">
      <div className="verification-seal"><span>{verification.success ? "✓" : "×"}</span></div>
      <div className="verification-title"><span>Deterministic receipt</span><h3>{verification.success ? "Outcome verified" : "Verification failed"}</h3><code>{verification.id}</code></div>
      <div className="verification-checks">
        {verification.checks.filter((check) => check.name !== "evidence_key").map((check) => (
          <div key={check.name} data-testid="verification-check"><span>{check.passed ? "✓" : "×"}</span><div><strong>{check.label}</strong><small>{check.detail}</small></div></div>
        ))}
      </div>
      <div className="receipt-signature"><span>state v{verification.stateVersion}</span><span>coverage {verification.coverage.known}/{verification.coverage.known + verification.coverage.unknown}</span><span>{verification.policyVersionId}</span></div>
    </article>
  );
}

function ReceiptTimeline({ receipts }: { receipts: Receipt[] }) {
  const shown = receipts.slice(-4).reverse();
  if (!shown.length) return null;
  return (
    <section className="receipt-timeline">
      <div className="section-label"><span>Receipts</span><code>{receipts.length}</code></div>
      {shown.map((receipt) => <div className="receipt-row" key={receipt.id}><span /><div><strong>{receipt.title}</strong><small>{receipt.summary}</small></div><code>v{receipt.stateVersion}</code></div>)}
    </section>
  );
}

export function InlineCode({ children }: { children: ReactNode }) {
  return <code>{children}</code>;
}
