"use client";

import { AppShell } from "@/components/layout/AppShell";
import { TaskBoard } from "@/components/tasks/TaskBoard";

export default function TasksPage() {
  return (
    <AppShell>
      <div className="flex h-full flex-col">
        <header className="border-b border-white/10 px-4 py-4 sm:px-6">
          <h1 className="text-2xl font-semibold text-white">Tasks</h1>
          <p className="text-sm text-slate-300">
            Queue, assign, and orchestrate agent work across queued, in-progress, review, blocked, and done states.
          </p>
        </header>

        <div className="min-h-0 flex-1">
          <TaskBoard />
        </div>
      </div>
    </AppShell>
  );
}
