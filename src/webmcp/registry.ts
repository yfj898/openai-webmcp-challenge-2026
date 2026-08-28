import type { PermitBenchService } from "../domain/service";
import { createToolCatalog, type PermitBenchTool } from "./tools";

export interface RegistryStatus {
  support: "available" | "unavailable" | "error";
  expectedNames: string[];
  registeredNames: string[];
  message: string;
  revision: number;
}

export class WebMcpRegistry {
  private readonly catalog: Map<string, PermitBenchTool>;
  private controller?: AbortController;
  private unsubscribe?: () => void;
  private undoTimer?: ReturnType<typeof setTimeout>;
  private surfaceKey = "";
  private installRevision = 0;
  private status: RegistryStatus = {
    support: "unavailable",
    expectedNames: [],
    registeredNames: [],
    message: "Checking browser support…",
    revision: 0,
  };
  private readonly listeners = new Set<(status: RegistryStatus) => void>();

  constructor(private readonly service: PermitBenchService) {
    this.catalog = createToolCatalog(service);
  }

  start(): void {
    this.unsubscribe = this.service.subscribe(() => void this.refresh());
    void this.refresh();
  }

  stop(): void {
    this.controller?.abort();
    if (this.undoTimer) clearTimeout(this.undoTimer);
    this.unsubscribe?.();
  }

  subscribe(listener: (status: RegistryStatus) => void): () => void {
    this.listeners.add(listener);
    listener(structuredClone(this.status));
    return () => this.listeners.delete(listener);
  }

  getStatus(): RegistryStatus {
    return structuredClone(this.status);
  }

  getTool(name: string): PermitBenchTool | undefined {
    return this.catalog.get(name);
  }

  async invokeForDemo(name: string, input: unknown): Promise<unknown> {
    if (!this.service.getExpectedToolSurface().includes(name)) {
      return {
        ok: false,
        error: {
          code: "PHASE_MISMATCH",
          message: `${name} is not exposed in the current phase.`,
          retryable: false,
        },
        meta: {
          workspace_id: this.service.snapshot().workspace.id,
          state_version: this.service.snapshot().workspace.version,
          request_id: `req_local_${Date.now()}`,
        },
      };
    }
    const tool = this.catalog.get(name);
    if (!tool) throw new Error(`Unknown PermitBench tool: ${name}`);
    return tool.execute(input);
  }

  private async refresh(): Promise<void> {
    const expectedNames = this.service.getExpectedToolSurface();
    const nextSurfaceKey = expectedNames.join("|");
    if (nextSurfaceKey === this.surfaceKey && this.installRevision > 0) return;
    this.surfaceKey = nextSurfaceKey;
    const revision = ++this.installRevision;
    this.controller?.abort();
    this.controller = new AbortController();
    if (this.undoTimer) clearTimeout(this.undoTimer);
    const armedUntil = this.service.snapshot().workspace.undoArmedUntil;
    if (armedUntil) {
      const remaining = new Date(armedUntil).getTime() - Date.now();
      if (remaining > 0) {
        this.undoTimer = setTimeout(() => {
          this.surfaceKey = "";
          void this.refresh();
        }, remaining + 25);
      }
    }

    if (typeof document.modelContext?.registerTool !== "function") {
      this.setStatus({
        support: "unavailable",
        expectedNames,
        registeredNames: [],
        message: "WebMCP is not exposed by this browser. The Human UI and local tool harness still work.",
        revision,
      });
      return;
    }

    try {
      for (const name of expectedNames) {
        const tool = this.catalog.get(name);
        if (!tool) throw new Error(`Missing tool definition: ${name}`);
        const { parser: _parser, ...webMcpTool } = tool;
        await document.modelContext.registerTool(webMcpTool, {
          signal: this.controller.signal,
        });
      }
      if (revision !== this.installRevision) return;
      let registeredNames = expectedNames;
      if (typeof document.modelContext.getTools === "function") {
        const tools = await document.modelContext.getTools();
        registeredNames = Array.from(tools)
          .map((tool) => tool.name)
          .filter((name) => expectedNames.includes(name));
      }
      this.setStatus({
        support: "available",
        expectedNames,
        registeredNames,
        message: `${registeredNames.length} phase-scoped site tools registered on the live page.`,
        revision,
      });
    } catch (error) {
      if (revision !== this.installRevision) return;
      this.setStatus({
        support: "error",
        expectedNames,
        registeredNames: [],
        message: error instanceof Error ? error.message : "WebMCP registration failed.",
        revision,
      });
    }
  }

  private setStatus(status: RegistryStatus): void {
    this.status = status;
    for (const listener of this.listeners) listener(structuredClone(status));
  }
}
