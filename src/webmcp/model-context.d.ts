export {};

declare global {
  interface ModelContextTool {
    name: string;
    description: string;
    inputSchema: Record<string, unknown>;
    annotations?: {
      readOnlyHint?: boolean;
      untrustedContentHint?: boolean;
    };
    execute: (
      input: unknown,
      context?: { signal?: AbortSignal },
    ) => Promise<unknown> | unknown;
  }

  interface ModelContext {
    registerTool(
      tool: ModelContextTool,
      options?: { signal?: AbortSignal; exposedTo?: string[] },
    ): Promise<void> | void;
    getTools?(): Promise<ModelContextTool[]> | ModelContextTool[];
  }

  interface Document {
    modelContext?: ModelContext;
  }
}
