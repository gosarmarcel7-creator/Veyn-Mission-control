import type { Agent, AgentProviderType, AgentRole, AgentStatus, AgentZone, AgentModel } from "./types";
import { WORKSPACE_ID } from "./env";

export interface UpsertAgentFromEventInput {
  agentId: string;
  agentName?: string;
  role?: AgentRole;
  model?: AgentModel;
  provider: AgentProviderType | "custom_webhook" | "demo";
  providerConnectionId?: string;
  status?: AgentStatus;
  eventType?: string;
}

function mapProvider(provider: UpsertAgentFromEventInput["provider"]): AgentProviderType {
  if (provider === "custom_webhook") return "custom";
  if (provider === "demo") return "custom";
  return provider;
}

function defaultPosition(index: number) {
  const angle = (index % 8) * (Math.PI / 4);
  const radius = 2.2 + (index % 3) * 0.4;
  return {
    x: Math.cos(angle) * radius,
    y: 0,
    z: Math.sin(angle) * radius,
  };
}

function statusFromEvent(eventType?: string, status?: AgentStatus): AgentStatus {
  if (status) return status;
  if (eventType === "agent.blocked") return "blocked";
  if (eventType === "agent.completed") return "done";
  if (eventType === "agent.review.started") return "reviewing";
  if (eventType === "agent.tool_call.started") return "using_tool";
  if (eventType === "agent.file.changed") return "coding";
  if (eventType === "agent.created" || eventType === "agent.started") return "thinking";
  return "idle";
}

function zoneFromStatus(status: AgentStatus): AgentZone {
  if (status === "coding") return "coding";
  if (status === "reviewing") return "review";
  if (status === "blocked") return "incident";
  if (status === "done" || status === "idle" || status === "paused") return "lounge";
  return "planning";
}

export function buildAgentFromUpsert(
  input: UpsertAgentFromEventInput,
  existing: Agent | null,
  agentIndex: number
): Agent {
  const status = statusFromEvent(input.eventType, input.status ?? existing?.status);
  const provider = mapProvider(input.provider);

  return {
    id: input.agentId,
    workspaceId: existing?.workspaceId ?? WORKSPACE_ID,
    providerConnectionId: input.providerConnectionId ?? existing?.providerConnectionId,
    name: input.agentName ?? existing?.name ?? input.agentId,
    role: input.role ?? existing?.role ?? "custom",
    model: input.model ?? existing?.model ?? "Custom",
    provider,
    status,
    currentTask: existing?.currentTask,
    currentTool: existing?.currentTool,
    zone: zoneFromStatus(status),
    progress: existing?.progress ?? 0,
    tokensUsed: existing?.tokensUsed ?? 0,
    costUsd: existing?.costUsd ?? 0,
    lastEventAt: new Date().toISOString(),
    position: existing?.position ?? defaultPosition(agentIndex),
  };
}
