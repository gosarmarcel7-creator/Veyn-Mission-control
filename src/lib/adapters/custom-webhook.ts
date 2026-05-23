import type { ProviderAdapter, ConnectionTestResult } from "./base";
import type { ProviderConnection, AgentEvent, AgentEventType } from "../types";

const VALID_TYPES: AgentEventType[] = [
  "agent.created",
  "agent.started",
  "agent.thinking",
  "agent.tool_call.started",
  "agent.tool_call.completed",
  "agent.file.changed",
  "agent.code.running",
  "agent.review.started",
  "agent.blocked",
  "agent.completed",
  "agent.paused",
  "agent.resumed",
  "agent.error",
];

export const CustomWebhookAdapter: ProviderAdapter = {
  id: "custom_webhook",
  name: "Custom Webhook",
  authTypes: ["webhook"],

  async testConnection(connection: ProviderConnection): Promise<ConnectionTestResult> {
    void connection;
    return {
      success: true,
      message: "Webhook endpoint is configured. Send a signed event to verify ingestion.",
      latencyMs: 0,
    };
  },

  normalizeEvent(raw: unknown): AgentEvent {
    const payload = (raw ?? {}) as Record<string, unknown>;
    const eventType = String(payload.eventType ?? payload.event_type ?? "agent.thinking");

    return {
      id: String(payload.id ?? `webhook_${Date.now()}`),
      workspaceId: String(payload.workspaceId ?? payload.workspace_id ?? "ws_demo"),
      runId: String(payload.runId ?? payload.run_id ?? "run_ingest"),
      agentId: String(payload.agentId ?? payload.agent_id ?? "agent_unknown"),
      provider: "custom_webhook",
      eventType: VALID_TYPES.includes(eventType as AgentEventType)
        ? (eventType as AgentEventType)
        : "agent.thinking",
      title: String(payload.title ?? "Webhook event"),
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
