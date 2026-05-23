"use client";

import { useState } from "react";
import { useRoomStore } from "@/lib/store";
import type { Task } from "@/lib/types";
import { priorityColor } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { TaskDrawer } from "./TaskDrawer";

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  const { agents } = useRoomStore();
  const [open, setOpen] = useState(false);

  const assigned = agents.filter((agent) => task.assignedAgentIds.includes(agent.id));
  const modelSummary = Array.from(new Set(assigned.map((agent) => agent.model))).slice(0, 2).join(", ") || "Unassigned";

  return (
    <>
      <article
        draggable
        onDragStart={(event) => event.dataTransfer.setData("text/task-id", task.id)}
        className="cursor-grab rounded-lg border border-white/10 bg-white/[0.03] p-3 active:cursor-grabbing"
        onClick={() => setOpen(true)}
      >
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-medium text-white">{task.title}</h4>
          <Badge variant="outline" className={priorityColor(task.priority)}>
            {task.priority}
          </Badge>
        </div>

        <p className="mt-1 line-clamp-2 text-xs text-slate-300">{task.description ?? "No description"}</p>

        <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
          <span>{assigned.length} agents</span>
          <span>{modelSummary}</span>
        </div>

        <div className="mt-2 text-[11px] text-slate-500">Events: {Math.max(1, Math.round((task.id.length * 17) % 28))}</div>
      </article>

      <TaskDrawer task={task} open={open} onClose={() => setOpen(false)} />
    </>
  );
}
