import type { ProviderAdapter, ConnectionTestResult } from "./base";
import type { ProviderConnection, AgentEvent, AgentEventType } from "../types";

const eventMap: Record<string, AgentEventType> = {
  on_chain_start: "agent.started",
  on_chain_end: "agent.completed",
  on_tool_start: "agent.tool_call.started",
  on_tool_end: "agent.tool_call.completed",
  on_llm_start: "agent.thinking",
  on_llm_end: "agent.thinking",
};

export const LangGraphAdapter: ProviderAdapter = {
  id: "langgraph",
  name: "LangGraph",
  authTypes: ["api_key", "webhook"],

  async testConnection(connection: ProviderConnection): Promise<ConnectionTestResult> {
    void connection;
    return {
      success: false,
      message: "Demo mode: send webhook events or connect credentials in production for a live test.",
      latencyMs: 0,
    };
  },

  normalizeEvent(raw: unknown): AgentEvent {
    const payload = (raw ?? {}) as Record<string, unknown>;
    const incomingType = String(payload.event ?? payload.eventType ?? "");

    return {
      id: String(payload.id ?? payload.run_id ?? `langgraph_${Date.now()}`),
      workspaceId: String(payload.workspaceId ?? payload.workspace_id ?? "ws_demo"),
      runId: String(payload.runId ?? payload.run_id ?? "run_ingest"),
      agentId: String(payload.agentId ?? payload.agent_id ?? "agent_unknown"),
      provider: "langgraph",
      eventType: eventMap[incomingType] ?? "agent.thinking",
      title: String(payload.title ?? payload.name ?? "LangGraph event"),
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
