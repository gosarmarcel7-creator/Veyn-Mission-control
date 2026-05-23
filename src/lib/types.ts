export type WorkspacePlan = "free" | "pro" | "enterprise";
export type WorkspaceRole = "owner" | "admin" | "member" | "viewer";

export type ProviderType =
  | "openai"
  | "anthropic"
  | "github"
  | "vercel"
  | "langgraph"
  | "custom_webhook";

export type AgentProviderType = Exclude<ProviderType, "custom_webhook"> | "custom";

export type AuthType = "oauth" | "api_key" | "webhook" | "manual";
export type ConnectionStatus = "connected" | "needs_attention" | "disconnected";

export type AgentRole =
  | "manager"
  | "researcher"
  | "coder"
  | "reviewer"
  | "deployment"
  | "analyst"
  | "support"
  | "custom";

export type AgentModel = "Claude" | "GPT-5" | "GPT-4.1" | "Local" | "Gemini" | "Custom";

export type AgentStatus =
  | "idle"
  | "thinking"
  | "using_tool"
  | "coding"
  | "reviewing"
  | "blocked"
  | "done"
  | "paused";

export type AgentZone =
  | "planning"
  | "research"
  | "coding"
  | "review"
  | "deployment"
  | "lounge"
  | "incident";

export type TaskStatus = "queued" | "assigned" | "in_progress" | "blocked" | "review" | "done";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export type RunStatus = "running" | "completed" | "failed" | "paused";

export type AgentEventType =
  | "agent.created"
  | "agent.started"
  | "agent.thinking"
  | "agent.tool_call.started"
  | "agent.tool_call.completed"
  | "agent.file.changed"
  | "agent.code.running"
  | "agent.review.started"
  | "agent.blocked"
  | "agent.completed"
  | "agent.paused"
  | "agent.resumed"
  | "agent.error";

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  plan: WorkspacePlan;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: WorkspaceRole;
}

export interface ProviderConnection {
  id: string;
  workspaceId: string;
  provider: ProviderType;
  authType: AuthType;
  displayName: string;
  status: ConnectionStatus;
  lastSyncedAt?: string;
  encryptedSecretRef?: string;
  metadata?: Record<string, unknown>;
}

export interface Agent {
  id: string;
  workspaceId: string;
  providerConnectionId?: string;
  name: string;
  role: AgentRole;
  model: AgentModel;
  provider: AgentProviderType;
  status: AgentStatus;
  currentTask?: string;
  currentTool?: string;
  zone: AgentZone;
  progress: number;
  tokensUsed: number;
  costUsd: number;
  lastEventAt: string;
  position: Vec3;
}

export interface AgentEvent {
  id: string;
  workspaceId: string;
  runId: string;
  agentId: string;
  provider: ProviderType | "demo";
  eventType: AgentEventType;
  title: string;
  message?: string;
  task?: string;
  tool?: string;
  inputSummary?: string;
  outputSummary?: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

export interface Task {
  id: string;
  workspaceId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  assignedAgentIds: string[];
  priority: TaskPriority;
  createdAt: string;
  updatedAt: string;
}

export interface Run {
  id: string;
  workspaceId: string;
  title: string;
  status: RunStatus;
  startedAt: string;
  endedAt?: string;
  totalCostUsd: number;
  totalTokens: number;
  provider: ProviderType | "demo";
}

export interface AnalyticsSnapshot {
  totalTokens: number;
  totalCostUsd: number;
  runsToday: number;
  activeAgents: number;
  blockedTimePct: number;
  failureRatePct: number;
  avgRunDurationMinutes: number;
  providerHealthPct: number;
  utilizationPct: number;
}

export interface ProviderDefinition {
  id: ProviderType;
  name: string;
  description: string;
  authType: AuthType;
  methodLabel: string;
  category: "llm" | "orchestration" | "code" | "deployment" | "webhook";
}
