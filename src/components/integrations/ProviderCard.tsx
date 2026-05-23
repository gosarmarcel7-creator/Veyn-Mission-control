"use client";

import { useState } from "react";
import { CheckCircle2, Circle, PlugZap, TriangleAlert } from "lucide-react";
import type { ProviderConnection, ProviderDefinition } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ApiKeyModal } from "./ApiKeyModal";
import { WebhookModal } from "./WebhookModal";
import { toast } from "sonner";

interface ProviderCardProps {
  provider: ProviderDefinition;
  connection?: ProviderConnection;
}

function statusIcon(status: ProviderConnection["status"] | undefined) {
  if (status === "connected") return <CheckCircle2 className="h-4 w-4 text-emerald-300" />;
  if (status === "needs_attention") return <TriangleAlert className="h-4 w-4 text-amber-300" />;
  if (status === "disconnected") return <Circle className="h-4 w-4 text-orange-300" />;
  return <Circle className="h-4 w-4 text-slate-500" />;
}

export function ProviderCard({ provider, connection }: ProviderCardProps) {
  const [keyModalOpen, setKeyModalOpen] = useState(false);
  const [webhookModalOpen, setWebhookModalOpen] = useState(false);

  const openPrimary = () => {
    if (provider.authType === "api_key") {
      setKeyModalOpen(true);
      return;
    }

    if (provider.authType === "webhook") {
      setWebhookModalOpen(true);
      return;
    }

    toast.info(`${provider.name} OAuth is stubbed in demo mode.`);
  };

  return (
    <article className="surface-panel rounded-xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-base font-semibold text-white">{provider.name}</p>
          <p className="mt-1 text-sm text-slate-300">{provider.description}</p>
        </div>
        <div>{statusIcon(connection?.status)}</div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <Badge variant="outline" className="border-white/20 bg-white/[0.03] text-xs text-slate-200">
          {provider.methodLabel}
        </Badge>
        <Badge
          variant="outline"
          className={cn(
            "text-xs",
            connection?.status === "connected"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-100"
              : connection?.status === "needs_attention"
              ? "border-amber-500/30 bg-amber-500/10 text-amber-100"
              : "border-white/20 bg-white/[0.03] text-slate-300"
          )}
        >
          {connection?.status?.replace("_", " ") ?? "not connected"}
        </Badge>
      </div>

      <p className="mt-2 text-xs text-slate-400">{connection?.displayName ?? "No active connection"}</p>

      <div className="mt-4 flex gap-2">
        <Button className="flex-1" onClick={openPrimary}>
          <PlugZap className="mr-1.5 h-4 w-4" />
          {connection ? "Manage" : "Connect"}
        </Button>
        {provider.authType === "oauth" && (
          <Button variant="outline" className="border-white/20 bg-white/[0.02]" onClick={() => toast.info("OAuth flow stub")}>OAuth</Button>
        )}
      </div>

      <p className="mt-3 text-xs text-slate-400">Keys are encrypted and used only server-side. They are never exposed in the browser.</p>

      <ApiKeyModal provider={{ id: provider.id, name: provider.name }} open={keyModalOpen} onClose={() => setKeyModalOpen(false)} />
      <WebhookModal provider={{ id: provider.id, name: provider.name }} open={webhookModalOpen} onClose={() => setWebhookModalOpen(false)} />
    </article>
  );
}
