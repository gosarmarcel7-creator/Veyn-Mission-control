import type { ProviderAdapter, ConnectionTestResult } from "./base";
import type { ProviderConnection, AgentEvent } from "../types";

export const VercelAdapter: ProviderAdapter = {
  id: "vercel",
  name: "Vercel",
  authTypes: ["oauth", "api_key"],

  async testConnection(connection: ProviderConnection): Promise<ConnectionTestResult> {
    void connection;
    return {
      success: false,
      message: "Demo mode: configure Vercel OAuth in production to run live deployment checks.",
      latencyMs: 0,
    };
  },

  normalizeEvent(raw: unknown): AgentEvent {
    const payload = (raw ?? {}) as Record<string, unknown>;

    return {
      id: String(payload.id ?? `vercel_${Date.now()}`),
      workspaceId: String(payload.workspaceId ?? payload.workspace_id ?? "ws_demo"),
      runId: String(payload.runId ?? payload.run_id ?? "run_ingest"),
      agentId: String(payload.agentId ?? payload.agent_id ?? "agent_unknown"),
      provider: "vercel",
      eventType: "agent.tool_call.completed",
      title: String(payload.title ?? payload.type ?? "Vercel event"),
      message: payload.message ? String(payload.message) : payload.url ? `Deployment URL: ${payload.url}` : undefined,
      task: payload.task ? String(payload.task) : undefined,
      tool: payload.tool ? String(payload.tool) : "vercel_api",
      inputSummary: payload.inputSummary ? String(payload.inputSummary) : undefined,
      outputSummary: payload.outputSummary ? String(payload.outputSummary) : undefined,
      metadata: (payload.metadata as Record<string, unknown> | undefined) ?? {},
      timestamp: payload.timestamp ? String(payload.timestamp) : new Date().toISOString(),
    };
  },
};
