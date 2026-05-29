import type { Agent, AgentEvent, ProviderConnection, Run, Task } from "./types";

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export async function fetchProductionSnapshot() {
  const [agentsRes, tasksRes, runsRes, eventsRes, connectionsRes] = await Promise.all([
    fetchJson<{ agents: Agent[] }>("/api/agents"),
    fetchJson<{ tasks: Task[] }>("/api/tasks"),
    fetchJson<{ runs: Run[] }>("/api/runs"),
    fetchJson<{ events: AgentEvent[] }>("/api/events"),
    fetchJson<{ connections: ProviderConnection[] }>("/api/provider-connections"),
  ]);

  return {
    agents: agentsRes?.agents,
    tasks: tasksRes?.tasks,
    runs: runsRes?.runs,
    events: eventsRes?.events,
    connections: connectionsRes?.connections,
  };
}

export async function syncProviderConnection(connectionId: string) {
  const response = await fetch(`/api/provider-connections/${connectionId}/sync`, {
    method: "POST",
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error ?? "Sync failed");
  }
  return payload as { agents?: Agent[]; synced?: number; message?: string };
}
