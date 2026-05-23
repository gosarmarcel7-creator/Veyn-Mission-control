import type { ProviderAdapter, ConnectionTestResult } from "./base";
import type { ProviderConnection, AgentEvent } from "../types";

export const OpenAIAdapter: ProviderAdapter = {
  id: "openai",
  name: "OpenAI",
  authTypes: ["api_key"],

  async testConnection(connection: ProviderConnection): Promise<ConnectionTestResult> {
    void connection;
    return {
      success: false,
      message: "Demo mode: add a real OpenAI API key in production to run a live connection test.",
      latencyMs: 0,
    };
  },

  normalizeEvent(raw: unknown): AgentEvent {
    const payload = (raw ?? {}) as Record<string, unknown>;

    return {
      id: String(payload.id ?? `openai_${Date.now()}`),
      workspaceId: String(payload.workspaceId ?? payload.workspace_id ?? "ws_demo"),
      runId: String(payload.runId ?? payload.run_id ?? "run_ingest"),
      agentId: String(payload.agentId ?? payload.agent_id ?? "agent_unknown"),
      provider: "openai",
      eventType: "agent.thinking",
      title: String(payload.title ?? "OpenAI event"),
      message: payload.message ? String(payload.message) : undefined,
      task: payload.task ? String(payload.task) : undefined,
      tool: payload.tool ? String(payload.tool) : undefined,
      inputSummary: payload.inputSummary ? String(payload.inputSummary) : undefined,
      outputSummary: payload.outputSummary ? String(payload.outputSummary) : undefined,
      metadata: (payload.metadata as Record<string, unknown> | undefined) ?? {},
      timestamp: payload.timestamp ? String(payload.timestamp) : new Date().toISOString(),
    };
  },
};
