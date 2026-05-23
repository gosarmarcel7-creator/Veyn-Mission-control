"use client";

import { useMemo } from "react";
import { useRoomStore } from "@/lib/store";
import type { Task } from "@/lib/types";
import { priorityColor, statusDotColor, timeAgo } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface TaskDrawerProps {
  task: Task;
  open: boolean;
  onClose: () => void;
}

const NEXT_STATUS: Record<Task["status"], Task["status"]> = {
  queued: "assigned",
  assigned: "in_progress",
  in_progress: "review",
  review: "done",
  blocked: "in_progress",
  done: "done",
};

export function TaskDrawer({ task, open, onClose }: TaskDrawerProps) {
  const { agents, updateTask } = useRoomStore();

  const assigned = useMemo(
    () => agents.filter((agent) => task.assignedAgentIds.includes(agent.id)),
    [agents, task.assignedAgentIds]
  );

  return (
    <Sheet open={open} onOpenChange={(value) => !value && onClose()}>
      <SheetContent side="right" className="w-[min(560px,96vw)] border-white/10 bg-[#0f1622]">
        <SheetHeader>
          <SheetTitle className="text-white">{task.title}</SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className={priorityColor(task.priority)}>
              {task.priority}
            </Badge>
            <Badge variant="outline" className="border-white/20 bg-white/[0.03] capitalize text-slate-200">
              {task.status.replaceAll("_", " ")}
            </Badge>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3 text-sm text-slate-300">
            {task.description ?? "No description provided."}
          </div>

          <section>
            <h3 className="text-sm font-medium text-white">Assigned agents</h3>
            <div className="mt-2 space-y-2">
              {assigned.length === 0 && <p className="text-sm text-slate-400">No assigned agents yet.</p>}
              {assigned.map((agent) => (
                <div key={agent.id} className="flex items-center justify-between rounded-md border border-white/10 bg-white/[0.02] px-3 py-2 text-sm">
                  <div>
                    <p className="text-white">{agent.name}</p>
                    <p className="text-xs text-slate-400">{agent.provider} · {agent.model}</p>
                  </div>
                  <span className={`h-2 w-2 rounded-full ${statusDotColor(agent.status)}`} />
                </div>
              ))}
            </div>
          </section>

          <section className="text-xs text-slate-400">
            <p>Created: {new Date(task.createdAt).toLocaleString()}</p>
            <p>Updated: {timeAgo(task.updatedAt)}</p>
          </section>

          <Button
            className="w-full"
            onClick={() => updateTask(task.id, { status: NEXT_STATUS[task.status] })}
            disabled={task.status === "done"}
          >
            Move to {NEXT_STATUS[task.status].replaceAll("_", " ")}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
