"use client";

import { AppShell } from "@/components/layout/AppShell";
import { useRoomStore } from "@/lib/store";
import { formatCost, formatTokens } from "@/lib/utils";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const tooltipStyle = {
  contentStyle: {
    background: "#111722",
    border: "1px solid rgba(255,255,255,0.14)",
    borderRadius: 10,
    fontSize: 12,
  },
  labelStyle: { color: "#e5e7eb" },
  itemStyle: { color: "#cbd5e1" },
};

export default function AnalyticsPage() {
  const { agents, events, runs, providerConnections } = useRoomStore();

  const totalTokens = agents.reduce((sum, agent) => sum + agent.tokensUsed, 0);
  const totalCost = agents.reduce((sum, agent) => sum + agent.costUsd, 0);
  const activeAgents = agents.filter((agent) => !["idle", "done", "paused"].includes(agent.status)).length;
  const blockedAgents = agents.filter((agent) => agent.status === "blocked").length;
  const blockedTime = (blockedAgents / Math.max(1, agents.length)) * 100;
  const failures = events.filter((event) => event.eventType.includes("error") || event.eventType.includes("blocked")).length;
  const failureRate = (failures / Math.max(1, events.length)) * 100;
  const runsToday = runs.filter((run) => run.startedAt.startsWith("2026-05-23")).length;

  const runDurations = runs
    .filter((run) => run.endedAt)
    .map((run) => (new Date(run.endedAt as string).getTime() - new Date(run.startedAt).getTime()) / 60000);
  const avgRunDuration = runDurations.length
    ? runDurations.reduce((sum, value) => sum + value, 0) / runDurations.length
    : 0;

  const providerHealth =
    (providerConnections.filter((connection) => connection.status === "connected").length / Math.max(1, providerConnections.length)) * 100;

  const utilization =
    (agents.filter((agent) => ["thinking", "coding", "using_tool", "reviewing"].includes(agent.status)).length /
      Math.max(1, agents.length)) *
    100;

  const costByProvider = Object.entries(
    agents.reduce<Record<string, number>>((acc, agent) => {
      acc[agent.provider] = (acc[agent.provider] ?? 0) + agent.costUsd;
      return acc;
    }, {})
  ).map(([provider, value]) => ({ provider, value: Number(value.toFixed(3)) }));

  const tokensOverTime = Array.from({ length: 12 }, (_, index) => ({
    t: `${String(index + 1).padStart(2, "0")}:00`,
    tokens: Math.round(totalTokens * (0.3 + index / 14) * 0.09),
  }));

  const eventsOverTime = Array.from({ length: 12 }, (_, index) => ({
    t: `${String(index + 1).padStart(2, "0")}:00`,
    events: Math.round(events.length * (0.25 + index / 15) * 0.11),
  }));

  const blockedByAgent = agents
    .map((agent) => ({
      name: agent.name,
      blocked: agent.status === "blocked" ? Math.round(18 + agent.progress / 3) : Math.round(agent.progress / 12),
    }))
    .sort((left, right) => right.blocked - left.blocked)
    .slice(0, 8);

  const utilizationByRole = Object.entries(
    agents.reduce<Record<string, { active: number; total: number }>>((acc, agent) => {
      acc[agent.role] ??= { active: 0, total: 0 };
      acc[agent.role].total += 1;
      if (!["idle", "done", "paused"].includes(agent.status)) acc[agent.role].active += 1;
      return acc;
    }, {})
  ).map(([role, value]) => ({ role, utilization: Math.round((value.active / Math.max(1, value.total)) * 100) }));

  return (
    <AppShell>
      <div className="h-full overflow-auto p-4 sm:p-6">
        <header className="mb-5">
          <h1 className="text-2xl font-semibold text-white">Analytics</h1>
          <p className="text-sm text-slate-300">Usage, cost, failures, and role utilization across current agent operations.</p>
        </header>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {[
            ["Total tokens", formatTokens(totalTokens)],
            ["Total cost", formatCost(totalCost)],
            ["Runs today", String(runsToday)],
            ["Active agents", String(activeAgents)],
            ["Blocked time", `${blockedTime.toFixed(1)}%`],
            ["Failure rate", `${failureRate.toFixed(1)}%`],
            ["Avg run duration", `${avgRunDuration.toFixed(1)}m`],
            ["Provider health", `${providerHealth.toFixed(0)}%`],
            ["Agent utilization", `${utilization.toFixed(0)}%`],
          ].map(([label, value]) => (
            <article key={label} className="surface-panel rounded-xl p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
              <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
            </article>
          ))}
        </section>

        <section className="mt-6 grid gap-4 xl:grid-cols-2">
          <article className="surface-panel rounded-xl p-4">
            <h2 className="mb-3 text-sm font-semibold text-white">Cost by provider</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={costByProvider}>
                <XAxis dataKey="provider" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip {...tooltipStyle} formatter={(value: unknown) => [formatCost(Number(value)), "Cost"]} />
                <Bar dataKey="value" fill="#5fa4ff" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </article>

          <article className="surface-panel rounded-xl p-4">
            <h2 className="mb-3 text-sm font-semibold text-white">Tokens over time</h2>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={tokensOverTime}>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis dataKey="t" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip {...tooltipStyle} formatter={(value: unknown) => [formatTokens(Number(value)), "Tokens"]} />
                <Area dataKey="tokens" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.2} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </article>

          <article className="surface-panel rounded-xl p-4">
            <h2 className="mb-3 text-sm font-semibold text-white">Events over time</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={eventsOverTime}>
                <XAxis dataKey="t" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="events" fill="#22d3ee" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </article>

          <article className="surface-panel rounded-xl p-4">
            <h2 className="mb-3 text-sm font-semibold text-white">Blocked time by agent</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={blockedByAgent} layout="vertical">
                <XAxis type="number" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} width={70} />
                <Tooltip {...tooltipStyle} formatter={(value: unknown) => [`${value} min`, "Blocked"]} />
                <Bar dataKey="blocked" fill="#f59e0b" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </article>

          <article className="surface-panel rounded-xl p-4 xl:col-span-2">
            <h2 className="mb-3 text-sm font-semibold text-white">Utilization by role</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={utilizationByRole}>
                <XAxis dataKey="role" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip {...tooltipStyle} formatter={(value: unknown) => [`${value}%`, "Utilization"]} />
                <Bar dataKey="utilization" fill="#34d399" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </article>
        </section>
      </div>
    </AppShell>
  );
}
