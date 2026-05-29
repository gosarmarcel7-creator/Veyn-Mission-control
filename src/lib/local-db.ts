import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { getZoneForStatus } from "./demo-data";
import type { Agent, AgentEvent, ProviderConnection, Run, Task } from "./types";
import { WORKSPACE_ID } from "./env";

export interface LocalDbState {
  workspaceId: string;
  providerConnections: ProviderConnection[];
  agents: Agent[];
  tasks: Task[];
  runs: Run[];
  events: AgentEvent[];
  webhookSecrets: Record<string, string>;
  connectionSecrets: Record<string, string>;
}

function defaultState(): LocalDbState {
  const workspaceId = WORKSPACE_ID;
  return {
    workspaceId,
    providerConnections: [],
    agents: [],
    tasks: [],
    runs: [
      {
        id: "run_initial",
        workspaceId,
        title: "Initial run",
        status: "running",
        startedAt: new Date().toISOString(),
        totalCostUsd: 0,
        totalTokens: 0,
        provider: "custom_webhook",
      },
    ],
    events: [],
    webhookSecrets: {
      [`${workspaceId}:wh_prod`]: "whsec_demo_2f8cf7c1",
      [`${workspaceId}:wh_demo`]: "whsec_demo_2f8cf7c1",
    },
    connectionSecrets: {},
  };
}

function resolveDataPath() {
  if (process.env.VEYN_DATA_DIR) return join(process.env.VEYN_DATA_DIR, "veyn.json");
  return join(process.cwd(), ".veyn-data", "veyn.json");
}

let state: LocalDbState | null = null;
let dataPath: string | null = null;

function persist() {
  if (!state || !dataPath) return;
  mkdirSync(dirname(dataPath), { recursive: true });
  writeFileSync(dataPath, JSON.stringify(state, null, 2), "utf8");
}

function load() {
  dataPath = resolveDataPath();
  if (existsSync(dataPath)) {
    try {
      state = JSON.parse(readFileSync(dataPath, "utf8")) as LocalDbState;
      return;
    } catch {
      state = defaultState();
      persist();
      return;
    }
  }
  state = defaultState();
  persist();
}

function ensureLoaded() {
  if (!state) load();
}

export const localDb = {
  isEnabled: () => process.env.VEYN_DESKTOP === "1" || process.env.VEYN_LOCAL_DB === "1",

  getState: () => {
    ensureLoaded();
    return state!;
  },

  getConnections: () => {
    ensureLoaded();
    return state!.providerConnections;
  },

  addConnection: (connection: ProviderConnection, secret?: string) => {
    ensureLoaded();
    state!.providerConnections = [connection, ...state!.providerConnections];
    if (secret) state!.connectionSecrets[connection.id] = secret;
    persist();
    return connection;
  },

  updateConnection: (connectionId: string, updates: Partial<ProviderConnection>) => {
    ensureLoaded();
    const existing = state!.providerConnections.find((c) => c.id === connectionId);
    if (!existing) return null;
    const updated = { ...existing, ...updates };
    state!.providerConnections = state!.providerConnections.map((c) =>
      c.id === connectionId ? updated : c
    );
    persist();
    return updated;
  },

  deleteConnection: (connectionId: string) => {
    ensureLoaded();
    state!.providerConnections = state!.providerConnections.filter((c) => c.id !== connectionId);
    delete state!.connectionSecrets[connectionId];
    persist();
  },

  getConnectionSecret: (connectionId: string) => {
    ensureLoaded();
    return state!.connectionSecrets[connectionId] ?? null;
  },

  getAgents: () => {
    ensureLoaded();
    return state!.agents;
  },

  getAgent: (agentId: string) => {
    ensureLoaded();
    return state!.agents.find((a) => a.id === agentId) ?? null;
  },

  addAgent: (agent: Agent) => {
    ensureLoaded();
    state!.agents = [agent, ...state!.agents.filter((a) => a.id !== agent.id)];
    persist();
    return agent;
  },

  updateAgent: (agentId: string, updates: Partial<Agent>) => {
    ensureLoaded();
    const existing = state!.agents.find((a) => a.id === agentId);
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

    state!.agents = state!.agents.map((a) => (a.id === agentId ? updated : a));
    persist();
    return updated;
  },

  getTasks: () => {
    ensureLoaded();
    return state!.tasks;
  },

  addTask: (task: Task) => {
    ensureLoaded();
    state!.tasks = [task, ...state!.tasks];
    persist();
    return task;
  },

  updateTask: (taskId: string, updates: Partial<Task>) => {
    ensureLoaded();
    const existing = state!.tasks.find((t) => t.id === taskId);
    if (!existing) return null;
    const updated: Task = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    state!.tasks = state!.tasks.map((t) => (t.id === taskId ? updated : t));
    persist();
    return updated;
  },

  getRuns: () => {
    ensureLoaded();
    return state!.runs;
  },

  addRun: (run: Run) => {
    ensureLoaded();
    state!.runs = [run, ...state!.runs.filter((r) => r.id !== run.id)];
    persist();
    return run;
  },

  getEvents: () => {
    ensureLoaded();
    return state!.events;
  },

  addEvent: (event: AgentEvent) => {
    ensureLoaded();
    state!.events = [event, ...state!.events].slice(0, 1000);
    persist();
    return event;
  },

  getWebhookSecret: (workspaceId: string, webhookId: string) =>
    state?.webhookSecrets[`${workspaceId}:${webhookId}`] ?? "",
};
