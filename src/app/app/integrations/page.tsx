"use client";

import { AppShell } from "@/components/layout/AppShell";
import { ProviderCard } from "@/components/integrations/ProviderCard";
import { useRoomStore } from "@/lib/store";
import { PROVIDER_DEFINITIONS } from "@/lib/demo-data";

export default function AppIntegrationsPage() {
  const { providerConnections } = useRoomStore();

  return (
    <AppShell>
      <div className="h-full overflow-auto p-4 sm:p-6">
        <header className="mb-5">
          <h1 className="text-2xl font-semibold text-white">Provider Connections</h1>
          <p className="text-sm text-slate-300">
            Connect Claude, OpenAI, LangGraph, GitHub, Vercel, and custom webhooks.
          </p>
        </header>

        <div className="mb-4 rounded-lg border border-sky-500/25 bg-sky-500/10 px-3 py-2 text-sm text-sky-100">
          Demo Mode - Connect a provider to use real agents.
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {PROVIDER_DEFINITIONS.map((provider) => (
            <ProviderCard
              key={provider.id}
              provider={provider}
              connection={providerConnections.find((connection) => connection.provider === provider.id)}
            />
          ))}
        </div>
      </div>
    </AppShell>
  );
}
