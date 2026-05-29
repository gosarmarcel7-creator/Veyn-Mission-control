"use client";

import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { useRoomStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function SettingsPage() {
  const { workspace, providerConnections, isDemoMode, setDemoMode } = useRoomStore();

  return (
    <AppShell>
      <div className="h-full overflow-auto p-4 sm:p-6">
        <header className="mb-5">
          <h1 className="text-2xl font-semibold text-white">Settings</h1>
          <p className="text-sm text-slate-300">Workspace configuration, access control, keys, webhooks, and retention policies.</p>
        </header>

        <div className="space-y-5">
          <section className="rounded-xl border border-white/10 bg-[#0f1622] p-4">
            <h2 className="text-lg font-semibold text-white">Demo data</h2>
            <div className="mt-3 flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2">
              <div>
                <p className="text-sm text-white">Show simulated demo agents</p>
                <p className="text-xs text-slate-400">Turn off to use real provider connections and synced agents only.</p>
              </div>
              <Switch
                checked={isDemoMode}
                onCheckedChange={(checked) => {
                  setDemoMode(checked);
                  toast.success(checked ? "Demo mode enabled." : "Demo mode disabled. Syncing production data.");
                }}
              />
            </div>
          </section>

          <section className="rounded-xl border border-white/10 bg-[#0f1622] p-4">
            <h2 className="text-lg font-semibold text-white">Workspace</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Input defaultValue={workspace.name} className="border-white/15 bg-white/[0.03]" />
              <Input defaultValue={workspace.slug} className="border-white/15 bg-white/[0.03]" />
            </div>
            <Button className="mt-3" onClick={() => toast.success("Workspace updated.")}>Save workspace</Button>
          </section>

          <section className="rounded-xl border border-white/10 bg-[#0f1622] p-4">
            <h2 className="text-lg font-semibold text-white">Members</h2>
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {["Marcel G", "Demo User"].map((name, index) => (
                  <TableRow key={name} className="border-white/10">
                    <TableCell className="text-white">{name}</TableCell>
                    <TableCell className="text-slate-300">{index === 0 ? "owner@veyn.io" : "admin@veyn.io"}</TableCell>
                    <TableCell><Badge variant="outline" className="border-white/20 bg-white/[0.03] text-slate-200">{index === 0 ? "owner" : "admin"}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </section>

          <section className="rounded-xl border border-white/10 bg-[#0f1622] p-4">
            <h2 className="text-lg font-semibold text-white">Roles</h2>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {[
                "Owner can manage billing, members, and retention",
                "Admin can manage providers and webhooks",
                "Member can operate tasks and room controls",
                "Viewer has read-only analytics and timeline",
              ].map((line) => (
                <div key={line} className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-slate-300">
                  {line}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-white/10 bg-[#0f1622] p-4">
            <h2 className="text-lg font-semibold text-white">API keys</h2>
            <div className="mt-3 space-y-2">
              {providerConnections
                .filter((connection) => connection.authType === "api_key")
                .map((connection) => (
                  <div key={connection.id} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2">
                    <div>
                      <p className="text-sm text-white">{connection.displayName}</p>
                      <p className="text-xs text-slate-400">{connection.provider}</p>
                    </div>
                    <Button variant="outline" className="border-white/20 bg-white/[0.02]" onClick={() => toast.info("Rotate key flow stub")}>Rotate</Button>
                  </div>
                ))}
            </div>
          </section>

          <section className="rounded-xl border border-white/10 bg-[#0f1622] p-4">
            <h2 className="text-lg font-semibold text-white">Webhooks</h2>
            <div className="mt-3 flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2">
              <div>
                <p className="text-sm text-white">Signed ingest enabled</p>
                <p className="text-xs text-slate-400">Require `x-veyn-signature` for production payloads.</p>
              </div>
              <Switch defaultChecked />
            </div>
          </section>

          <section className="rounded-xl border border-white/10 bg-[#0f1622] p-4">
            <h2 className="text-lg font-semibold text-white">Data retention</h2>
            <div className="mt-3 flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2">
              <p className="text-sm text-slate-300">Retain events for 90 days</p>
              <Switch defaultChecked />
            </div>
          </section>

          <section className="rounded-xl border border-white/10 bg-[#0f1622] p-4">
            <h2 className="text-lg font-semibold text-white">Billing</h2>
            <p className="mt-2 text-sm text-slate-300">Billing portal is a placeholder in demo mode.</p>
            <Button className="mt-3" variant="outline" onClick={() => toast.info("Billing portal stub")}>Open billing portal</Button>
          </section>

          <section className="rounded-xl border border-white/10 bg-[#0f1622] p-4">
            <h2 className="text-lg font-semibold text-white">Audit log</h2>
            <div className="mt-3 space-y-2 text-sm text-slate-300">
              <div className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2">12:03 - API key rotation requested by owner</div>
              <div className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2">11:52 - Agent pause action by admin</div>
              <div className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2">11:37 - Webhook signature verification updated</div>
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
