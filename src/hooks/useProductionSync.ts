"use client";

import { useEffect } from "react";
import { useRoomStore } from "@/lib/store";
import type { Agent, AgentEvent, ProviderConnection, Run, Task } from "@/lib/types";

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export function useProductionSync() {
  const {
    isDemoMode,
    setAgents,
    setTasks,
    setRuns,
    setEvents,
    setProviderConnections,
  } = useRoomStore();

  useEffect(() => {
    if (isDemoMode) return;

    let active = true;

    const sync = async () => {
      const [agentsRes, tasksRes, runsRes, eventsRes, connectionsRes] = await Promise.all([
        fetchJson<{ agents: Agent[] }>("/api/agents"),
        fetchJson<{ tasks: Task[] }>("/api/tasks"),
        fetchJson<{ runs: Run[] }>("/api/runs"),
        fetchJson<{ events: AgentEvent[] }>("/api/events"),
        fetchJson<{ connections: ProviderConnection[] }>("/api/provider-connections"),
      ]);

      if (!active) return;

      if (agentsRes?.agents) setAgents(agentsRes.agents);
      if (tasksRes?.tasks) setTasks(tasksRes.tasks);
      if (runsRes?.runs) setRuns(runsRes.runs);
      if (eventsRes?.events) setEvents(eventsRes.events);
      if (connectionsRes?.connections) setProviderConnections(connectionsRes.connections);
    };

    void sync();
    const timer = window.setInterval(sync, 4000);

    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [isDemoMode, setAgents, setEvents, setProviderConnections, setRuns, setTasks]);
}
