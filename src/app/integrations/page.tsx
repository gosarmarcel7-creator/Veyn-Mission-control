import { PublicNav } from "@/components/layout/PublicNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const INTEGRATIONS = [
  {
    name: "Claude",
    bullets: [
      "Connect with Anthropic API key",
      "Observe Claude-powered agents",
      "Webhook support",
      "Server-side only",
    ],
    method: "API key",
  },
  {
    name: "OpenAI",
    bullets: [
      "Connect with OpenAI API key",
      "Track model calls, tool use, and usage",
      "Server-side only",
      "Compatible with custom agent runners",
    ],
    method: "API key",
  },
  {
    name: "LangGraph",
    bullets: [
      "Stream graph events",
      "Map nodes to agents",
      "Multi-agent workflow support",
      "Ingest through webhook or adapter",
    ],
    method: "Webhook / project",
  },
  {
    name: "GitHub",
    bullets: [
      "Track PRs, commits, branches, and file changes",
      "Useful for coding agents",
      "Scope repositories by workspace",
      "OAuth-style connection flow",
    ],
    method: "OAuth",
  },
  {
    name: "Vercel",
    bullets: [
      "Track deployments",
      "Track build logs",
      "Track environment issues",
      "Map deployment events to agents",
    ],
    method: "OAuth",
  },
  {
    name: "Custom Webhook",
    bullets: [
      "Connect any framework",
      "Signed event ingest",
      "TypeScript/Python/curl examples",
      "Works with existing runners",
    ],
    method: "Webhook",
  },
];

export default function IntegrationsPublicPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicNav />

      <main className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-10">
        <header className="max-w-3xl">
          <h1 className="text-4xl font-semibold tracking-tight text-white">Integrations</h1>
          <p className="mt-4 text-lg text-slate-300">
            Connect Claude, OpenAI, LangGraph, GitHub, Vercel, and custom systems to route events into Veyn.
          </p>
        </header>

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {INTEGRATIONS.map((integration) => (
            <Card key={integration.name} className="surface-panel border-white/10 bg-transparent">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-white">{integration.name}</CardTitle>
                  <Badge variant="outline" className="border-white/20 bg-white/[0.03] text-xs text-slate-200">
                    {integration.method}
                  </Badge>
                </div>
                <CardDescription className="text-sm text-slate-300">
                  Connection and ingest behavior for {integration.name}.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-200">
                  {integration.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-sky-300" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
