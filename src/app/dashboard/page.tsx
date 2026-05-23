"use client";

import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useRoomStore } from "@/lib/store";
import { formatCost, formatTokens, timeAgo } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { workspace, agents, providerConnections, currentRun, events } = useRoomStore();

  const activeAgents = agents.filter((agent) => !["idle", "done", "paused"].includes(agent.status)).length;
  const blockedAgents = agents.filter((agent) => agent.status === "blocked").length;
  const costToday = agents.reduce((sum, agent) => sum + agent.costUsd, 0);
  const tokensToday = agents.reduce((sum, agent) => sum + agent.tokensUsed, 0);
  const connectedProviders = providerConnections.filter((connection) => connection.status === "connected").length;

  return (
    <AppShell>
      <div className="h-full overflow-auto p-4 sm:p-6">
        <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-white">{workspace.name}</h1>
            <p className="text-sm text-slate-300">Calm operational overview for current workspace activity.</p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" className="border-white/20 bg-white/[0.03]">
              <Link href="/room">Open room</Link>
            </Button>
            <Button asChild>
              <Link href="/app/integrations">Connect provider</Link>
            </Button>
          </div>
        </header>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["Active agents", String(activeAgents)],
            ["Current runs", currentRun ? "1" : "0"],
            ["Blocked agents", String(blockedAgents)],
            ["Provider connections", `${connectedProviders}/${providerConnections.length}`],
            ["Cost today", formatCost(costToday)],
            ["Tokens today", formatTokens(tokensToday)],
          ].map(([label, value]) => (
            <article key={label} className="surface-panel rounded-xl p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
              <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
            </article>
          ))}
        </section>

        <section className="mt-5 grid gap-4 lg:grid-cols-2">
          <article className="surface-panel rounded-xl p-4">
            <h2 className="text-lg font-semibold text-white">Latest events</h2>
            <div className="mt-3 space-y-2">
              {events.slice(0, 10).map((event) => {
                const agent = agents.find((entry) => entry.id === event.agentId);
                return (
                  <div key={event.id} className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2">
                    <p className="text-sm text-white">{event.title}</p>
                    <p className="text-xs text-slate-300">{agent?.name ?? event.agentId} · {event.eventType}</p>
                    <p className="text-xs text-slate-500">{timeAgo(event.timestamp)}</p>
                  </div>
                );
              })}
            </div>
          </article>

          <article className="surface-panel rounded-xl p-4">
            <h2 className="text-lg font-semibold text-white">Recent runs</h2>
            <div className="mt-3 space-y-2">
              <div className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2">
                <p className="text-sm text-white">{currentRun?.title ?? "No active runs"}</p>
                <p className="text-xs text-slate-300">Status: {currentRun?.status ?? "idle"}</p>
                <p className="text-xs text-slate-500">Cost: {formatCost(currentRun?.totalCostUsd ?? 0)} · Tokens: {formatTokens(currentRun?.totalTokens ?? 0)}</p>
              </div>
            </div>
          </article>
        </section>
      </div>
    </AppShell>
  );
}
