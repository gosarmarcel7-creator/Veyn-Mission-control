"use client";

import { useMemo, useState } from "react";
import { Play, Pause, Route, StopCircle, TerminalSquare, WandSparkles } from "lucide-react";
import { toast } from "sonner";
import { useRoomStore } from "@/lib/store";
import { dateTimeLabel, formatCost, formatTokens, roleBadgeColor, statusDotColor, zoneBadgeColor, zoneLabel } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

function OverviewPanel() {
  const { agents, providerConnections, currentRun, events } = useRoomStore();

  const activeAgents = agents.filter((entry) => !["idle", "done", "paused"].includes(entry.status)).length;
  const blockedAgents = agents.filter((entry) => entry.status === "blocked").length;
  const runningTasks = agents.filter((entry) => ["coding", "using_tool", "reviewing", "thinking"].includes(entry.status)).length;
  const totalCost = agents.reduce((sum, entry) => sum + entry.costUsd, 0);
  const totalTokens = agents.reduce((sum, entry) => sum + entry.tokensUsed, 0);
  const providerHealth = Math.round((providerConnections.filter((entry) => entry.status === "connected").length / Math.max(1, providerConnections.length)) * 100);

  const recent = events.slice(0, 12);

  return (
    <ScrollArea className="h-full">
      <div className="space-y-4 p-4">
        <div>
          <h3 className="text-sm font-semibold text-white">Room Overview</h3>
          <p className="mt-1 text-xs text-slate-400">Live state for agent work across this workspace.</p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="surface-panel rounded-lg p-2">
            <p className="text-[11px] text-slate-400">Active agents</p>
            <p className="text-lg font-semibold text-white">{activeAgents}</p>
          </div>
          <div className="surface-panel rounded-lg p-2">
            <p className="text-[11px] text-slate-400">Running tasks</p>
            <p className="text-lg font-semibold text-white">{runningTasks}</p>
          </div>
          <div className="surface-panel rounded-lg p-2">
            <p className="text-[11px] text-slate-400">Blocked agents</p>
            <p className="text-lg font-semibold text-orange-300">{blockedAgents}</p>
          </div>
          <div className="surface-panel rounded-lg p-2">
            <p className="text-[11px] text-slate-400">Provider health</p>
            <p className="text-lg font-semibold text-white">{providerHealth}%</p>
          </div>
        </div>

        <div className="surface-panel rounded-lg p-3">
          <p className="text-[11px] text-slate-400">Cost today</p>
          <p className="font-mono text-lg text-white">{formatCost(totalCost)}</p>
          <p className="mt-1 text-[11px] text-slate-400">Tokens today</p>
          <p className="font-mono text-sm text-slate-200">{formatTokens(totalTokens)}</p>
        </div>

        {currentRun && (
          <div className="surface-panel rounded-lg p-3">
            <p className="text-[11px] text-slate-400">Current run</p>
            <p className="mt-1 text-sm font-medium text-white">{currentRun.title}</p>
            <div className="mt-2 flex items-center justify-between text-xs text-slate-300">
              <span>Status: {currentRun.status}</span>
              <span>{formatTokens(currentRun.totalTokens)}</span>
            </div>
          </div>
        )}

        <div>
          <h4 className="mb-2 text-xs uppercase tracking-wide text-slate-400">Recent events</h4>
          <div className="space-y-2">
            {recent.length === 0 && (
              <div className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-4 text-sm text-slate-400">
                Waiting for events. Send your first event using a webhook or SDK snippet.
              </div>
            )}

            {recent.map((event) => (
              <div key={event.id} className="surface-panel rounded-lg p-2.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-xs font-medium text-slate-100">{event.title}</p>
                  <span className="shrink-0 text-[10px] text-slate-500">{dateTimeLabel(event.timestamp)}</span>
                </div>
                {event.message && <p className="mt-1 text-[11px] text-slate-400">{event.message}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}

function AgentActions({ agentId }: { agentId: string }) {
  const { agents, pauseAgent, resumeAgent, assignTaskToAgent, setSelectedAgentId } = useRoomStore();
  const agent = agents.find((entry) => entry.id === agentId);

  const [assignOpen, setAssignOpen] = useState(false);
  const [redirectOpen, setRedirectOpen] = useState(false);
  const [taskDraft, setTaskDraft] = useState("");
  const [redirectDraft, setRedirectDraft] = useState("");

  if (!agent) return null;

  return (
    <>
      <div className="grid grid-cols-2 gap-2">
        <Button size="sm" variant="outline" className="justify-start border-white/15 bg-white/[0.03]" onClick={() => pauseAgent(agent.id)}>
          <Pause className="mr-1.5 h-3.5 w-3.5" />
          Pause
        </Button>
        <Button size="sm" variant="outline" className="justify-start border-white/15 bg-white/[0.03]" onClick={() => resumeAgent(agent.id)}>
          <Play className="mr-1.5 h-3.5 w-3.5" />
          Resume
        </Button>
        <Button size="sm" variant="outline" className="justify-start border-white/15 bg-white/[0.03]" onClick={() => setAssignOpen(true)}>
          <WandSparkles className="mr-1.5 h-3.5 w-3.5" />
          Assign Task
        </Button>
        <Button size="sm" variant="outline" className="justify-start border-white/15 bg-white/[0.03]" onClick={() => setRedirectOpen(true)}>
          <Route className="mr-1.5 h-3.5 w-3.5" />
          Redirect
        </Button>
        <Button size="sm" variant="outline" className="justify-start border-white/15 bg-white/[0.03]" onClick={() => toast.info("Opening logs view.")}>
          <TerminalSquare className="mr-1.5 h-3.5 w-3.5" />
          View Logs
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="justify-start border-orange-500/30 bg-orange-500/10 text-orange-200 hover:bg-orange-500/20"
          onClick={() => {
            pauseAgent(agent.id);
            setSelectedAgentId(null);
            toast.warning(`${agent.name} stopped.`);
          }}
        >
          <StopCircle className="mr-1.5 h-3.5 w-3.5" />
          Stop Run
        </Button>
      </div>

      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent className="border-white/10 bg-[#111722]">
          <DialogHeader>
            <DialogTitle>Assign task to {agent.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              value={taskDraft}
              onChange={(event) => setTaskDraft(event.target.value)}
              placeholder="Describe task"
              className="border-white/15 bg-white/[0.02]"
            />
            <Button
              className="w-full"
              onClick={() => {
                if (!taskDraft.trim()) return;
                assignTaskToAgent(agent.id, taskDraft.trim());
                setTaskDraft("");
                setAssignOpen(false);
                toast.success("Task assigned.");
              }}
            >
              Assign task
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={redirectOpen} onOpenChange={setRedirectOpen}>
        <DialogContent className="border-white/10 bg-[#111722]">
          <DialogHeader>
            <DialogTitle>Redirect {agent.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Textarea
              value={redirectDraft}
              onChange={(event) => setRedirectDraft(event.target.value)}
              placeholder="Explain where this agent should go next"
              className="min-h-28 border-white/15 bg-white/[0.02]"
            />
            <Button
              className="w-full"
              onClick={() => {
                if (!redirectDraft.trim()) return;
                assignTaskToAgent(agent.id, redirectDraft.trim());
                setRedirectOpen(false);
                setRedirectDraft("");
                toast.success("Agent redirected.");
              }}
            >
              Save redirect
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function AgentPanel({ agentId }: { agentId: string }) {
  const { agents, events } = useRoomStore();
  const agentEvents = useMemo(
    () => events.filter((event) => event.agentId === agentId).slice(0, 50),
    [events, agentId]
  );
  const agent = agents.find((entry) => entry.id === agentId);
  if (!agent) return null;

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-white/10 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-[#182436] text-sm font-semibold text-white">
            {agent.name.slice(0, 1)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{agent.name}</p>
            <div className="mt-1 flex items-center gap-1.5">
              <Badge variant="outline" className={roleBadgeColor(agent.role)}>
                {agent.role}
              </Badge>
              <Badge variant="outline" className="border-white/20 bg-white/[0.03] text-[10px] text-slate-200">
                {agent.provider} · {agent.model}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="status" className="flex min-h-0 flex-1 flex-col">
        <div className="px-4 py-2">
          <TabsList className="grid h-8 grid-cols-4 border border-white/10 bg-white/[0.03]">
            <TabsTrigger value="status" className="text-xs">
              Status
            </TabsTrigger>
            <TabsTrigger value="tools" className="text-xs">
              Tools
            </TabsTrigger>
            <TabsTrigger value="logs" className="text-xs">
              Logs
            </TabsTrigger>
            <TabsTrigger value="memory" className="text-xs">
              Memory
            </TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea className="min-h-0 flex-1 px-4 pb-4">
          <TabsContent value="status" className="mt-0 space-y-4">
            <div className="surface-panel rounded-lg p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs text-slate-300">Current task</span>
                <Badge variant="outline" className="border-white/20 bg-white/[0.03] text-[10px] capitalize text-slate-200">
                  <span className={statusDotColor(agent.status)} /> {agent.status.replaceAll("_", " ")}
                </Badge>
              </div>
              <p className="text-sm text-white">{agent.currentTask ?? "No task"}</p>

              <div className="mt-3 space-y-1.5">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Progress</span>
                  <span className="font-mono">{agent.progress}%</span>
                </div>
                <Progress value={agent.progress} className="h-1.5" />
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-slate-400">Current tool</p>
                  <p className="font-mono text-slate-200">{agent.currentTool ?? "n/a"}</p>
                </div>
                <div>
                  <p className="text-slate-400">Zone</p>
                  <Badge variant="outline" className={zoneBadgeColor(agent.zone)}>
                    {zoneLabel(agent.zone)}
                  </Badge>
                </div>
                <div>
                  <p className="text-slate-400">Tokens</p>
                  <p className="font-mono text-slate-200">{formatTokens(agent.tokensUsed)}</p>
                </div>
                <div>
                  <p className="text-slate-400">Cost</p>
                  <p className="font-mono text-slate-200">{formatCost(agent.costUsd)}</p>
                </div>
              </div>

              <p className="mt-2 text-[11px] text-slate-500">Last event: {dateTimeLabel(agent.lastEventAt)}</p>
            </div>

            <AgentActions agentId={agentId} />
          </TabsContent>

          <TabsContent value="tools" className="mt-0 space-y-2">
            {agentEvents
              .filter((event) => Boolean(event.tool))
              .slice(0, 20)
              .map((event) => (
                <div key={event.id} className="surface-panel rounded-lg p-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-mono text-cyan-200">{event.tool}</p>
                    <span className="text-[10px] text-slate-500">{dateTimeLabel(event.timestamp)}</span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400">{event.message ?? event.title}</p>
                </div>
              ))}
            {agentEvents.filter((event) => Boolean(event.tool)).length === 0 && (
              <div className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-4 text-sm text-slate-400">
                No tool calls recorded yet.
              </div>
            )}
          </TabsContent>

          <TabsContent value="logs" className="mt-0 space-y-1">
            {agentEvents.map((event) => (
              <div key={event.id} className="surface-panel rounded-lg p-2.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-xs font-medium text-slate-100">{event.title}</p>
                  <span className="text-[10px] text-slate-500">{dateTimeLabel(event.timestamp)}</span>
                </div>
                {event.message && <p className="mt-1 text-[11px] text-slate-400">{event.message}</p>}
              </div>
            ))}
          </TabsContent>

          <TabsContent value="memory" className="mt-0 space-y-3">
            <div className="surface-panel rounded-lg p-3 text-sm text-slate-300">
              <p className="font-medium text-white">Working memory</p>
              <Separator className="my-2 bg-white/10" />
              <p>Current objective: {agent.currentTask ?? "No active objective."}</p>
              <p className="mt-1">Model: {agent.model}</p>
              <p className="mt-1">Provider: {agent.provider}</p>
            </div>

            <div className="surface-panel rounded-lg p-3 text-sm text-slate-300">
              <p className="font-medium text-white">Recent context</p>
              <ul className="mt-2 space-y-1 text-[12px] text-slate-400">
                <li>- Latest run checkpoint synced to timeline.</li>
                <li>- Tool usage and blockers available in event stream.</li>
                <li>- Replay mode can restore previous room state.</li>
              </ul>
            </div>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}

export function RightSidebar() {
  const { selectedAgentId } = useRoomStore();

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-white/10 px-4 py-3">
        <p className="text-xs uppercase tracking-wide text-slate-400">{selectedAgentId ? "Agent Inspector" : "Room Overview"}</p>
      </div>
      <div className="min-h-0 flex-1">{selectedAgentId ? <AgentPanel agentId={selectedAgentId} /> : <OverviewPanel />}</div>
    </div>
  );
}
