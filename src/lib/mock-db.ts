import {
  DEMO_AGENTS,
  DEMO_CONNECTIONS,
  DEMO_RUNS,
  DEMO_TASKS,
  DEMO_WORKSPACE,
  buildEventStream,
  getZoneForStatus,
} from "./demo-data";
import type { Agent, AgentEvent, ProviderConnection, Run, Task } from "./types";

const state: {
  workspaceId: string;
  providerConnections: ProviderConnection[];
  agents: Agent[];
  tasks: Task[];
  runs: Run[];
  events: AgentEvent[];
  webhookSecrets: Record<string, string>;
  connectionSecrets: Record<string, string>;
} = {
  workspaceId: DEMO_WORKSPACE.id,
  providerConnections: [...DEMO_CONNECTIONS],
  agents: [...DEMO_AGENTS],
  tasks: [...DEMO_TASKS],
  runs: [...DEMO_RUNS],
  events: buildEventStream(200),
  webhookSecrets: {
    [`${DEMO_WORKSPACE.id}:wh_demo`]: "whsec_demo_2f8cf7c1",
  },
  connectionSecrets: {},
};

export const mockDb = {
  getConnections: () => state.providerConnections,
  addConnection: (connection: ProviderConnection, secret?: string) => {
    state.providerConnections = [connection, ...state.providerConnections];
    if (secret) {
      state.connectionSecrets[connection.id] = secret;
    }
    return connection;
  },
  updateConnection: (connectionId: string, updates: Partial<ProviderConnection>) => {
    const existing = state.providerConnections.find((c) => c.id === connectionId);
    if (!existing) return null;
    const updated = { ...existing, ...updates };
    state.providerConnections = state.providerConnections.map((c) =>
      c.id === connectionId ? updated : c
    );
    return updated;
  },
  getConnectionSecret: (connectionId: string) => state.connectionSecrets[connectionId] ?? null,
  deleteConnection: (connectionId: string) => {
    state.providerConnections = state.providerConnections.filter((connection) => connection.id !== connectionId);
    delete state.connectionSecrets[connectionId];
  },

  getAgents: () => state.agents,
  getAgent: (agentId: string) => state.agents.find((agent) => agent.id === agentId) ?? null,
  addAgent: (agent: Agent) => {
    state.agents = [agent, ...state.agents];
    return agent;
  },
  updateAgent: (agentId: string, updates: Partial<Agent>) => {
    const existing = state.agents.find((agent) => agent.id === agentId);
    if (!existing) return null;

    const nextStatus = updates.status ?? existing.status;
    const nextZone = updates.zone ?? (updates.status ? getZoneForStatus(nextStatus) : existing.zone);

    const updated: Agent = {
      ...existing,
      ...updates,
      status: nextStatus,
      zone: nextZone,
      lastEventAt: new Date().toISOString(),
    };

    state.agents = state.agents.map((agent) => (agent.id === agentId ? updated : agent));
    return updated;
  },

  getTasks: () => state.tasks,
  addTask: (task: Task) => {
    state.tasks = [task, ...state.tasks];
    return task;
  },
  updateTask: (taskId: string, updates: Partial<Task>) => {
    const existing = state.tasks.find((task) => task.id === taskId);
    if (!existing) return null;

    const updated: Task = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    state.tasks = state.tasks.map((task) => (task.id === taskId ? updated : task));
    return updated;
  },

  getRuns: () => state.runs,

  getEvents: () => state.events,
  addEvent: (event: AgentEvent) => {
    state.events = [event, ...state.events].slice(0, 1000);
    return event;
  },

  getWebhookSecret: (workspaceId: string, webhookId: string) => state.webhookSecrets[`${workspaceId}:${webhookId}`] ?? "",
};
