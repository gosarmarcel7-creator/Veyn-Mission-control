"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useRoomStore } from "@/lib/store";
import type { Agent, AgentRole } from "@/lib/types";
import { cn, formatCost, formatTokens, initials, roleBadgeColor, statusDotColor } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const ROLE_GROUPS: { label: string; roles: AgentRole[] }[] = [
  { label: "Management", roles: ["manager"] },
  { label: "Research", roles: ["researcher", "analyst"] },
  { label: "Engineering", roles: ["coder"] },
  { label: "Review", roles: ["reviewer"] },
  { label: "Deployment", roles: ["deployment"] },
  { label: "Support", roles: ["support", "custom"] },
];

function matchesQuery(agent: Agent, query: string) {
  if (!query) return true;
  const value = query.toLowerCase();
  return (
    agent.name.toLowerCase().includes(value) ||
    agent.role.toLowerCase().includes(value) ||
    (agent.currentTask ?? "").toLowerCase().includes(value) ||
    agent.model.toLowerCase().includes(value)
  );
}

function AgentRow({
  agent,
  selected,
  onSelect,
}: {
  agent: Agent;
  selected: boolean;
  onSelect: () => void;
}) {
  const active = !["idle", "done", "paused"].includes(agent.status);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full rounded-lg border p-2 text-left transition-colors",
        selected
          ? "border-sky-500/40 bg-sky-500/10"
          : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
      )}
    >
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-[#162338] text-[10px] font-semibold text-white">
          {initials(agent.name)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-medium text-white">{agent.name}</span>
            <span className={cn("h-1.5 w-1.5 rounded-full", statusDotColor(agent.status))} />
            {active && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300/90" />}
          </div>
          <p className="truncate text-[11px] text-slate-300">{agent.currentTask ?? "Waiting for task"}</p>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <Badge variant="outline" className={cn("text-[10px] capitalize", roleBadgeColor(agent.role))}>
          {agent.role}
        </Badge>
        <Badge variant="outline" className="border-white/20 bg-white/[0.03] text-[10px] text-slate-200">
          {agent.model}
        </Badge>
        <Badge variant="outline" className="border-white/20 bg-white/[0.03] text-[10px] capitalize text-slate-300">
          {agent.status.replaceAll("_", " ")}
        </Badge>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2 text-[10px] text-slate-400">
        <span className="font-mono">{formatTokens(agent.tokensUsed)} tokens</span>
        <span className="font-mono text-right">{formatCost(agent.costUsd)}</span>
      </div>
    </button>
  );
}

export function LeftSidebar() {
  const { agents, selectedAgentId, setSelectedAgentId, isDemoMode } = useRoomStore();
  const [query, setQuery] = useState("");

  const activeCount = agents.filter((agent) => !["idle", "done", "paused"].includes(agent.status)).length;

  const grouped = useMemo(() => {
    return ROLE_GROUPS.map((group) => {
      const entries = agents.filter((agent) => group.roles.includes(agent.role) && matchesQuery(agent, query));
      return { ...group, entries };
    }).filter((group) => group.entries.length > 0);
  }, [agents, query]);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-white/10 px-4 py-3">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Agents</h2>
          <span className="text-xs text-slate-300">{activeCount} active</span>
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search agents"
            className="h-8 border-white/15 bg-white/[0.03] pl-7 text-xs"
          />
        </div>
      </div>

      {isDemoMode && (
        <div className="mx-4 mt-3 rounded-lg border border-sky-500/25 bg-sky-500/10 px-3 py-2 text-xs text-sky-100">
          Demo mode is on — simulated agents are shown. Disable in Settings to use synced providers.
        </div>
      )}

      {!isDemoMode && agents.length === 0 && (
        <div className="mx-4 mt-3 rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
          No agents yet. Connect a provider and sync, or send a signed webhook event.
        </div>
      )}

      <ScrollArea className="min-h-0 flex-1 px-4 py-4">
        <div className="space-y-4">
          {grouped.map((group) => (
            <section key={group.label} className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-[11px] uppercase tracking-wide text-slate-400">{group.label}</h3>
                <span className="text-[11px] text-slate-500">{group.entries.length}</span>
              </div>
              <div className="space-y-2">
                {group.entries.map((agent) => (
                  <AgentRow
                    key={agent.id}
                    agent={agent}
                    selected={selectedAgentId === agent.id}
                    onSelect={() => setSelectedAgentId(selectedAgentId === agent.id ? null : agent.id)}
                  />
                ))}
              </div>
            </section>
          ))}

          {grouped.length === 0 && (
            <div className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-4 text-center text-sm text-slate-400">
              {agents.length === 0 ? "No agents yet." : "No agents match this filter."}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
