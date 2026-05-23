"use client";

import { AppShell } from "@/components/layout/AppShell";
import { AgentTable } from "@/components/agents/AgentTable";

export default function AgentsPage() {
  return (
    <AppShell>
      <div className="flex h-full flex-col">
        <header className="border-b border-white/10 px-4 py-4 sm:px-6">
          <h1 className="text-2xl font-semibold text-white">Agent Registry</h1>
          <p className="text-sm text-slate-300">
            View status, provider, model, cost, and task state for every active agent.
          </p>
        </header>

        <div className="min-h-0 flex-1">
          <AgentTable />
        </div>
      </div>
    </AppShell>
  );
}
