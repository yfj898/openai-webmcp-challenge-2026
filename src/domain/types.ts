export type WorkspacePhase =
  | "explore"
  | "review"
  | "approved"
  | "execution"
  | "post_commit";

export type BranchLabel = "strict" | "balanced" | "broad";

export type CapabilityId =
  | "orders.lookup"
  | "shipments.lookup"
  | "refunds.issue"
  | "customers.export_all"
  | "users.set_role";

export interface CapabilityGrant {
  id: CapabilityId;
  resources?: string[];
  constraints?: {
    maxAmount?: number;
    currency?: "USD";
    orderIds?: string[];
    ticketIds?: string[];
  };
}

export interface PolicyManifest {
  capabilities: CapabilityGrant[];
}

export interface TaskTest {
  id: string;
  label: string;
  kind: "positive" | "negative";
  action:
    | {
        capability: CapabilityId;
        orderId?: string;
        ticketId?: string;
        amount?: number;
        currency?: "USD";
      }
    | { capability: "duplicate_guard" };
}

export interface TaskPack {
  id: "T-1042";
  version: 1;
  goal: string;
  context: string;
  orderId: "ORD-8821";
  amount: 42.8;
  currency: "USD";
  tests: TaskTest[];
}

export interface Workspace {
  id: "ws_refund_demo";
  name: string;
  version: number;
  phase: WorkspacePhase;
  activePolicyId: string;
  selectedBranchId?: string;
  currentPreviewId?: string;
  undoArmedUntil?: string;
  lastAgentReadAt?: string;
  task: TaskPack;
}

export interface Branch {
  id: string;
  label: BranchLabel;
  intent: string;
  baseVersion: number;
  revision: number;
  status: "draft" | "simulated" | "selected" | "activated" | "archived";
  manifest: PolicyManifest;
  manifestHash: string;
  createdAt: string;
  updatedAt: string;
}

export interface SimulationCheck {
  id: string;
  label: string;
  kind: "positive" | "negative";
  passed: boolean;
  decision: "allowed" | "denied";
  evidence: string[];
}

export interface Simulation {
  id: string;
  branchId: string;
  branchRevision: number;
  manifestHash: string;
  success: boolean;
  utility: { passed: number; total: number };
  safety: { passed: number; total: number };
  coverage: { known: number; unknown: number };
  blastRadius: {
    writeCapabilities: number;
    resourceCount: number;
    wildcards: number;
  };
  checks: SimulationCheck[];
  resultHash: string;
  createdAt: string;
}

export interface ValidationCheck {
  name: string;
  label: string;
  passed: boolean;
  detail: string;
}

export interface Preview {
  id: string;
  branchId: string;
  branchRevision: number;
  baseVersion: number;
  manifestHash: string;
  hash: string;
  status: "pending" | "approved" | "committed" | "aborted" | "expired";
  add: string[];
  remove: string[];
  checks: ValidationCheck[];
  toolSurfaceAfter: string[];
  createdAt: string;
  expiresAt: string;
}

export interface Approval {
  id: string;
  previewId: string;
  previewHash: string;
  actorId: "human_demo_approver";
  approvedAt: string;
}

export interface PolicyVersion {
  id: string;
  manifest: PolicyManifest;
  manifestHash: string;
  sourceBranchId?: string;
  previousPolicyId?: string;
  createdAt: string;
}

export interface Order {
  id: "ORD-8821" | "ORD-9999";
  amount: number;
  currency: "USD";
  status: "delivered";
  deliveredAt: string;
  shipmentStatus: "damaged_reported" | "delivered";
  refundStatus: "none" | "completed";
}

export interface RefundRecord {
  id: string;
  orderId: string;
  ticketId: string;
  amount: number;
  currency: "USD";
  reasonCode: "damaged_item" | "not_received" | "approved_exception";
  status: "completed";
  policyVersionId: string;
  receiptId: string;
  createdAt: string;
}

export interface Verification {
  id: string;
  success: boolean;
  taskId: string;
  policyVersionId: string;
  checks: Array<{
    name: string;
    label: string;
    passed: boolean;
    detail: string;
    evidenceIds?: string[];
  }>;
  coverage: { known: number; unknown: number };
  stateVersion: number;
  receiptId: string;
  createdAt: string;
}

export interface Receipt {
  id: string;
  type: "policy_commit" | "refund" | "verification" | "policy_undo";
  title: string;
  summary: string;
  stateVersion: number;
  evidenceIds: string[];
  undoToken?: string;
  previousPolicyId?: string;
  consumedAt?: string;
  createdAt: string;
}

export interface AuditEvent {
  id: string;
  type: string;
  actor: "agent" | "human" | "system";
  summary: string;
  stateVersion: number;
  createdAt: string;
}

export interface IdempotencyRecord {
  scope: string;
  payloadHash: string;
  response: unknown;
  createdAt: string;
}

export interface AppState {
  workspace: Workspace;
  branches: Branch[];
  simulations: Simulation[];
  previews: Preview[];
  approvals: Approval[];
  policies: PolicyVersion[];
  orders: Order[];
  refunds: RefundRecord[];
  verifications: Verification[];
  receipts: Receipt[];
  audit: AuditEvent[];
  idempotency: IdempotencyRecord[];
}

export type ErrorCode =
  | "INVALID_ARGUMENT"
  | "WORKSPACE_MISMATCH"
  | "PHASE_MISMATCH"
  | "STALE_VERSION"
  | "STALE_BRANCH"
  | "PREVIEW_EXPIRED"
  | "NOT_APPROVED"
  | "POLICY_DENIED"
  | "CONSTRAINT_FAILED"
  | "COVERAGE_INCOMPLETE"
  | "IDEMPOTENCY_CONFLICT"
  | "UNDO_NOT_ARMED"
  | "ABORTED"
  | "NOT_FOUND"
  | "INTERNAL_ERROR";

export interface ToolMeta {
  workspace_id: string;
  state_version: number;
  request_id: string;
  replayed: boolean;
}

export type ToolEnvelope<T = unknown> =
  | { ok: true; data: T; meta: ToolMeta }
  | {
      ok: false;
      error: {
        code: ErrorCode;
        message: string;
        retryable: boolean;
        current_version?: number;
        changed_fields?: string[];
      };
      meta: Omit<ToolMeta, "replayed">;
    };

export interface Comparison {
  baseline: { workspaceVersion: number; taskPackVersion: number; catalogVersion: number };
  ranking: string[];
  recommendedBranchId?: string;
  branches: Array<{
    id: string;
    label: BranchLabel;
    utility: { passed: number; total: number };
    safety: { passed: number; total: number };
    blastRadius: Simulation["blastRadius"];
    eligibleForPreview: boolean;
  }>;
  diffs: Array<{ capabilityId: string; presentIn: string[]; risk: "normal" | "high" | "critical" }>;
  recommendationRule: string;
}
