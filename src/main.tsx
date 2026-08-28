import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { PermitBenchService } from "./domain/service";
import { IndexedDbWorkspaceRepository } from "./domain/storage";
import { WebMcpRegistry } from "./webmcp/registry";
import "./styles.css";

const service = new PermitBenchService(new IndexedDbWorkspaceRepository());
const registry = new WebMcpRegistry(service);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App service={service} registry={registry} />
  </StrictMode>,
);
