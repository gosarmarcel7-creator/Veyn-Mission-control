import { PublicNav } from "@/components/layout/PublicNav";

const DOC_TOPICS = [
  "Getting started",
  "Connect OpenAI",
  "Connect Claude",
  "Custom webhook",
  "Event schema",
  "SDKs",
  "Security",
  "Replay",
  "Agent controls",
];

const EVENT_SCHEMA = `{
  "runId": "run_123",
  "agentId": "coder_1",
  "agentName": "Kai",
  "role": "coder",
  "model": "Claude",
  "status": "coding",
  "task": "Editing DashboardShell.tsx",
  "tool": "file_edit",
  "timestamp": "2026-05-23T12:00:00Z"
}`;

const CURL_SAMPLE = `curl -X POST https://app.veyn.io/api/ingest/ws_demo/wh_demo_123 \\
  -H "Content-Type: application/json" \\
  -H "x-veyn-signature: sha256=<signature>" \\
  -d '{
    "runId": "run_123",
    "agentId": "coder_1",
    "agentName": "Kai",
    "role": "coder",
    "model": "Claude",
    "status": "coding",
    "task": "Editing DashboardShell.tsx",
    "tool": "file_edit",
    "timestamp": "2026-05-23T12:00:00Z"
  }'`;

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicNav />

      <main className="mx-auto flex w-full max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:px-10">
        <aside className="hidden w-56 shrink-0 lg:block">
          <div className="sticky top-24 rounded-xl border border-white/10 bg-[#0f1622] p-3">
            <p className="mb-2 text-xs uppercase tracking-wide text-slate-400">Docs</p>
            <ul className="space-y-1.5">
              {DOC_TOPICS.map((topic) => (
                <li key={topic} className="text-sm text-slate-200">
                  {topic}
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <h1 className="text-4xl font-semibold tracking-tight text-white">Documentation</h1>
          <p className="mt-4 max-w-3xl text-lg text-slate-300">
            Connect providers, route events, replay runs, and control agents with predictable infrastructure workflows.
          </p>

          <section className="mt-10 rounded-xl border border-white/10 bg-[#0f1622] p-4">
            <h2 className="text-xl font-semibold text-white">Webhook endpoint</h2>
            <p className="mt-2 text-sm text-slate-300">POST `/api/ingest/:workspaceId/:webhookId`</p>
            <p className="mt-1 text-sm text-slate-400">
              Send signed JSON payloads from your agent runner. Veyn validates signature, normalizes the event, and updates room state.
            </p>
          </section>

          <section className="mt-6 rounded-xl border border-white/10 bg-[#0f1622] p-4">
            <h2 className="text-xl font-semibold text-white">Event schema</h2>
            <pre className="mt-3 overflow-x-auto rounded-lg border border-white/10 bg-[#0a111b] p-3 text-xs text-slate-200">
              <code>{EVENT_SCHEMA}</code>
            </pre>
          </section>

          <section className="mt-6 rounded-xl border border-white/10 bg-[#0f1622] p-4">
            <h2 className="text-xl font-semibold text-white">cURL example</h2>
            <pre className="mt-3 overflow-x-auto rounded-lg border border-white/10 bg-[#0a111b] p-3 text-xs text-slate-200">
              <code>{CURL_SAMPLE}</code>
            </pre>
          </section>
        </div>
      </main>
    </div>
  );
}
