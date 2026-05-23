"use client";

import { useMemo } from "react";
import { useRoomStore } from "@/lib/store";
import { formatCost, formatTokens, roleBadgeColor, statusColor, zoneLabel } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AgentDrawerProps {
  agentId: string;
  open: boolean;
  onClose: () => void;
}

export function AgentDrawer({ agentId, open, onClose }: AgentDrawerProps) {
  const { agents, events } = useRoomStore();
  const agent = agents.find((entry) => entry.id === agentId);

  const agentEvents = useMemo(
    () => events.filter((event) => event.agentId === agentId).slice(0, 50),
    [events, agentId]
  );

  if (!agent) return null;

  return (
    <Sheet open={open} onOpenChange={(value) => !value && onClose()}>
      <SheetContent side="right" className="w-[min(720px,96vw)] border-white/10 bg-[#0f1622] p-0">
        <SheetHeader className="border-b border-white/10 px-4 py-3">
          <SheetTitle className="text-left text-white">{agent.name}</SheetTitle>
          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
            <Badge variant="outline" className={roleBadgeColor(agent.role)}>
              {agent.role}
            </Badge>
            <Badge variant="outline" className="border-white/20 bg-white/[0.03] text-slate-200">
              {agent.provider}
            </Badge>
            <Badge variant="outline" className="border-white/20 bg-white/[0.03] text-slate-200">
              {agent.model}
            </Badge>
            <Badge variant="outline" className="border-white/20 bg-white/[0.03] capitalize text-slate-200">
              {agent.status.replaceAll("_", " ")}
            </Badge>
          </div>
        </SheetHeader>

        <Tabs defaultValue="overview" className="flex h-full flex-col">
          <TabsList className="mx-4 mt-3 grid h-8 grid-cols-5 border border-white/10 bg-white/[0.03]">
            <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
            <TabsTrigger value="runs" className="text-xs">Runs</TabsTrigger>
            <TabsTrigger value="logs" className="text-xs">Logs</TabsTrigger>
            <TabsTrigger value="tools" className="text-xs">Tools</TabsTrigger>
            <TabsTrigger value="memory" className="text-xs">Memory</TabsTrigger>
          </TabsList>

          <ScrollArea className="min-h-0 flex-1 px-4 py-4">
            <TabsContent value="overview" className="mt-0 space-y-3">
              <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
                <p className="text-xs text-slate-300">Current task</p>
                <p className="mt-1 text-sm text-white">{agent.currentTask ?? "No active task"}</p>
                <div className="mt-3">
                  <div className="mb-1 flex justify-between text-xs text-slate-300">
                    <span>Progress</span>
                    <span>{agent.progress}%</span>
                  </div>
                  <Progress value={agent.progress} className="h-1.5" />
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3 text-sm text-slate-200">
                  <p className="text-xs text-slate-400">Tokens</p>
                  <p className="font-mono">{formatTokens(agent.tokensUsed)}</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3 text-sm text-slate-200">
                  <p className="text-xs text-slate-400">Cost</p>
                  <p className="font-mono">{formatCost(agent.costUsd)}</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3 text-sm text-slate-200">
                  <p className="text-xs text-slate-400">Status</p>
                  <p className={statusColor(agent.status)}>{agent.status.replaceAll("_", " ")}</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3 text-sm text-slate-200">
                  <p className="text-xs text-slate-400">Zone</p>
                  <p>{zoneLabel(agent.zone)}</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="runs" className="mt-0 space-y-2">
              <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3 text-sm text-slate-300">
                <p className="font-medium text-white">run_launch_042</p>
                <p className="text-xs">Current run participation and event trace.</p>
              </div>
            </TabsContent>

            <TabsContent value="logs" className="mt-0 space-y-2">
              {agentEvents.map((event) => (
                <div key={event.id} className="rounded-lg border border-white/10 bg-white/[0.02] p-2.5">
                  <p className="text-sm text-white">{event.title}</p>
                  <p className="text-xs text-slate-300">{event.message}</p>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="tools" className="mt-0 space-y-2">
              {agentEvents.filter((event) => event.tool).map((event) => (
                <div key={event.id} className="rounded-lg border border-white/10 bg-white/[0.02] p-2.5">
                  <p className="font-mono text-sm text-cyan-200">{event.tool}</p>
                  <p className="text-xs text-slate-300">{event.message}</p>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="memory" className="mt-0 space-y-2">
              <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3 text-sm text-slate-300">
                <p className="font-medium text-white">Memory snapshot</p>
                <p className="mt-1">Current objective: {agent.currentTask ?? "None"}</p>
                <p className="mt-1">Latest tool: {agent.currentTool ?? "None"}</p>
                <p className="mt-1">Provider context: {agent.provider}</p>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
