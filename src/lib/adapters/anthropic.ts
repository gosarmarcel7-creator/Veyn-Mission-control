import type { ProviderAdapter, ConnectionTestResult } from "./base";
import type { ProviderConnection, AgentEvent } from "../types";

function getApiKey(connection: ProviderConnection): string | null {
  const key = connection.metadata?.apiKey;
  return typeof key === "string" && key.length > 0 ? key : null;
}

export const AnthropicAdapter: ProviderAdapter = {
  id: "anthropic",
  name: "Anthropic / Claude",
  authTypes: ["api_key"],

  async testConnection(connection: ProviderConnection): Promise<ConnectionTestResult> {
    const start = Date.now();
    const apiKey = getApiKey(connection);
    if (!apiKey) {
      return { success: false, message: "No API key stored for this connection.", latencyMs: 0 };
    }

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-3-5-haiku-20241022",
          max_tokens: 1,
          messages: [{ role: "user", content: "ping" }],
        }),
      });

      if (response.ok || response.status === 400) {
        return {
          success: true,
          message: "Anthropic API key is valid.",
          latencyMs: Date.now() - start,
        };
      }

      const body = await response.text();
      return {
        success: false,
        message: `Anthropic API error (${response.status}): ${body.slice(0, 160)}`,
        latencyMs: Date.now() - start,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Connection test failed.",
        latencyMs: Date.now() - start,
      };
    }
  },

  normalizeEvent(raw: unknown): AgentEvent {
    const payload = (raw ?? {}) as Record<string, unknown>;

    return {
      id: String(payload.id ?? `anthropic_${Date.now()}`),
      workspaceId: String(payload.workspaceId ?? payload.workspace_id ?? "ws_demo"),
      runId: String(payload.runId ?? payload.run_id ?? "run_ingest"),
      agentId: String(payload.agentId ?? payload.agent_id ?? "agent_unknown"),
      provider: "anthropic",
      eventType: "agent.thinking",
      title: String(payload.title ?? "Claude event"),
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
