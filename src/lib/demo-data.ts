import type {
  Agent,
  AgentEvent,
  AgentEventType,
  AgentRole,
  AgentStatus,
  AgentZone,
  ProviderConnection,
  ProviderDefinition,
  Run,
  Task,
  Workspace,
} from "./types";

export const ROOM_POINTS: Record<AgentZone, [number, number, number][]> = {
  planning: [
    [-1.8, 0, -2.2],
    [-0.8, 0, -2.4],
    [0.2, 0, -2.2],
  ],
  research: [
    [-4.2, 0, -1.6],
    [-3.5, 0, -2.1],
    [-4.7, 0, -2.5],
  ],
  coding: [
    [-2.8, 0, 1.2],
    [-1.8, 0, 1.4],
    [-0.8, 0, 1.2],
    [0.2, 0, 1.4],
    [1.2, 0, 1.2],
  ],
  review: [
    [2.4, 0, 0.8],
    [3.2, 0, 1.2],
    [2.8, 0, 1.8],
  ],
  deployment: [
    [3.8, 0, -1.6],
    [4.5, 0, -1.8],
  ],
  lounge: [
    [-4.2, 0, 2.2],
    [-3.4, 0, 2.4],
  ],
  incident: [
    [3.8, 0, 2.4],
    [4.5, 0, 2.2],
  ],
};

export const PROVIDER_DEFINITIONS: ProviderDefinition[] = [
  {
    id: "anthropic",
    name: "Claude",
    description: "Observe Claude-powered agents with server-side key usage and signed webhooks.",
    authType: "api_key",
    methodLabel: "API key",
    category: "llm",
  },
  {
    id: "openai",
    name: "OpenAI",
    description: "Track model calls, tool usage, cost, and progress from OpenAI-based agent runners.",
    authType: "api_key",
    methodLabel: "API key",
    category: "llm",
  },
  {
    id: "langgraph",
    name: "LangGraph",
    description: "Stream graph events and map nodes to agents for multi-agent workflows.",
    authType: "webhook",
    methodLabel: "Webhook / project",
    category: "orchestration",
  },
  {
    id: "github",
    name: "GitHub",
    description: "Track commits, pull requests, branches, and file changes from coding agents.",
    authType: "oauth",
    methodLabel: "OAuth",
    category: "code",
  },
  {
    id: "vercel",
    name: "Vercel",
    description: "Observe deployments, build logs, and environment drift from deployment agents.",
    authType: "oauth",
    methodLabel: "OAuth",
    category: "deployment",
  },
  {
    id: "custom_webhook",
    name: "Custom Webhook",
    description: "Route events from any framework through signed ingest endpoints.",
    authType: "webhook",
    methodLabel: "Webhook",
    category: "webhook",
  },
];

export const DEMO_WORKSPACE: Workspace = {
  id: "ws_demo",
  name: "Veyn Launch Ops",
  slug: "veyn-launch-ops",
  plan: "pro",
  createdAt: "2026-05-23T08:00:00Z",
};

export const DEMO_CONNECTIONS: ProviderConnection[] = [
  {
    id: "conn_openai_prod",
    workspaceId: DEMO_WORKSPACE.id,
    provider: "openai",
    authType: "api_key",
    displayName: "OpenAI Production",
    status: "connected",
    lastSyncedAt: "2026-05-23T11:54:00Z",
    encryptedSecretRef: "enc_ref_openai_prod",
  },
  {
    id: "conn_claude_ops",
    workspaceId: DEMO_WORKSPACE.id,
    provider: "anthropic",
    authType: "api_key",
    displayName: "Claude Operations",
    status: "connected",
    lastSyncedAt: "2026-05-23T11:55:00Z",
    encryptedSecretRef: "enc_ref_claude_ops",
  },
  {
    id: "conn_langgraph_events",
    workspaceId: DEMO_WORKSPACE.id,
    provider: "langgraph",
    authType: "webhook",
    displayName: "LangGraph Event Stream",
    status: "needs_attention",
    lastSyncedAt: "2026-05-23T10:51:00Z",
    encryptedSecretRef: "enc_ref_langgraph_ops",
  },
  {
    id: "conn_github_veyn",
    workspaceId: DEMO_WORKSPACE.id,
    provider: "github",
    authType: "oauth",
    displayName: "GitHub / veyn-org",
    status: "connected",
    lastSyncedAt: "2026-05-23T11:43:00Z",
  },
  {
    id: "conn_vercel_veyn",
    workspaceId: DEMO_WORKSPACE.id,
    provider: "vercel",
    authType: "oauth",
    displayName: "Vercel / mission-control",
    status: "connected",
    lastSyncedAt: "2026-05-23T11:49:00Z",
  },
  {
    id: "conn_webhook_custom",
    workspaceId: DEMO_WORKSPACE.id,
    provider: "custom_webhook",
    authType: "webhook",
    displayName: "Custom Event Ingest",
    status: "connected",
    lastSyncedAt: "2026-05-23T11:58:00Z",
  },
];

const NOW = "2026-05-23T12:00:00Z";

const BASE_AGENTS: Omit<Agent, "position">[] = [
  {
    id: "agent_mira",
    workspaceId: DEMO_WORKSPACE.id,
    providerConnectionId: "conn_claude_ops",
    name: "Mira",
    role: "manager",
    model: "Claude",
    provider: "anthropic",
    status: "thinking",
    currentTask: "Coordinating launch checklist",
    currentTool: "task_router",
    zone: "planning",
    progress: 62,
    tokensUsed: 13980,
    costUsd: 0.36,
    lastEventAt: NOW,
  },
  {
    id: "agent_riley",
    workspaceId: DEMO_WORKSPACE.id,
    providerConnectionId: "conn_openai_prod",
    name: "Riley",
    role: "researcher",
    model: "GPT-4.1",
    provider: "openai",
    status: "using_tool",
    currentTask: "Reading competitor docs",
    currentTool: "web_search",
    zone: "research",
    progress: 48,
    tokensUsed: 7280,
    costUsd: 0.12,
    lastEventAt: NOW,
  },
  {
    id: "agent_nova",
    workspaceId: DEMO_WORKSPACE.id,
    providerConnectionId: "conn_claude_ops",
    name: "Nova",
    role: "researcher",
    model: "Claude",
    provider: "anthropic",
    status: "thinking",
    currentTask: "Summarizing onboarding examples",
    currentTool: "notes",
    zone: "research",
    progress: 71,
    tokensUsed: 6420,
    costUsd: 0.1,
    lastEventAt: NOW,
  },
  {
    id: "agent_mina",
    workspaceId: DEMO_WORKSPACE.id,
    providerConnectionId: "conn_claude_ops",
    name: "Mina",
    role: "researcher",
    model: "Claude",
    provider: "anthropic",
    status: "using_tool",
    currentTask: "Checking API references",
    currentTool: "docs_lookup",
    zone: "research",
    progress: 39,
    tokensUsed: 5110,
    costUsd: 0.08,
    lastEventAt: NOW,
  },
  {
    id: "agent_kai",
    workspaceId: DEMO_WORKSPACE.id,
    providerConnectionId: "conn_claude_ops",
    name: "Kai",
    role: "coder",
    model: "Claude",
    provider: "anthropic",
    status: "coding",
    currentTask: "Editing DashboardShell.tsx",
    currentTool: "file_edit",
    zone: "coding",
    progress: 56,
    tokensUsed: 19300,
    costUsd: 0.52,
    lastEventAt: NOW,
  },
  {
    id: "agent_alex",
    workspaceId: DEMO_WORKSPACE.id,
    providerConnectionId: "conn_openai_prod",
    name: "Alex",
    role: "coder",
    model: "GPT-4.1",
    provider: "openai",
    status: "coding",
    currentTask: "Fixing OAuth callback",
    currentTool: "file_edit",
    zone: "coding",
    progress: 83,
    tokensUsed: 15140,
    costUsd: 0.24,
    lastEventAt: NOW,
  },
  {
    id: "agent_theo",
    workspaceId: DEMO_WORKSPACE.id,
    providerConnectionId: "conn_claude_ops",
    name: "Theo",
    role: "coder",
    model: "Claude",
    provider: "anthropic",
    status: "using_tool",
    currentTask: "Running tests",
    currentTool: "test_runner",
    zone: "coding",
    progress: 46,
    tokensUsed: 10180,
    costUsd: 0.19,
    lastEventAt: NOW,
  },
  {
    id: "agent_jules",
    workspaceId: DEMO_WORKSPACE.id,
    providerConnectionId: "conn_claude_ops",
    name: "Jules",
    role: "coder",
    model: "Claude",
    provider: "anthropic",
    status: "coding",
    currentTask: "Refactoring agent state store",
    currentTool: "file_edit",
    zone: "coding",
    progress: 33,
    tokensUsed: 8120,
    costUsd: 0.15,
    lastEventAt: NOW,
  },
  {
    id: "agent_ren",
    workspaceId: DEMO_WORKSPACE.id,
    providerConnectionId: "conn_webhook_custom",
    name: "Ren",
    role: "coder",
    model: "Custom",
    provider: "custom",
    status: "coding",
    currentTask: "Creating webhook route",
    currentTool: "file_edit",
    zone: "coding",
    progress: 42,
    tokensUsed: 7340,
    costUsd: 0.12,
    lastEventAt: NOW,
  },
  {
    id: "agent_quinn",
    workspaceId: DEMO_WORKSPACE.id,
    providerConnectionId: "conn_openai_prod",
    name: "Quinn",
    role: "reviewer",
    model: "GPT-4.1",
    provider: "openai",
    status: "reviewing",
    currentTask: "Reviewing pull request",
    currentTool: "code_review",
    zone: "review",
    progress: 61,
    tokensUsed: 11820,
    costUsd: 0.18,
    lastEventAt: NOW,
  },
  {
    id: "agent_sana",
    workspaceId: DEMO_WORKSPACE.id,
    providerConnectionId: "conn_claude_ops",
    name: "Sana",
    role: "reviewer",
    model: "Claude",
    provider: "anthropic",
    status: "reviewing",
    currentTask: "Checking accessibility",
    currentTool: "a11y_scan",
    zone: "review",
    progress: 89,
    tokensUsed: 5670,
    costUsd: 0.09,
    lastEventAt: NOW,
  },
  {
    id: "agent_omar",
    workspaceId: DEMO_WORKSPACE.id,
    providerConnectionId: "conn_openai_prod",
    name: "Omar",
    role: "reviewer",
    model: "GPT-4.1",
    provider: "openai",
    status: "blocked",
    currentTask: "Testing error states",
    currentTool: "runtime_check",
    zone: "incident",
    progress: 21,
    tokensUsed: 4210,
    costUsd: 0.07,
    lastEventAt: NOW,
  },
  {
    id: "agent_dev",
    workspaceId: DEMO_WORKSPACE.id,
    providerConnectionId: "conn_vercel_veyn",
    name: "Dev",
    role: "deployment",
    model: "Custom",
    provider: "vercel",
    status: "using_tool",
    currentTask: "Watching Vercel build",
    currentTool: "deploy_monitor",
    zone: "deployment",
    progress: 74,
    tokensUsed: 3520,
    costUsd: 0.05,
    lastEventAt: NOW,
  },
  {
    id: "agent_ilya",
    workspaceId: DEMO_WORKSPACE.id,
    providerConnectionId: "conn_vercel_veyn",
    name: "Ilya",
    role: "deployment",
    model: "Custom",
    provider: "vercel",
    status: "idle",
    currentTask: "Checking environment variables",
    currentTool: "env_audit",
    zone: "deployment",
    progress: 100,
    tokensUsed: 2480,
    costUsd: 0.04,
    lastEventAt: NOW,
  },
  {
    id: "agent_echo",
    workspaceId: DEMO_WORKSPACE.id,
    providerConnectionId: "conn_webhook_custom",
    name: "Echo",
    role: "support",
    model: "Custom",
    provider: "custom",
    status: "thinking",
    currentTask: "Classifying user feedback",
    currentTool: "feedback_classifier",
    zone: "lounge",
    progress: 58,
    tokensUsed: 5090,
    costUsd: 0.06,
    lastEventAt: NOW,
  },
];

function withSpawnPoints(input: Omit<Agent, "position">[]): Agent[] {
  const zoneCursors: Record<AgentZone, number> = {
    planning: 0,
    research: 0,
    coding: 0,
    review: 0,
    deployment: 0,
    lounge: 0,
    incident: 0,
  };

  return input.map((agent) => {
    const points = ROOM_POINTS[agent.zone];
    const idx = zoneCursors[agent.zone] % points.length;
    zoneCursors[agent.zone] += 1;
    const [x, y, z] = points[idx];

    const clusterOffset = Math.floor(zoneCursors[agent.zone] / points.length) * 0.35;
    return {
      ...agent,
      position: {
        x: x + (idx % 2 === 0 ? clusterOffset : -clusterOffset),
        y,
        z: z + (idx % 2 === 0 ? -clusterOffset : clusterOffset),
      },
    };
  });
}

export const DEMO_AGENTS: Agent[] = withSpawnPoints(BASE_AGENTS);

const EVENT_TEMPLATES: Record<AgentRole, string[]> = {
  manager: [
    "Coordinating launch checklist",
    "Rebalancing work across coding and review",
    "Escalating incident flow for approval",
  ],
  researcher: [
    "Collecting provider docs",
    "Summarizing onboarding examples",
    "Comparing API behavior",
  ],
  coder: [
    "Applying patch to app shell",
    "Updating webhook route",
    "Running unit tests",
  ],
  reviewer: [
    "Reviewing pull request",
    "Checking accessibility and empty states",
    "Validating timeline replay behavior",
  ],
  deployment: [
    "Watching deploy logs",
    "Checking runtime env drift",
    "Validating build output",
  ],
  analyst: [
    "Aggregating usage metrics",
    "Comparing blocked time by role",
    "Tracing failure causes",
  ],
  support: [
    "Classifying user feedback",
    "Tagging issue severity",
    "Routing high-priority incidents",
  ],
  custom: [
    "Processing custom events",
    "Normalizing payloads",
    "Forwarding metadata",
  ],
};

const EVENT_TYPES_BY_STATUS: Record<AgentStatus, AgentEventType> = {
  idle: "agent.thinking",
  thinking: "agent.thinking",
  using_tool: "agent.tool_call.started",
  coding: "agent.file.changed",
  reviewing: "agent.review.started",
  blocked: "agent.blocked",
  done: "agent.completed",
  paused: "agent.paused",
};

export function generateDemoEvents(agentId: string, count = 8): AgentEvent[] {
  const agent = DEMO_AGENTS.find((entry) => entry.id === agentId);
  if (!agent) return [];

  const template = EVENT_TEMPLATES[agent.role] ?? EVENT_TEMPLATES.custom;
  const now = Date.now();

  return Array.from({ length: count }, (_, index) => {
    const reverse = count - index;
    const timestamp = new Date(now - reverse * 21000).toISOString();

    return {
      id: `evt_${agentId}_${reverse}`,
      workspaceId: agent.workspaceId,
      runId: "run_launch_042",
      agentId,
      provider: "demo",
      eventType: EVENT_TYPES_BY_STATUS[agent.status],
      title: reverse % 2 === 0 ? "State update" : "Tool execution",
      message: template[reverse % template.length],
      task: agent.currentTask,
      tool: agent.currentTool,
      inputSummary: reverse % 3 === 0 ? "Input payload validated" : undefined,
      outputSummary: reverse % 4 === 0 ? "Output attached to run timeline" : undefined,
      metadata: {
        zone: agent.zone,
        progress: agent.progress,
      },
      timestamp,
    };
  });
}

export const DEMO_TASKS: Task[] = [
  {
    id: "task_001",
    workspaceId: DEMO_WORKSPACE.id,
    title: "Fix OAuth callback flow",
    description: "Handle missing state param and callback retries.",
    status: "in_progress",
    assignedAgentIds: ["agent_alex", "agent_kai"],
    priority: "high",
    createdAt: "2026-05-23T08:20:00Z",
    updatedAt: "2026-05-23T11:52:00Z",
  },
  {
    id: "task_002",
    workspaceId: DEMO_WORKSPACE.id,
    title: "Rewrite dashboard layout",
    description: "Unify shell spacing and route tabs.",
    status: "review",
    assignedAgentIds: ["agent_quinn", "agent_sana"],
    priority: "medium",
    createdAt: "2026-05-23T07:55:00Z",
    updatedAt: "2026-05-23T11:41:00Z",
  },
  {
    id: "task_003",
    workspaceId: DEMO_WORKSPACE.id,
    title: "Custom webhook ingest hardening",
    description: "Validate signatures and normalize payload fields.",
    status: "assigned",
    assignedAgentIds: ["agent_ren"],
    priority: "high",
    createdAt: "2026-05-23T09:02:00Z",
    updatedAt: "2026-05-23T11:13:00Z",
  },
  {
    id: "task_004",
    workspaceId: DEMO_WORKSPACE.id,
    title: "Deployment smoke test",
    description: "Validate production route map and environment variables.",
    status: "blocked",
    assignedAgentIds: ["agent_dev", "agent_ilya", "agent_omar"],
    priority: "urgent",
    createdAt: "2026-05-23T10:12:00Z",
    updatedAt: "2026-05-23T11:56:00Z",
  },
  {
    id: "task_005",
    workspaceId: DEMO_WORKSPACE.id,
    title: "Competitor docs summary",
    description: "Extract observability UX patterns from peer tooling.",
    status: "in_progress",
    assignedAgentIds: ["agent_riley", "agent_nova", "agent_mina"],
    priority: "low",
    createdAt: "2026-05-23T06:50:00Z",
    updatedAt: "2026-05-23T11:07:00Z",
  },
  {
    id: "task_006",
    workspaceId: DEMO_WORKSPACE.id,
    title: "Support feedback triage",
    description: "Group incoming product feedback by severity.",
    status: "queued",
    assignedAgentIds: ["agent_echo"],
    priority: "medium",
    createdAt: "2026-05-23T11:24:00Z",
    updatedAt: "2026-05-23T11:24:00Z",
  },
  {
    id: "task_007",
    workspaceId: DEMO_WORKSPACE.id,
    title: "Accessibility QA pass",
    description: "Review keyboard navigation and contrast.",
    status: "done",
    assignedAgentIds: ["agent_sana"],
    priority: "medium",
    createdAt: "2026-05-23T05:40:00Z",
    updatedAt: "2026-05-23T09:18:00Z",
  },
];

export const DEMO_RUNS: Run[] = [
  {
    id: "run_launch_042",
    workspaceId: DEMO_WORKSPACE.id,
    title: "Launch checklist run",
    status: "running",
    startedAt: "2026-05-23T08:12:00Z",
    totalCostUsd: 2.31,
    totalTokens: 141240,
    provider: "demo",
  },
  {
    id: "run_launch_041",
    workspaceId: DEMO_WORKSPACE.id,
    title: "Preflight replay",
    status: "completed",
    startedAt: "2026-05-23T05:45:00Z",
    endedAt: "2026-05-23T06:36:00Z",
    totalCostUsd: 1.62,
    totalTokens: 98540,
    provider: "demo",
  },
  {
    id: "run_launch_040",
    workspaceId: DEMO_WORKSPACE.id,
    title: "Incident drill",
    status: "failed",
    startedAt: "2026-05-22T19:40:00Z",
    endedAt: "2026-05-22T20:22:00Z",
    totalCostUsd: 1.12,
    totalTokens: 64022,
    provider: "demo",
  },
];

export const DEMO_RUN = DEMO_RUNS[0];

export function buildEventStream(limit = 120): AgentEvent[] {
  const events = DEMO_AGENTS.flatMap((agent) => generateDemoEvents(agent.id, 10));
  return events
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
}

export function getZoneForStatus(status: AgentStatus): AgentZone {
  if (status === "blocked") return "incident";
  if (status === "done") return "lounge";
  if (status === "reviewing") return "review";
  if (status === "coding" || status === "using_tool") return "coding";
  return "planning";
}
