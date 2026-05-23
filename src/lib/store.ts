import { create } from "zustand";
import {
  DEMO_AGENTS,
  DEMO_CONNECTIONS,
  DEMO_RUN,
  DEMO_RUNS,
  DEMO_TASKS,
  DEMO_WORKSPACE,
  buildEventStream,
} from "./demo-data";
import type {
  Agent,
  AgentEvent,
  AgentRole,
  AgentStatus,
  AgentZone,
  ProviderConnection,
  Run,
  Task,
  Workspace,
} from "./types";

interface RoomSettings {
  showLabels: boolean;
  showZones: boolean;
  showTrails: boolean;
  cameraMode: "orbit" | "topdown" | "follow";
  followAgentId?: string;
}

interface AgentFilters {
  status?: AgentStatus;
  role?: AgentRole;
  model?: string;
  provider?: string;
  search?: string;
}

interface TimelineFilters {
  agentId?: string;
  status?: AgentStatus;
  tool?: string;
  provider?: string;
  errorsOnly?: boolean;
}

interface RoomStore {
  workspace: Workspace;
  providerConnections: ProviderConnection[];
  runs: Run[];

  agents: Agent[];
  setAgents: (agents: Agent[]) => void;
  updateAgent: (id: string, updates: Partial<Agent>) => void;
  addAgent: (agent: Agent) => void;
  pauseAgent: (id: string) => void;
  resumeAgent: (id: string) => void;
  assignTaskToAgent: (id: string, task: string) => void;

  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  addTask: (task: Task) => void;

  selectedAgentId: string | null;
  setSelectedAgentId: (id: string | null) => void;

  selectedZone: AgentZone | null;
  setSelectedZone: (zone: AgentZone | null) => void;

  liveMode: boolean;
  replayMode: boolean;
  setLiveMode: (liveMode: boolean) => void;
  setReplayMode: (replayMode: boolean) => void;

  timelineCursor: number;
  setTimelineCursor: (timelineCursor: number) => void;

  roomSettings: RoomSettings;
  updateRoomSettings: (updates: Partial<RoomSettings>) => void;

  agentFilters: AgentFilters;
  setAgentFilters: (filters: AgentFilters) => void;

  timelineFilters: TimelineFilters;
  setTimelineFilters: (filters: TimelineFilters) => void;

  events: AgentEvent[];
  addEvent: (event: AgentEvent) => void;
  setEvents: (events: AgentEvent[]) => void;

  currentRun: Run | null;
  setCurrentRun: (run: Run | null) => void;

  isDemoMode: boolean;
  setDemoMode: (enabled: boolean) => void;

  commandMenuOpen: boolean;
  setCommandMenuOpen: (open: boolean) => void;

  leftSidebarOpen: boolean;
  rightSidebarOpen: boolean;
  setLeftSidebarOpen: (open: boolean) => void;
  setRightSidebarOpen: (open: boolean) => void;

  spawnTeam: () => void;
}

function nowIso() {
  return new Date().toISOString();
}

function statusEventType(status: AgentStatus): AgentEvent["eventType"] {
  if (status === "blocked") return "agent.blocked";
  if (status === "paused") return "agent.paused";
  if (status === "done") return "agent.completed";
  if (status === "coding") return "agent.file.changed";
  if (status === "using_tool") return "agent.tool_call.started";
  if (status === "reviewing") return "agent.review.started";
  return "agent.thinking";
}

export const useRoomStore = create<RoomStore>((set, get) => ({
  workspace: DEMO_WORKSPACE,
  providerConnections: DEMO_CONNECTIONS,
  runs: DEMO_RUNS,

  agents: DEMO_AGENTS,
  setAgents: (agents) => set({ agents }),
  updateAgent: (id, updates) =>
    set((state) => ({
      agents: state.agents.map((agent) =>
        agent.id === id ? { ...agent, ...updates, lastEventAt: updates.lastEventAt ?? nowIso() } : agent
      ),
    })),
  addAgent: (agent) => set((state) => ({ agents: [agent, ...state.agents] })),
  pauseAgent: (id) => {
    const state = get();
    const agent = state.agents.find((entry) => entry.id === id);
    if (!agent) return;
    const timestamp = nowIso();

    set({
      agents: state.agents.map((entry) =>
        entry.id === id ? { ...entry, status: "paused", lastEventAt: timestamp } : entry
      ),
      events: [
        {
          id: `evt_pause_${Date.now()}`,
          workspaceId: state.workspace.id,
          runId: state.currentRun?.id ?? "run_manual",
          agentId: id,
          provider: "demo" as const,
          eventType: "agent.paused" as const,
          title: `${agent.name} paused`,
          message: "Paused from room controls",
          task: agent.currentTask,
          tool: agent.currentTool,
          timestamp,
        },
        ...state.events,
      ].slice(0, 320),
    });
  },
  resumeAgent: (id) => {
    const state = get();
    const agent = state.agents.find((entry) => entry.id === id);
    if (!agent) return;
    const timestamp = nowIso();
    const nextStatus: AgentStatus = agent.status === "paused" ? "thinking" : agent.status;

    set({
      agents: state.agents.map((entry) =>
        entry.id === id ? { ...entry, status: nextStatus, lastEventAt: timestamp } : entry
      ),
      events: [
        {
          id: `evt_resume_${Date.now()}`,
          workspaceId: state.workspace.id,
          runId: state.currentRun?.id ?? "run_manual",
          agentId: id,
          provider: "demo" as const,
          eventType: "agent.resumed" as const,
          title: `${agent.name} resumed`,
          message: "Resumed from room controls",
          task: agent.currentTask,
          tool: agent.currentTool,
          timestamp,
        },
        ...state.events,
      ].slice(0, 320),
    });
  },
  assignTaskToAgent: (id, task) => {
    const state = get();
    const agent = state.agents.find((entry) => entry.id === id);
    if (!agent) return;

    const timestamp = nowIso();
    const nextStatus: AgentStatus = "thinking";

    set({
      agents: state.agents.map((entry) =>
        entry.id === id
          ? {
              ...entry,
              status: nextStatus,
              currentTask: task,
              progress: Math.min(100, Math.max(5, entry.progress - 15)),
              lastEventAt: timestamp,
            }
          : entry
      ),
      events: [
        {
          id: `evt_assign_${Date.now()}`,
          workspaceId: state.workspace.id,
          runId: state.currentRun?.id ?? "run_manual",
          agentId: id,
          provider: "demo" as const,
          eventType: "agent.started" as const,
          title: `${agent.name} assigned work`,
          message: task,
          task,
          timestamp,
        },
        ...state.events,
      ].slice(0, 320),
    });
  },

  tasks: DEMO_TASKS,
  setTasks: (tasks) => set({ tasks }),
  updateTask: (id, updates) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id
          ? {
              ...task,
              ...updates,
              updatedAt: nowIso(),
            }
          : task
      ),
    })),
  addTask: (task) => set((state) => ({ tasks: [task, ...state.tasks] })),

  selectedAgentId: null,
  setSelectedAgentId: (selectedAgentId) => set({ selectedAgentId }),

  selectedZone: null,
  setSelectedZone: (selectedZone) => set({ selectedZone }),

  liveMode: true,
  replayMode: false,
  setLiveMode: (liveMode) => set({ liveMode }),
  setReplayMode: (replayMode) => set({ replayMode }),

  timelineCursor: Date.now(),
  setTimelineCursor: (timelineCursor) => set({ timelineCursor }),

  roomSettings: {
    showLabels: true,
    showZones: true,
    showTrails: true,
    cameraMode: "orbit",
  },
  updateRoomSettings: (updates) =>
    set((state) => ({
      roomSettings: {
        ...state.roomSettings,
        ...updates,
      },
    })),

  agentFilters: {},
  setAgentFilters: (agentFilters) => set({ agentFilters }),

  timelineFilters: {},
  setTimelineFilters: (timelineFilters) => set({ timelineFilters }),

  events: buildEventStream(180),
  addEvent: (event) => set((state) => ({ events: [event, ...state.events].slice(0, 500) })),
  setEvents: (events) => set({ events }),

  currentRun: DEMO_RUN,
  setCurrentRun: (currentRun) => set({ currentRun }),

  isDemoMode: true,
  setDemoMode: (isDemoMode) => set({ isDemoMode }),

  commandMenuOpen: false,
  setCommandMenuOpen: (commandMenuOpen) => set({ commandMenuOpen }),

  leftSidebarOpen: false,
  rightSidebarOpen: false,
  setLeftSidebarOpen: (leftSidebarOpen) => set({ leftSidebarOpen }),
  setRightSidebarOpen: (rightSidebarOpen) => set({ rightSidebarOpen }),

  spawnTeam: () => {
    const state = get();
    const timestamp = nowIso();

    const generated: Agent[] = [
      {
        id: `agent_spawn_${Date.now()}_1`,
        workspaceId: state.workspace.id,
        name: "Iris",
        role: "researcher",
        model: "GPT-5",
        provider: "openai",
        status: "thinking",
        currentTask: "Mapping provider behavior",
        currentTool: "web_search",
        zone: "research",
        progress: 14,
        tokensUsed: 980,
        costUsd: 0.02,
        lastEventAt: timestamp,
        position: { x: -4.8, y: 0, z: -2.1 },
      },
      {
        id: `agent_spawn_${Date.now()}_2`,
        workspaceId: state.workspace.id,
        name: "Pax",
        role: "coder",
        model: "Claude",
        provider: "anthropic",
        status: "coding",
        currentTask: "Building retry guardrail",
        currentTool: "file_edit",
        zone: "coding",
        progress: 22,
        tokensUsed: 1210,
        costUsd: 0.03,
        lastEventAt: timestamp,
        position: { x: 1.5, y: 0, z: 1.5 },
      },
      {
        id: `agent_spawn_${Date.now()}_3`,
        workspaceId: state.workspace.id,
        name: "Niko",
        role: "deployment",
        model: "Custom",
        provider: "vercel",
        status: "using_tool",
        currentTask: "Running deployment health check",
        currentTool: "deploy_monitor",
        zone: "deployment",
        progress: 31,
        tokensUsed: 760,
        costUsd: 0.01,
        lastEventAt: timestamp,
        position: { x: 4.4, y: 0, z: -1.7 },
      },
    ];

    set({
      agents: [...generated, ...state.agents],
      events: [
        ...generated.map((agent) => ({
          id: `evt_spawn_${agent.id}`,
          workspaceId: state.workspace.id,
          runId: state.currentRun?.id ?? "run_manual",
          agentId: agent.id,
          provider: "demo" as const,
          eventType: "agent.created" as const,
          title: `${agent.name} spawned`,
          message: `Spawned ${agent.role} in ${agent.zone}`,
          task: agent.currentTask,
          tool: agent.currentTool,
          timestamp,
        })),
        ...state.events,
      ].slice(0, 500),
    });
  },
}));

export function applyReplaySnapshot(cursorTime: number) {
  const state = useRoomStore.getState();
  const cursor = new Date(cursorTime).getTime();
  const byAgent = new Map<string, AgentEvent>();

  for (const event of state.events) {
    const eventTime = new Date(event.timestamp).getTime();
    if (eventTime > cursor) continue;

    const existing = byAgent.get(event.agentId);
    if (!existing || new Date(existing.timestamp).getTime() < eventTime) {
      byAgent.set(event.agentId, event);
    }
  }

  if (byAgent.size === 0) return;

  useRoomStore.setState({
    agents: state.agents.map((agent) => {
      const event = byAgent.get(agent.id);
      if (!event) return agent;

      return {
        ...agent,
        status:
          event.eventType === "agent.blocked"
            ? "blocked"
            : event.eventType === "agent.paused"
            ? "paused"
            : event.eventType === "agent.completed"
            ? "done"
            : event.eventType === "agent.review.started"
            ? "reviewing"
            : event.eventType === "agent.file.changed"
            ? "coding"
            : event.eventType === "agent.tool_call.started"
            ? "using_tool"
            : "thinking",
        currentTask: event.task ?? agent.currentTask,
        currentTool: event.tool ?? agent.currentTool,
        lastEventAt: event.timestamp,
      };
    }),
  });
}

export function createAgentEventFromStatus(agent: Agent, status: AgentStatus): AgentEvent {
  return {
    id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    workspaceId: agent.workspaceId,
    runId: "run_launch_042",
    agentId: agent.id,
    provider: "demo",
    eventType: statusEventType(status),
    title: `${agent.name} ${status.replaceAll("_", " ")}`,
    message: agent.currentTask,
    task: agent.currentTask,
    tool: agent.currentTool,
    metadata: {
      zone: agent.zone,
      progress: agent.progress,
    },
    timestamp: nowIso(),
  };
}
