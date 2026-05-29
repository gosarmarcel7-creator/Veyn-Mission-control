import type { ProviderAdapter, ConnectionTestResult } from "./base";
import type { ProviderConnection, AgentEvent } from "../types";

function getApiKey(connection: ProviderConnection): string | null {
  const key = connection.metadata?.apiKey;
  return typeof key === "string" && key.length > 0 ? key : null;
}

export const GitHubAdapter: ProviderAdapter = {
  id: "github",
  name: "GitHub",
  authTypes: ["oauth", "api_key"],

  async testConnection(connection: ProviderConnection): Promise<ConnectionTestResult> {
    const start = Date.now();
    const apiKey = getApiKey(connection);
    if (!apiKey) {
      return {
        success: false,
        message: "No GitHub token stored. Connect with a personal access token.",
        latencyMs: 0,
      };
    }

    try {
      const response = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: "application/vnd.github+json",
        },
      });

      if (!response.ok) {
        return {
          success: false,
          message: `GitHub API error (${response.status}).`,
          latencyMs: Date.now() - start,
        };
      }

      const user = (await response.json()) as { login?: string };
      return {
        success: true,
        message: `Connected as ${user.login ?? "GitHub user"}. Agents sync via webhooks.`,
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
