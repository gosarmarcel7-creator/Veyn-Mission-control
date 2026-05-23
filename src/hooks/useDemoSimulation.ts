"use client";

import { useEffect, useRef } from "react";
import { createAgentEventFromStatus, useRoomStore } from "@/lib/store";
import { ROOM_POINTS } from "@/lib/demo-data";
import type { Agent, AgentStatus, AgentZone } from "@/lib/types";

const STATUS_FLOW: AgentStatus[] = [
  "thinking",
  "using_tool",
  "coding",
  "reviewing",
  "thinking",
  "done",
  "blocked",
];

const ZONE_FLOW: AgentZone[] = ["planning", "research", "coding", "review", "deployment", "lounge", "incident"];

const TASK_POOL = [
  "Editing DashboardShell.tsx",
  "Fixing OAuth callback",
  "Running tests",
  "Refactoring agent state store",
  "Creating webhook route",
  "Reviewing pull request",
  "Checking accessibility",
  "Testing error states",
  "Watching Vercel build",
  "Checking environment variables",
  "Classifying user feedback",
  "Comparing API references",
  "Drafting rollout checklist",
];

const TOOL_POOL = [
  "file_edit",
  "test_runner",
  "web_search",
  "deploy_monitor",
  "a11y_scan",
  "runtime_check",
  "docs_lookup",
  "task_router",
  "code_review",
  "event_router",
];

function randomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function getZonePosition(zone: AgentZone, index = 0) {
  const points = ROOM_POINTS[zone];
  const [x, y, z] = points[index % points.length];
  const jitter = randomBetween(-0.18, 0.18);

  return {
    x: x + jitter,
    y,
    z: z - jitter,
  };
}

function nextStatus(current: AgentStatus): AgentStatus {
  if (Math.random() < 0.08) return "blocked";
  if (Math.random() < 0.05) return "done";
  if (current === "paused") return "thinking";
  return randomItem(STATUS_FLOW);
}

function nextZone(agent: Agent, next: AgentStatus): AgentZone {
  if (next === "blocked") return "incident";
  if (next === "done") return "lounge";

  if (agent.role === "manager") return "planning";
  if (agent.role === "researcher") return "research";
  if (agent.role === "coder") return "coding";
  if (agent.role === "reviewer") return "review";
  if (agent.role === "deployment") return "deployment";
  if (agent.role === "support") return Math.random() > 0.5 ? "lounge" : "planning";

  return randomItem(ZONE_FLOW);
}

export function useDemoSimulation() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const frameRef = useRef(0);

  useEffect(() => {
    const state = useRoomStore.getState();
    if (!state.isDemoMode || !state.liveMode) return;

    const tick = () => {
      const current = useRoomStore.getState();
      if (!current.isDemoMode || !current.liveMode || current.agents.length === 0) {
        timerRef.current = setTimeout(tick, 1800);
        return;
      }

      frameRef.current += 1;
      const agent = randomItem(current.agents);

      if (!agent || agent.status === "paused") {
        timerRef.current = setTimeout(tick, randomBetween(1800, 3300));
        return;
      }

      const next = nextStatus(agent.status);
      const zone = nextZone(agent, next);
      const task = next === "done" ? "Waiting for assignment" : randomItem(TASK_POOL);
      const tool = next === "using_tool" || next === "coding" || next === "reviewing" ? randomItem(TOOL_POOL) : undefined;
      const progressDelta = next === "done" ? randomBetween(16, 28) : randomBetween(-4, 11);
      const progress = Math.max(0, Math.min(100, agent.progress + progressDelta));
      const tokenDelta = Math.floor(randomBetween(120, 920));
      const costDelta = tokenDelta * randomBetween(0.000012, 0.00003);
      const lastEventAt = new Date().toISOString();

      current.updateAgent(agent.id, {
        status: next,
        currentTask: task,
        currentTool: tool,
        zone,
        position: getZonePosition(zone, frameRef.current),
        progress,
        tokensUsed: agent.tokensUsed + tokenDelta,
        costUsd: parseFloat((agent.costUsd + costDelta).toFixed(4)),
        lastEventAt,
      });

      const updatedAgent = {
        ...agent,
        status: next,
        currentTask: task,
        currentTool: tool,
        zone,
        progress,
        tokensUsed: agent.tokensUsed + tokenDelta,
        costUsd: parseFloat((agent.costUsd + costDelta).toFixed(4)),
        lastEventAt,
      };

      current.addEvent(createAgentEventFromStatus(updatedAgent, next));

      if (Math.random() < 0.16) {
        const partner = randomItem(current.agents.filter((entry) => entry.id !== agent.id));
        if (partner) {
          current.addEvent({
            id: `evt_collab_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            workspaceId: current.workspace.id,
            runId: current.currentRun?.id ?? "run_launch_042",
            agentId: partner.id,
            provider: "demo",
            eventType: "agent.started",
            title: `${partner.name} joined ${agent.name}`,
            message: `Collaboration on: ${task}`,
            task,
            tool,
            metadata: {
              collaboration: true,
              partnerAgentId: agent.id,
            },
            timestamp: new Date().toISOString(),
          });
        }
      }

      if (Math.random() < 0.06) {
        const blockedCandidate = randomItem(current.agents.filter((entry) => entry.status !== "blocked"));
        if (blockedCandidate) {
          current.updateAgent(blockedCandidate.id, {
            status: "blocked",
            zone: "incident",
            position: getZonePosition("incident", frameRef.current + 2),
            currentTask: `${blockedCandidate.currentTask ?? "Task"} blocked on external dependency`,
            lastEventAt: new Date().toISOString(),
          });

          current.addEvent({
            id: `evt_blocked_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            workspaceId: current.workspace.id,
            runId: current.currentRun?.id ?? "run_launch_042",
            agentId: blockedCandidate.id,
            provider: "demo",
            eventType: "agent.blocked",
            title: `${blockedCandidate.name} blocked`,
            message: "Waiting on missing credential or deploy signal",
            task: blockedCandidate.currentTask,
            tool: blockedCandidate.currentTool,
            timestamp: new Date().toISOString(),
          });
        }
      }

      timerRef.current = setTimeout(tick, randomBetween(1900, 4200));
    };

    timerRef.current = setTimeout(tick, randomBetween(800, 1800));

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);
}
