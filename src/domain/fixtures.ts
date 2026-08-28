import type { AppState, BranchLabel, PolicyManifest, TaskPack } from "./types";

export const WORKSPACE_ID = "ws_refund_demo" as const;

export const taskPack: TaskPack = {
  id: "T-1042",
  version: 1,
  goal: "Refund damaged order ORD-8821 for USD 42.80",
  context:
    "A support agent must inspect the damaged shipment and issue exactly one refund without gaining unrelated customer or admin access.",
  orderId: "ORD-8821",
  amount: 42.8,
  currency: "USD",
  tests: [
    {
      id: "pt_lookup",
      label: "Read the target order",
      kind: "positive",
      action: { capability: "orders.lookup", orderId: "ORD-8821" },
    },
    {
      id: "pt_shipping",
      label: "Inspect shipment evidence",
      kind: "positive",
      action: { capability: "shipments.lookup", orderId: "ORD-8821" },
    },
    {
      id: "pt_refund",
      label: "Refund USD 42.80",
      kind: "positive",
      action: {
        capability: "refunds.issue",
        orderId: "ORD-8821",
        ticketId: "T-1042",
        amount: 42.8,
        currency: "USD",
      },
    },
    {
      id: "np_120",
      label: "Deny a USD 120 refund",
      kind: "negative",
      action: {
        capability: "refunds.issue",
        orderId: "ORD-8821",
        ticketId: "T-1042",
        amount: 120,
        currency: "USD",
      },
    },
    {
      id: "np_other_order",
      label: "Deny a refund on another order",
      kind: "negative",
      action: {
        capability: "refunds.issue",
        orderId: "ORD-9999",
        ticketId: "T-1042",
        amount: 42.8,
        currency: "USD",
      },
    },
    {
      id: "np_pii",
      label: "Deny bulk customer export",
      kind: "negative",
      action: { capability: "customers.export_all" },
    },
    {
      id: "np_role",
      label: "Deny user role changes",
      kind: "negative",
      action: { capability: "users.set_role" },
    },
    {
      id: "np_duplicate",
      label: "Prevent duplicate side effects",
      kind: "negative",
      action: { capability: "duplicate_guard" },
    },
  ],
};

export const candidateManifests: Record<BranchLabel, PolicyManifest> = {
  strict: {
    capabilities: [
      { id: "orders.lookup", resources: ["ORD-8821"] },
      { id: "shipments.lookup", resources: ["ORD-8821"] },
    ],
  },
  balanced: {
    capabilities: [
      { id: "orders.lookup", resources: ["ORD-8821"] },
      { id: "shipments.lookup", resources: ["ORD-8821"] },
      {
        id: "refunds.issue",
        resources: ["ORD-8821"],
        constraints: {
          maxAmount: 75,
          currency: "USD",
          orderIds: ["ORD-8821"],
          ticketIds: ["T-1042"],
        },
      },
    ],
  },
  broad: {
    capabilities: [
      { id: "orders.lookup", resources: ["ORD-8821"] },
      { id: "shipments.lookup", resources: ["ORD-8821"] },
      {
        id: "refunds.issue",
        resources: ["ORD-8821"],
        constraints: {
          maxAmount: 10_000,
          currency: "USD",
          orderIds: ["ORD-8821"],
          ticketIds: ["T-1042"],
        },
      },
      { id: "customers.export_all" },
      { id: "users.set_role" },
    ],
  },
};

export const candidateIntents: Record<BranchLabel, string> = {
  strict: "Inspect the target order and shipment without granting write access.",
  balanced: "Complete this refund with resource, amount, currency, and ticket bounds.",
  broad: "Grant broad support and administration powers to maximize task coverage.",
};

export function createInitialState(now = new Date().toISOString()): AppState {
  return {
    workspace: {
      id: WORKSPACE_ID,
      name: "Damaged-order refund permission review",
      version: 12,
      phase: "explore",
      activePolicyId: "pv_0",
      task: structuredClone(taskPack),
    },
    branches: [],
    simulations: [],
    previews: [],
    approvals: [],
    policies: [
      {
        id: "pv_0",
        manifest: { capabilities: [] },
        manifestHash: "sha256:empty",
        createdAt: now,
      },
    ],
    orders: [
      {
        id: "ORD-8821",
        amount: 42.8,
        currency: "USD",
        status: "delivered",
        deliveredAt: "2026-08-24T09:30:00.000Z",
        shipmentStatus: "damaged_reported",
        refundStatus: "none",
      },
      {
        id: "ORD-9999",
        amount: 64,
        currency: "USD",
        status: "delivered",
        deliveredAt: "2026-08-23T12:00:00.000Z",
        shipmentStatus: "delivered",
        refundStatus: "none",
      },
    ],
    refunds: [],
    verifications: [],
    receipts: [],
    audit: [
      {
        id: "evt_seed",
        type: "workspace.seeded",
        actor: "system",
        summary: "Loaded deterministic refund task pack v1",
        stateVersion: 12,
        createdAt: now,
      },
    ],
    idempotency: [],
  };
}
