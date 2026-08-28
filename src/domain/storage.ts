import Dexie, { type EntityTable } from "dexie";
import type { AppState } from "./types";

interface SnapshotRecord {
  id: string;
  state: AppState;
  updatedAt: string;
}

export interface WorkspaceRepository {
  load(id: string): Promise<AppState | undefined>;
  save(state: AppState): Promise<void>;
  clear(id: string): Promise<void>;
}

class PermitBenchDatabase extends Dexie {
  snapshots!: EntityTable<SnapshotRecord, "id">;

  constructor() {
    super("permitbench");
    this.version(1).stores({ snapshots: "&id, updatedAt" });
  }
}

export class IndexedDbWorkspaceRepository implements WorkspaceRepository {
  private readonly database = new PermitBenchDatabase();

  async load(id: string): Promise<AppState | undefined> {
    const record = await this.database.snapshots.get(id);
    return record ? structuredClone(record.state) : undefined;
  }

  async save(state: AppState): Promise<void> {
    await this.database.transaction("rw", this.database.snapshots, async () => {
      await this.database.snapshots.put({
        id: state.workspace.id,
        state: structuredClone(state),
        updatedAt: new Date().toISOString(),
      });
    });
  }

  async clear(id: string): Promise<void> {
    await this.database.snapshots.delete(id);
  }
}

export class MemoryWorkspaceRepository implements WorkspaceRepository {
  private state?: AppState;

  async load(): Promise<AppState | undefined> {
    return this.state ? structuredClone(this.state) : undefined;
  }

  async save(state: AppState): Promise<void> {
    this.state = structuredClone(state);
  }

  async clear(): Promise<void> {
    this.state = undefined;
  }
}
