"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useRoomStore } from "@/lib/store";
import type { TaskPriority, TaskStatus } from "@/lib/types";
import { TaskCard } from "./TaskCard";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const COLUMNS: Array<{ id: TaskStatus; label: string }> = [
  { id: "queued", label: "Queued" },
  { id: "assigned", label: "Assigned" },
  { id: "in_progress", label: "In Progress" },
  { id: "review", label: "Review" },
  { id: "blocked", label: "Blocked" },
  { id: "done", label: "Done" },
];

export function TaskBoard() {
  const { tasks, addTask, updateTask, workspace } = useRoomStore();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");

  const onCreate = () => {
    if (!title.trim()) return;

    const now = new Date().toISOString();
    addTask({
      id: `task_${Date.now()}`,
      workspaceId: workspace.id,
      title: title.trim(),
      description: description.trim() || undefined,
      status: "queued",
      assignedAgentIds: [],
      priority,
      createdAt: now,
      updatedAt: now,
    });

    setOpen(false);
    setTitle("");
    setDescription("");
    setPriority("medium");
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <p className="text-sm text-slate-300">Task orchestration board</p>
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="mr-1.5 h-4 w-4" />
          Create task
        </Button>
      </div>

      <div className="min-h-0 flex-1 overflow-x-auto">
        <div className="grid min-h-full grid-flow-col auto-cols-[280px] gap-3 p-4">
          {COLUMNS.map((column) => (
            <section
              key={column.id}
              className="rounded-xl border border-white/10 bg-[#0f1622] p-3"
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                const taskId = event.dataTransfer.getData("text/task-id");
                if (!taskId) return;
                updateTask(taskId, { status: column.id });
              }}
            >
              <header className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">{column.label}</h3>
                <span className="text-xs text-slate-400">{tasks.filter((task) => task.status === column.id).length}</span>
              </header>

              <div className="space-y-2">
                {tasks
                  .filter((task) => task.status === column.id)
                  .map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border-white/10 bg-[#111722]">
          <DialogHeader>
            <DialogTitle>Create task</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Task title" className="border-white/15 bg-white/[0.02]" />
            <Textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Task description" className="min-h-24 border-white/15 bg-white/[0.02]" />
            <Select value={priority} onValueChange={(value) => setPriority((value as TaskPriority | null) ?? "medium")}>
              <SelectTrigger className="border-white/15 bg-white/[0.02]"><SelectValue /></SelectTrigger>
              <SelectContent className="border-white/10 bg-[#111722]">
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
            <Button className="w-full" onClick={onCreate}>Create task</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
