"use client";

import { useMemo } from "react";
import { Copy, ShieldCheck } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";

interface WebhookModalProps {
  provider: { id: string; name: string };
  open: boolean;
  onClose: () => void;
}

const WEBHOOK_PAYLOAD = `{
  "runId": "run_123",
  "agentId": "coder_1",
  "agentName": "Kai",
  "role": "coder",
  "model": "Claude",
  "status": "coding",
  "task": "Editing pricing page",
  "tool": "file_edit",
  "timestamp": "2026-05-23T12:00:00Z",
  "metadata": {
    "file": "app/pricing/page.tsx",
    "linesChanged": 42
  }
}`;

export function WebhookModal({ provider, open, onClose }: WebhookModalProps) {
  const endpoint = useMemo(() => {
    if (typeof window === "undefined") return "https://app.veyn.io/api/ingest/ws_demo/wh_demo";
    return `${window.location.origin}/api/ingest/ws_demo/wh_demo`;
  }, []);

  const signingSecret = "whsec_demo_2f8cf7c1";

  const curlExample = `curl -X POST ${endpoint} \\
  -H \"Content-Type: application/json\" \\
  -H \"x-veyn-signature: sha256=<signature>\" \\
  -d '${WEBHOOK_PAYLOAD}'`;

  const tsExample = `await fetch("${endpoint}", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-veyn-signature": "sha256=<signature>",
  },
  body: JSON.stringify(payload),
});`;

  const pyExample = `import requests
requests.post(
  "${endpoint}",
  headers={
    "Content-Type": "application/json",
    "x-veyn-signature": "sha256=<signature>",
  },
  json=payload,
)`;

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-auto border-white/10 bg-[#111722] sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{provider.name} webhook configuration</DialogTitle>
          <DialogDescription>Generate endpoint and signing secret for event ingest.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="mb-1 text-xs text-slate-300">Endpoint URL</p>
            <div className="flex gap-2">
              <Input value={endpoint} readOnly className="border-white/15 bg-white/[0.02] font-mono text-xs" />
              <Button variant="outline" className="border-white/20 bg-white/[0.02]" onClick={() => {navigator.clipboard.writeText(endpoint); toast.success("Webhook URL copied.");}}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div>
            <p className="mb-1 text-xs text-slate-300">Signing secret</p>
            <div className="flex gap-2">
              <Input value={signingSecret} readOnly className="border-white/15 bg-white/[0.02] font-mono text-xs" />
              <Button variant="outline" className="border-white/20 bg-white/[0.02]" onClick={() => {navigator.clipboard.writeText(signingSecret); toast.success("Signing secret copied.");}}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-100">
            <div className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 h-4 w-4" />
              <p>Webhooks can use signing secrets and server-side validation before processing agent events.</p>
            </div>
          </div>

          <div>
            <p className="mb-1 text-xs text-slate-300">Webhook payload example</p>
            <Textarea value={WEBHOOK_PAYLOAD} readOnly className="min-h-36 border-white/15 bg-[#0a111b] font-mono text-xs text-slate-200" />
          </div>

          <div>
            <p className="mb-1 text-xs text-slate-300">cURL</p>
            <Textarea value={curlExample} readOnly className="min-h-28 border-white/15 bg-[#0a111b] font-mono text-xs text-slate-200" />
          </div>

          <div>
            <p className="mb-1 text-xs text-slate-300">TypeScript</p>
            <Textarea value={tsExample} readOnly className="min-h-24 border-white/15 bg-[#0a111b] font-mono text-xs text-slate-200" />
          </div>

          <div>
            <p className="mb-1 text-xs text-slate-300">Python</p>
            <Textarea value={pyExample} readOnly className="min-h-24 border-white/15 bg-[#0a111b] font-mono text-xs text-slate-200" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
