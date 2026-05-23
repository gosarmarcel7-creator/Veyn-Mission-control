import { z } from "zod";

export const WorkspaceSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(120),
  slug: z.string().min(1).max(80),
  plan: z.enum(["free", "pro", "enterprise"]),
  createdAt: z.string().datetime(),
});

export const UserSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(120),
  email: z.string().email(),
  avatarUrl: z.string().url().optional(),
  role: z.enum(["owner", "admin", "member", "viewer"]),
});

export const ProviderConnectionSchema = z.object({
  provider: z.enum(["openai", "anthropic", "github", "vercel", "langgraph", "custom_webhook"]),
  authType: z.enum(["oauth", "api_key", "webhook", "manual"]),
  displayName: z.string().min(1).max(100),
  apiKey: z.string().min(6).optional(),
  webhookSecret: z.string().min(6).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const AgentSchema = z.object({
  id: z.string(),
  workspaceId: z.string(),
  providerConnectionId: z.string().optional(),
  name: z.string().min(1).max(100),
  role: z.enum(["manager", "researcher", "coder", "reviewer", "deployment", "analyst", "support", "custom"]),
  model: z.enum(["Claude", "GPT-5", "GPT-4.1", "Local", "Gemini", "Custom"]),
  provider: z.enum(["openai", "anthropic", "github", "vercel", "langgraph", "custom"]),
  status: z.enum(["idle", "thinking", "using_tool", "coding", "reviewing", "blocked", "done", "paused"]),
  currentTask: z.string().optional(),
  currentTool: z.string().optional(),
  zone: z.enum(["planning", "research", "coding", "review", "deployment", "lounge", "incident"]),
  progress: z.number().min(0).max(100),
  tokensUsed: z.number().int().nonnegative(),
  costUsd: z.number().nonnegative(),
  lastEventAt: z.string().datetime(),
  position: z.object({ x: z.number(), y: z.number(), z: z.number() }),
});

export const AgentEventSchema = z.object({
  id: z.string(),
  workspaceId: z.string(),
  runId: z.string(),
  agentId: z.string(),
  provider: z.enum(["openai", "anthropic", "github", "vercel", "langgraph", "custom_webhook", "demo"]),
  eventType: z.enum([
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
  ]),
  title: z.string().min(1),
  message: z.string().optional(),
  task: z.string().optional(),
  tool: z.string().optional(),
  inputSummary: z.string().optional(),
  outputSummary: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  timestamp: z.string().datetime(),
});

export const WebhookIngestSchema = z.object({
  runId: z.string(),
  agentId: z.string(),
  agentName: z.string().optional(),
  role: z.enum(["manager", "researcher", "coder", "reviewer", "deployment", "analyst", "support", "custom"]).optional(),
  model: z.enum(["Claude", "GPT-5", "GPT-4.1", "Local", "Gemini", "Custom"]).optional(),
  provider: z.enum(["openai", "anthropic", "github", "vercel", "langgraph", "custom_webhook", "demo"]).optional(),
  status: z.enum(["idle", "thinking", "using_tool", "coding", "reviewing", "blocked", "done", "paused"]).optional(),
  eventType: z.string().optional(),
  title: z.string().optional(),
  message: z.string().optional(),
  task: z.string().optional(),
  tool: z.string().optional(),
  inputSummary: z.string().optional(),
  outputSummary: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  timestamp: z.string().datetime().optional(),
});

export const TaskSchema = z.object({
  id: z.string(),
  workspaceId: z.string(),
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  status: z.enum(["queued", "assigned", "in_progress", "blocked", "review", "done"]),
  assignedAgentIds: z.array(z.string()),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const RunSchema = z.object({
  id: z.string(),
  workspaceId: z.string(),
  title: z.string(),
  status: z.enum(["running", "completed", "failed", "paused"]),
  startedAt: z.string().datetime(),
  endedAt: z.string().datetime().optional(),
  totalCostUsd: z.number().nonnegative(),
  totalTokens: z.number().int().nonnegative(),
  provider: z.enum(["openai", "anthropic", "github", "vercel", "langgraph", "custom_webhook", "demo"]),
});

export const TaskCreateSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  assignedAgentIds: z.array(z.string()).optional().default([]),
});

export const TaskPatchSchema = TaskCreateSchema.partial().extend({
  status: z.enum(["queued", "assigned", "in_progress", "blocked", "review", "done"]).optional(),
});

export const AgentCreateSchema = z.object({
  name: z.string().min(1).max(100),
  role: z.enum(["manager", "researcher", "coder", "reviewer", "deployment", "analyst", "support", "custom"]),
  model: z.enum(["Claude", "GPT-5", "GPT-4.1", "Local", "Gemini", "Custom"]),
  provider: z.enum(["openai", "anthropic", "github", "vercel", "langgraph", "custom"]).default("custom"),
  providerConnectionId: z.string().optional(),
  zone: z.enum(["planning", "research", "coding", "review", "deployment", "lounge", "incident"]).optional(),
});

export const AgentPatchSchema = AgentCreateSchema.partial().extend({
  status: z.enum(["idle", "thinking", "using_tool", "coding", "reviewing", "blocked", "done", "paused"]).optional(),
  currentTask: z.string().optional(),
  currentTool: z.string().optional(),
  progress: z.number().min(0).max(100).optional(),
});
