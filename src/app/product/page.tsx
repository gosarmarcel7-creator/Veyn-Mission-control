import { PublicNav } from "@/components/layout/PublicNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const SECTIONS = [
  {
    title: "Live Room",
    body: "The room shows where every agent is working across planning, research, coding, review, deployment, and incidents.",
    stats: ["15 active agents", "7 zones", "248 live events"],
  },
  {
    title: "Agent Inspector",
    body: "Click any agent to inspect status, tools, logs, cost, progress, and memory context without leaving the room.",
    stats: ["Status + tools", "Cost + tokens", "Actions + controls"],
  },
  {
    title: "Timeline Replay",
    body: "Replay every run with event markers and room state transitions to debug what changed and when.",
    stats: ["Replay speed", "Filters", "Run diff"],
  },
  {
    title: "Task Orchestration",
    body: "Assign tasks, pause runs, redirect agents, and gate high-risk actions with human controls.",
    stats: ["Task board", "Approvals", "Team routing"],
  },
  {
    title: "Event Ingestion",
    body: "Ingest provider and webhook events through normalized adapters and signed endpoints.",
    stats: ["Adapters", "Signed webhooks", "Normalized schema"],
  },
  {
    title: "Analytics",
    body: "Track cost, tokens, failures, blocked time, and utilization by provider, role, and run.",
    stats: ["Cost by provider", "Failure rate", "Utilization"],
  },
];

export default function ProductPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicNav />

      <main className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-10">
        <header className="max-w-3xl">
          <h1 className="text-4xl font-semibold tracking-tight text-white">Product Overview</h1>
          <p className="mt-4 text-lg text-slate-300">
            Veyn is a control plane for multi-agent work. Connect providers, observe live state, replay runs, and apply
            human controls when it matters.
          </p>
        </header>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {SECTIONS.map((section) => (
            <Card key={section.title} className="surface-panel border-white/10 bg-transparent">
              <CardHeader>
                <CardTitle className="text-xl text-white">{section.title}</CardTitle>
                <CardDescription className="text-sm text-slate-300">{section.body}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-white/10 bg-[#0a1019] p-3">
                  <div className="grid gap-2 sm:grid-cols-3">
                    {section.stats.map((stat) => (
                      <div key={stat} className="rounded-md border border-white/10 bg-white/[0.02] px-2 py-1.5 text-xs text-slate-200">
                        {stat}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
