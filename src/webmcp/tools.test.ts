import { beforeEach, describe, expect, it, vi } from "vitest";
import { PermitBenchService } from "../domain/service";
import { MemoryWorkspaceRepository } from "../domain/storage";
import { WebMcpRegistry } from "./registry";

describe("phase-scoped WebMCP registry", () => {
  let service: PermitBenchService;
  let registry: WebMcpRegistry;
  let registered: Map<string, ModelContextTool>;

  beforeEach(async () => {
    registered = new Map();
    document.modelContext = {
      registerTool(tool, options) {
        registered.set(tool.name, tool);
        options?.signal?.addEventListener("abort", () => registered.delete(tool.name), { once: true });
      },
      getTools() {
        return [...registered.values()];
      },
    };
    service = new PermitBenchService(new MemoryWorkspaceRepository());
    await service.initialize();
    registry = new WebMcpRegistry(service);
    registry.start();
  });

  it("registers only the tools for the live phase", async () => {
    await vi.waitFor(() => expect([...registered.keys()].sort()).toEqual([
      "compare_policy_branches",
      "get_workspace_summary",
      "propose_policy_branch",
      "simulate_policy_branch",
    ]));

    await service.seedCandidateBranches();
    await service.simulateAllBranches();
    await service.selectBranchForReview("br_balanced");
    await vi.waitFor(() => expect([...registered.keys()].sort()).toEqual([
      "compare_policy_branches",
      "get_workspace_summary",
      "preview_policy_activation",
    ]));

    const previewResult = await service.previewPolicyActivation({
      branch_id: "br_balanced",
      expected_branch_revision: 1,
      expected_version: 15,
      idempotency_key: "registry-preview-test-001",
    });
    const previewId = (previewResult.data as { preview: { id: string } }).preview.id;
    await service.approveCurrentPreview();
    await vi.waitFor(() => expect([...registered.keys()].sort()).toEqual([
      "commit_policy_activation",
      "get_workspace_summary",
      "preview_policy_activation",
    ]));

    await service.commitPolicyActivation({
      preview_id: previewId,
      expected_version: 15,
      idempotency_key: "registry-commit-test-0001",
    });
    await vi.waitFor(() => expect([...registered.keys()].sort()).toEqual([
      "get_workspace_summary",
      "issue_refund",
      "lookup_order",
      "verify_task_outcome",
    ]));
    registry.stop();
  });

  it("validates unexpected input properties before calling domain logic", async () => {
    const result = (await registry.invokeForDemo("get_workspace_summary", {
      unexpected: "do not ignore me",
    })) as { ok: boolean; error?: { code: string } };
    expect(result.ok).toBe(false);
    expect(result.error?.code).toBe("INVALID_ARGUMENT");
    expect(service.snapshot().workspace.version).toBe(12);
    registry.stop();
  });
});
