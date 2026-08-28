import type { AppState, CapabilityId } from "./types";

const BASE = "get_workspace_summary";

export function activeToolNames(state: AppState, at = new Date()): string[] {
  switch (state.workspace.phase) {
    case "explore":
      return [
        BASE,
        "propose_policy_branch",
        "simulate_policy_branch",
        "compare_policy_branches",
      ];
    case "review":
      return [BASE, "compare_policy_branches", "preview_policy_activation"];
    case "approved": {
      const preview = state.previews.find((item) => item.id === state.workspace.currentPreviewId);
      const approved =
        preview?.status === "approved" &&
        state.approvals.some(
          (approval) =>
            approval.previewId === preview.id && approval.previewHash === preview.hash,
        );
      return approved
        ? [BASE, "preview_policy_activation", "commit_policy_activation"]
        : [BASE, "preview_policy_activation"];
    }
    case "execution": {
      const capabilities = activeCapabilities(state);
      const tools = [BASE];
      if (capabilities.has("orders.lookup")) tools.push("lookup_order");
      if (capabilities.has("refunds.issue")) tools.push("issue_refund");
      tools.push("verify_task_outcome");
      return tools;
    }
    case "post_commit": {
      const tools = [BASE, "verify_task_outcome"];
      if (
        state.workspace.undoArmedUntil &&
        new Date(state.workspace.undoArmedUntil).getTime() > at.getTime()
      ) {
        tools.push("undo_policy_activation");
      }
      return tools;
    }
  }
}

export function activeCapabilities(state: AppState): Set<CapabilityId> {
  const policy = state.policies.find((item) => item.id === state.workspace.activePolicyId);
  return new Set(policy?.manifest.capabilities.map((grant) => grant.id) ?? []);
}
