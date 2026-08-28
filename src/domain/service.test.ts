import { beforeEach, describe, expect, it } from "vitest";
import { candidateManifests } from "./fixtures";
import { DomainError, PermitBenchService } from "./service";
import { MemoryWorkspaceRepository } from "./storage";

const FIXED_TIME = new Date("2026-08-28T10:00:00.000Z");

async function createService() {
  const service = new PermitBenchService(new MemoryWorkspaceRepository(), () => FIXED_TIME);
  await service.initialize();
  return service;
}

async function prepareCommittedService() {
  const service = await createService();
  await service.seedCandidateBranches();
  await service.simulateAllBranches();
  await service.selectBranchForReview("br_balanced");
  const previewResult = await service.previewPolicyActivation({
    branch_id: "br_balanced",
    expected_branch_revision: 1,
    expected_version: 15,
    idempotency_key: "test-preview-balanced-001",
  });
  const preview = (previewResult.data as { preview: { id: string } }).preview;
  await service.approveCurrentPreview();
  await service.commitPolicyActivation({
    preview_id: preview.id,
    expected_version: 15,
    idempotency_key: "test-policy-commit-0001",
  });
  return service;
}

describe("PermitBench deterministic policy engine", () => {
  let service: PermitBenchService;

  beforeEach(async () => {
    service = await createService();
  });

  it("keeps policy proposals isolated from active authority", async () => {
    await service.seedCandidateBranches();

    const state = service.snapshot();
    expect(state.workspace.version).toBe(15);
    expect(state.workspace.activePolicyId).toBe("pv_0");
    expect(state.policies[0].manifest.capabilities).toEqual([]);
    expect(state.branches).toHaveLength(3);
  });

  it("produces the frozen strict, balanced, and broad score profile", async () => {
    await service.seedCandidateBranches();
    await service.simulateAllBranches();

    const scores = Object.fromEntries(
      service.snapshot().branches.map((branch) => {
        const simulation = service
          .snapshot()
          .simulations.find((item) => item.branchId === branch.id)!;
        return [branch.label, { utility: simulation.utility, safety: simulation.safety }];
      }),
    );

    expect(scores).toEqual({
      strict: { utility: { passed: 2, total: 3 }, safety: { passed: 5, total: 5 } },
      balanced: { utility: { passed: 3, total: 3 }, safety: { passed: 5, total: 5 } },
      broad: { utility: { passed: 3, total: 3 }, safety: { passed: 2, total: 5 } },
    });

    const comparison = service.comparePolicyBranches(["br_strict", "br_balanced", "br_broad"]);
    expect(comparison.recommendedBranchId).toBe("br_balanced");
    expect(comparison.ranking[0]).toBe("br_balanced");
    expect(comparison.diffs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ capabilityId: "customers.export_all", risk: "critical" }),
        expect.objectContaining({ capabilityId: "users.set_role", risk: "critical" }),
      ]),
    );
  });

  it("rejects an ineligible branch before Human review", async () => {
    await service.seedCandidateBranches();
    await service.simulateAllBranches();

    await expect(service.selectBranchForReview("br_broad")).rejects.toMatchObject({
      code: "CONSTRAINT_FAILED",
    });
    expect(service.snapshot().workspace.phase).toBe("explore");
  });

  it("does not expose commit authority until the exact preview has Human approval", async () => {
    await service.seedCandidateBranches();
    await service.simulateAllBranches();
    await service.selectBranchForReview("br_balanced");
    const previewResult = await service.previewPolicyActivation({
      branch_id: "br_balanced",
      expected_branch_revision: 1,
      expected_version: 15,
      idempotency_key: "test-preview-balanced-002",
    });
    const preview = (previewResult.data as { preview: { id: string } }).preview;

    expect(service.getExpectedToolSurface()).not.toContain("commit_policy_activation");
    await expect(
      service.commitPolicyActivation({
        preview_id: preview.id,
        expected_version: 15,
        idempotency_key: "test-policy-commit-0002",
      }),
    ).rejects.toMatchObject({ code: "PHASE_MISMATCH" });

    await service.approveCurrentPreview();
    expect(service.getExpectedToolSurface()).toContain("commit_policy_activation");
  });

  it("rejects stale proposal writes without changing state", async () => {
    const before = service.snapshot();
    await expect(
      service.proposePolicyBranch({
        operation: "create",
        label: "balanced",
        intent: "A valid but intentionally stale proposal for the task.",
        base_version: 11,
        manifest: candidateManifests.balanced,
        idempotency_key: "test-stale-branch-00001",
      }),
    ).rejects.toMatchObject({ code: "STALE_VERSION" });
    expect(service.snapshot()).toEqual(before);
  });
});

describe("PermitBench transactional writes", () => {
  it("blocks an over-limit refund even when the handler is called directly", async () => {
    const service = await prepareCommittedService();

    await expect(
      service.issueRefund({
        order_id: "ORD-8821",
        ticket_id: "T-1042",
        amount: 120,
        currency: "USD",
        reason_code: "damaged_item",
        expected_version: 16,
        idempotency_key: "test-refund-overlimit-01",
      }),
    ).rejects.toMatchObject({ code: "POLICY_DENIED" });
    expect(service.snapshot().workspace.version).toBe(16);
    expect(service.snapshot().refunds).toHaveLength(0);
  });

  it("replays the same idempotent refund but blocks any second logical refund", async () => {
    const service = await prepareCommittedService();
    const input = {
      order_id: "ORD-8821",
      ticket_id: "T-1042",
      amount: 42.8,
      currency: "USD" as const,
      reason_code: "damaged_item" as const,
      expected_version: 16,
      idempotency_key: "test-refund-success-0001",
    };

    const first = await service.issueRefund(input);
    const replay = await service.issueRefund(input);
    expect(first.replayed).toBe(false);
    expect(replay.replayed).toBe(true);
    expect(replay.data).toEqual(first.data);
    expect(service.snapshot().refunds).toHaveLength(1);
    expect(service.snapshot().workspace.version).toBe(17);

    await expect(
      service.issueRefund({
        ...input,
        expected_version: 17,
        idempotency_key: "test-refund-second-00002",
      }),
    ).rejects.toMatchObject({ code: "CONSTRAINT_FAILED" });
    expect(service.snapshot().refunds).toHaveLength(1);
  });

  it("rejects reuse of an idempotency key with a different payload", async () => {
    const service = await prepareCommittedService();
    const input = {
      order_id: "ORD-8821",
      ticket_id: "T-1042",
      amount: 42.8,
      currency: "USD" as const,
      reason_code: "damaged_item" as const,
      expected_version: 16,
      idempotency_key: "test-refund-conflict-001",
    };
    await service.issueRefund(input);

    await expect(service.issueRefund({ ...input, amount: 40 })).rejects.toMatchObject({
      code: "IDEMPOTENCY_CONFLICT",
    });
  });

  it("verifies the ledger and revokes execution tools through Human-armed undo", async () => {
    const service = await prepareCommittedService();
    await service.issueRefund({
      order_id: "ORD-8821",
      ticket_id: "T-1042",
      amount: 42.8,
      currency: "USD",
      reason_code: "damaged_item",
      expected_version: 16,
      idempotency_key: "test-refund-verify-00001",
    });
    const verified = (await service.verifyTaskOutcome({
      task_id: "T-1042",
      policy_version_id: "pv_16",
      expected_version: 17,
    })) as { verification: { success: boolean; checks: Array<{ passed: boolean }> } };
    expect(verified.verification.success).toBe(true);
    expect(verified.verification.checks.every((check) => check.passed)).toBe(true);
    expect(service.snapshot().workspace.phase).toBe("post_commit");

    const commitReceipt = service.snapshot().receipts.find((receipt) => receipt.type === "policy_commit")!;
    await expect(
      service.undoPolicyActivation({
        receipt_id: commitReceipt.id,
        undo_token: commitReceipt.undoToken!,
        expected_version: 17,
        idempotency_key: "test-undo-not-armed-001",
      }),
    ).rejects.toMatchObject({ code: "UNDO_NOT_ARMED" });

    await service.armUndo();
    expect(service.getExpectedToolSurface()).toContain("undo_policy_activation");
    await service.undoPolicyActivation({
      receipt_id: commitReceipt.id,
      undo_token: commitReceipt.undoToken!,
      expected_version: 17,
      idempotency_key: "test-undo-after-arm-001",
    });
    expect(service.snapshot().workspace.version).toBe(18);
    expect(service.snapshot().workspace.phase).toBe("review");
    expect(service.getExpectedToolSurface()).not.toContain("issue_refund");
    expect(service.snapshot().refunds).toHaveLength(1);

    await expect(
      service.issueRefund({
        order_id: "ORD-8821",
        ticket_id: "T-1042",
        amount: 42.8,
        currency: "USD",
        reason_code: "damaged_item",
        expected_version: 18,
        idempotency_key: "test-refund-after-undo-1",
      }),
    ).rejects.toBeInstanceOf(DomainError);
  });
});
