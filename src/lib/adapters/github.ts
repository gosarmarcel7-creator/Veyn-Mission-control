import type { ProviderAdapter, ConnectionTestResult } from "./base";
import type { ProviderConnection, AgentEvent } from "../types";

export const GitHubAdapter: ProviderAdapter = {
  id: "github",
  name: "GitHub",
  authTypes: ["oauth", "api_key"],

  async testConnection(connection: ProviderConnection): Promise<ConnectionTestResult> {
    void connection;
    return {
      success: false,
      message: "Demo mode: configure GitHub OAuth in production to run live repository tests.",
      latencyMs: 0,
    };
  },

  normalizeEvent(raw: unknown): AgentEvent {
    const payload = (raw ?? {}) as Record<string, unknown>;

    return {
      id: String(payload.id ?? `github_${Date.now()}`),
      workspaceId: String(payload.workspaceId ?? payload.workspace_id ?? "ws_demo"),
      runId: String(payload.runId ?? payload.run_id ?? "run_ingest"),
      agentId: String(payload.agentId ?? payload.agent_id ?? "agent_unknown"),
      provider: "github",
      eventType: "agent.tool_call.started",
      title: String(payload.title ?? payload.action ?? "GitHub event"),
      message: payload.message ? String(payload.message) : undefined,
      task: payload.task ? String(payload.task) : undefined,
      tool: payload.tool ? String(payload.tool) : "github_api",
      inputSummary: payload.inputSummary ? String(payload.inputSummary) : undefined,
      outputSummary: payload.outputSummary ? String(payload.outputSummary) : undefined,
      metadata: (payload.metadata as Record<string, unknown> | undefined) ?? {},
      timestamp: payload.timestamp ? String(payload.timestamp) : new Date().toISOString(),
    };
  },
};
