import type { ProviderAdapter, ConnectionTestResult, ExternalAgent } from "./base";
import type { ProviderConnection, AgentEvent } from "../types";

function getApiKey(connection: ProviderConnection): string | null {
  const key = connection.metadata?.apiKey;
  return typeof key === "string" && key.length > 0 ? key : null;
}

async function openaiFetch(connection: ProviderConnection, path: string) {
  const apiKey = getApiKey(connection);
  if (!apiKey) throw new Error("No API key stored for this connection.");

  const response = await fetch(`https://api.openai.com/v1${path}`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${body.slice(0, 200)}`);
  }

  return response.json() as Promise<Record<string, unknown>>;
}

export const OpenAIAdapter: ProviderAdapter = {
  id: "openai",
  name: "OpenAI",
  authTypes: ["api_key"],

  async testConnection(connection: ProviderConnection): Promise<ConnectionTestResult> {
    const start = Date.now();
    try {
      await openaiFetch(connection, "/models");
      return {
        success: true,
        message: "OpenAI API key is valid.",
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

  async listAgents(connection: ProviderConnection): Promise<ExternalAgent[]> {
    const payload = await openaiFetch(connection, "/assistants?limit=50");
    const data = (payload.data as Array<Record<string, unknown>>) ?? [];

    return data.map((assistant) => ({
      id: `openai_${String(assistant.id)}`,
      name: String(assistant.name ?? assistant.id ?? "Assistant"),
      model: assistant.model ? String(assistant.model) : "GPT-4.1",
      status: "idle",
    }));
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
