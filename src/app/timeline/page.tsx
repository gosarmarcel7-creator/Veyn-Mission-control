"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useRoomStore } from "@/lib/store";
import { dateTimeLabel, formatCost, formatTokens } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export default function TimelinePage() {
  const { runs, events, agents } = useRoomStore();

  const [selectedRunId, setSelectedRunId] = useState(runs[0]?.id ?? "");
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [agentFilter, setAgentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [toolFilter, setToolFilter] = useState("all");
  const [providerFilter, setProviderFilter] = useState("all");
  const [errorsOnly, setErrorsOnly] = useState(false);

  const run = runs.find((entry) => entry.id === selectedRunId) ?? runs[0];

  const runEvents = useMemo(() => {
    return events
      .filter((event) => event.runId === run?.id)
      .filter((event) => (agentFilter === "all" ? true : event.agentId === agentFilter))
      .filter((event) => (statusFilter === "all" ? true : event.eventType.includes(statusFilter)))
      .filter((event) => (toolFilter === "all" ? true : event.tool === toolFilter))
      .filter((event) => (providerFilter === "all" ? true : event.provider === providerFilter))
      .filter((event) => (errorsOnly ? event.eventType.includes("error") || event.eventType.includes("blocked") : true));
  }, [events, run?.id, agentFilter, statusFilter, toolFilter, providerFilter, errorsOnly]);

  const selectedEvent = runEvents.find((event) => event.id === selectedEventId) ?? runEvents[0] ?? null;

  return (
    <AppShell>
      <div className="grid h-full grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)_320px]">
        <aside className="border-r border-white/10 p-3">
          <h2 className="text-sm font-semibold text-white">Runs</h2>
          <div className="mt-3 space-y-2">
            {runs.map((entry) => (
              <button
                type="button"
                key={entry.id}
                onClick={() => setSelectedRunId(entry.id)}
                className={`w-full rounded-lg border p-3 text-left ${
                  selectedRunId === entry.id
                    ? "border-sky-500/35 bg-sky-500/10"
                    : "border-white/10 bg-white/[0.02] hover:bg-white/[0.04]"
                }`}
              >
                <p className="text-sm font-medium text-white">{entry.title}</p>
                <p className="mt-1 text-xs text-slate-300">{entry.status}</p>
                <p className="text-xs text-slate-400">{dateTimeLabel(entry.startedAt)}</p>
                <p className="text-xs font-mono text-slate-300">{formatCost(entry.totalCostUsd)} · {formatTokens(entry.totalTokens)}</p>
              </button>
            ))}
          </div>
        </aside>

        <section className="min-h-0 border-r border-white/10">
          <header className="border-b border-white/10 px-4 py-3">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm font-semibold text-white">Event timeline</h2>
              <Badge variant="outline" className="border-white/20 bg-white/[0.03] text-xs text-slate-200">
                {runEvents.length} events
              </Badge>
            </div>

            <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
              <Select value={agentFilter} onValueChange={(value) => setAgentFilter(value ?? "all")}>
                <SelectTrigger className="h-8 border-white/15 bg-white/[0.03] text-xs"><SelectValue placeholder="Agent" /></SelectTrigger>
                <SelectContent className="border-white/10 bg-[#111722]">
                  <SelectItem value="all">All agents</SelectItem>
                  {agents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>{agent.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value ?? "all")}>
                <SelectTrigger className="h-8 border-white/15 bg-white/[0.03] text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent className="border-white/10 bg-[#111722]">
                  <SelectItem value="all">All status</SelectItem>
                  <SelectItem value="thinking">Thinking</SelectItem>
                  <SelectItem value="tool_call">Tool call</SelectItem>
                  <SelectItem value="file">File</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>

              <Select value={toolFilter} onValueChange={(value) => setToolFilter(value ?? "all")}>
                <SelectTrigger className="h-8 border-white/15 bg-white/[0.03] text-xs"><SelectValue placeholder="Tool" /></SelectTrigger>
                <SelectContent className="border-white/10 bg-[#111722]">
                  <SelectItem value="all">All tools</SelectItem>
                  {Array.from(new Set(events.map((event) => event.tool).filter(Boolean))).map((tool) => (
                    <SelectItem key={tool} value={tool ?? ""}>{tool}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={providerFilter} onValueChange={(value) => setProviderFilter(value ?? "all")}>
                <SelectTrigger className="h-8 border-white/15 bg-white/[0.03] text-xs"><SelectValue placeholder="Provider" /></SelectTrigger>
                <SelectContent className="border-white/10 bg-[#111722]">
                  <SelectItem value="all">All providers</SelectItem>
                  {Array.from(new Set(events.map((event) => event.provider))).map((provider) => (
                    <SelectItem key={provider} value={provider}>{provider}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <label className="flex items-center justify-between rounded-md border border-white/15 bg-white/[0.03] px-3 text-xs text-slate-200">
                Errors only
                <Switch checked={errorsOnly} onCheckedChange={setErrorsOnly} />
              </label>
            </div>
          </header>

          <div className="h-[calc(100%-110px)] overflow-auto p-3">
            <div className="space-y-2">
              {runEvents.map((event) => {
                const agent = agents.find((entry) => entry.id === event.agentId);
                return (
                  <button
                    type="button"
                    key={event.id}
                    onClick={() => setSelectedEventId(event.id)}
                    className={`w-full rounded-lg border p-3 text-left ${
                      selectedEventId === event.id
                        ? "border-sky-500/35 bg-sky-500/10"
                        : "border-white/10 bg-white/[0.02] hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm text-white">{event.title}</p>
                      <span className="text-[11px] text-slate-500">{dateTimeLabel(event.timestamp)}</span>
                    </div>
                    <p className="text-xs text-slate-300">{agent?.name ?? event.agentId} · {event.eventType}</p>
                    {event.message && <p className="mt-1 text-xs text-slate-400">{event.message}</p>}
                  </button>
                );
              })}

              {runEvents.length === 0 && (
                <div className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-4 text-sm text-slate-400">
                  No events match these filters.
                </div>
              )}
            </div>
          </div>
        </section>

        <aside className="p-3">
          <h2 className="text-sm font-semibold text-white">Event details</h2>

          {selectedEvent ? (
            <div className="mt-3 space-y-2 rounded-lg border border-white/10 bg-white/[0.02] p-3 text-sm">
              <p className="font-medium text-white">{selectedEvent.title}</p>
              <p className="text-xs text-slate-300">{selectedEvent.eventType}</p>
              <p className="text-xs text-slate-300">Agent: {agents.find((entry) => entry.id === selectedEvent.agentId)?.name ?? selectedEvent.agentId}</p>
              <p className="text-xs text-slate-300">Provider: {selectedEvent.provider}</p>
              <p className="text-xs text-slate-300">Tool: {selectedEvent.tool ?? "n/a"}</p>
              <p className="text-xs text-slate-300">Task: {selectedEvent.task ?? "n/a"}</p>
              <p className="text-xs text-slate-400">{selectedEvent.message}</p>
              <pre className="overflow-x-auto rounded border border-white/10 bg-[#0a111b] p-2 text-[11px] text-slate-300">
                <code>{JSON.stringify(selectedEvent.metadata ?? {}, null, 2)}</code>
              </pre>
            </div>
          ) : (
            <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-4 text-sm text-slate-400">
              Select an event to inspect payload details.
            </div>
          )}
        </aside>
      </div>
    </AppShell>
  );
}
