import { NextResponse } from "next/server";
import { dataStore } from "@/lib/data-store";

export async function GET() {
  const [agents, runs, events, providerConnections] = await Promise.all([
    dataStore.listAgents(),
    dataStore.listRuns(),
    dataStore.listEvents(),
    dataStore.listConnections(),
  ]);

  const totalTokens = agents.reduce((sum, agent) => sum + agent.tokensUsed, 0);
  const totalCostUsd = agents.reduce((sum, agent) => sum + agent.costUsd, 0);
  const activeAgents = agents.filter((agent) => !["idle", "done", "paused"].includes(agent.status)).length;
  const blockedTimePct = (agents.filter((agent) => agent.status === "blocked").length / Math.max(1, agents.length)) * 100;
  const failureRatePct = (events.filter((event) => event.eventType.includes("error") || event.eventType.includes("blocked")).length / Math.max(1, events.length)) * 100;
  const providerHealthPct = (providerConnections.filter((connection) => connection.status === "connected").length / Math.max(1, providerConnections.length)) * 100;

  const durations = runs
    .filter((run) => run.endedAt)
    .map((run) => (new Date(run.endedAt as string).getTime() - new Date(run.startedAt).getTime()) / 60000);
  const avgRunDurationMinutes = durations.length ? durations.reduce((sum, value) => sum + value, 0) / durations.length : 0;

  return NextResponse.json({
    totalTokens,
    totalCostUsd,
    runsToday: runs.filter((run) => run.startedAt.startsWith(new Date().toISOString().slice(0, 10))).length,
    activeAgents,
    blockedTimePct,
    failureRatePct,
    avgRunDurationMinutes,
    providerHealthPct,
    utilizationPct: (activeAgents / Math.max(1, agents.length)) * 100,
  });
}
