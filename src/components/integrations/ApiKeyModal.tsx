"use client";

import { useState } from "react";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRoomStore } from "@/lib/store";
import { fetchProductionSnapshot, syncProviderConnection } from "@/lib/sync-client";

interface ApiKeyModalProps {
  provider: { id: string; name: string };
  open: boolean;
  onClose: () => void;
}

export function ApiKeyModal({ provider, open, onClose }: ApiKeyModalProps) {
  const { isDemoMode, setDemoMode, setAgents, setTasks, setRuns, setEvents, setProviderConnections } =
    useRoomStore();

  const [nickname, setNickname] = useState(`${provider.name} Production`);
  const [apiKey, setApiKey] = useState("");
  const [scope, setScope] = useState("workspace");
  const [showKey, setShowKey] = useState(false);
  const [busy, setBusy] = useState(false);
  const [connectionId, setConnectionId] = useState<string | null>(null);

  const refreshStore = async () => {
    const snapshot = await fetchProductionSnapshot();
    if (snapshot.agents) setAgents(snapshot.agents);
    if (snapshot.tasks) setTasks(snapshot.tasks);
    if (snapshot.runs) setRuns(snapshot.runs);
    if (snapshot.events) setEvents(snapshot.events);
    if (snapshot.connections) setProviderConnections(snapshot.connections);
  };

  const saveConnection = async () => {
    if (!apiKey.trim()) {
      toast.error("Enter an API key first.");
      return;
    }

    setBusy(true);
    try {
      const response = await fetch("/api/provider-connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: provider.id,
          authType: "api_key",
          displayName: nickname,
          apiKey,
          metadata: { scope },
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        toast.error(payload.error ?? "Failed to save connection.");
        return;
      }

      const id = payload.connection?.id ?? null;
      setConnectionId(id);

      if (isDemoMode) setDemoMode(false);

      if (id) {
        try {
          const syncResult = await syncProviderConnection(id);
          toast.success(syncResult.message ?? "Connection saved and synced.");
        } catch (error) {
          toast.success("Connection saved.");
          toast.info(error instanceof Error ? error.message : "Sync will retry from integrations.");
        }
      } else {
        toast.success("Connection saved.");
      }

      await refreshStore();
      onClose();
    } catch {
      toast.error("Failed to save connection.");
    } finally {
      setBusy(false);
    }
  };

  const testConnection = async () => {
    if (!connectionId) {
      toast.info("Save the connection before testing.");
      return;
    }

    setBusy(true);
    try {
      const response = await fetch(`/api/provider-connections/${connectionId}/test`, {
        method: "POST",
      });
      const payload = await response.json();

      if (payload.success) {
        toast.success(payload.message ?? "Connection test succeeded.");
      } else {
        toast.error(payload.message ?? "Connection test failed.");
      }
    } catch {
      toast.error("Failed to test connection.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="border-white/10 bg-[#111722] sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Connect {provider.name} with API key</DialogTitle>
          <DialogDescription>
            Keys are encrypted and used only server-side. They are never exposed in the browser.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <p className="mb-1 text-xs text-slate-300">Key nickname</p>
            <Input value={nickname} onChange={(event) => setNickname(event.target.value)} className="border-white/15 bg-white/[0.02]" />
          </div>

          <div>
            <p className="mb-1 text-xs text-slate-300">API key</p>
            <div className="relative">
              <Input
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(event) => setApiKey(event.target.value)}
                className="border-white/15 bg-white/[0.02] pr-10 font-mono"
                placeholder="sk-..."
              />
              <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" onClick={() => setShowKey((value) => !value)}>
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <p className="mb-1 text-xs text-slate-300">Workspace scope</p>
            <Select value={scope} onValueChange={(value) => setScope(value ?? "workspace")}>
              <SelectTrigger className="border-white/15 bg-white/[0.02]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-[#111722]">
                <SelectItem value="workspace">Current workspace</SelectItem>
                <SelectItem value="all">All workspaces (admin)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-100">
            <div className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 h-4 w-4" />
              <p>Keys are encrypted and used only server-side. They are never exposed in the browser.</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 border-white/20 bg-white/[0.02]" onClick={testConnection} disabled={busy}>
              Test connection
            </Button>
            <Button className="flex-1" onClick={saveConnection} disabled={busy}>
              Save connection
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
