import Link from "next/link";
import {
  ArrowRight,
  CircleDashed,
  Link2,
  PlayCircle,
  ShieldCheck,
  Waypoints,
} from "lucide-react";
import { PublicNav } from "@/components/layout/PublicNav";

function HeroFrame() {
  return (
    <div className="surface-elevated mx-auto w-full max-w-6xl overflow-hidden rounded-2xl">
      <div className="flex items-center gap-2 border-b border-white/10 bg-[#0c121c] px-4 py-3">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#f87171]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#fbbf24]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#34d399]" />
        </div>
        <div className="mx-auto rounded-md border border-white/10 bg-[#090d15] px-3 py-1 text-xs font-mono text-slate-400">
          app.veyn.io/room
        </div>
      </div>

      <div className="grid grid-cols-12 gap-0 bg-[#090d15]">
        <aside className="col-span-3 border-r border-white/10 p-3 lg:col-span-2">
          <p className="mb-2 text-[11px] uppercase tracking-wide text-slate-400">Agents</p>
          <div className="space-y-2">
            {[
              ["Mira", "manager", "thinking"],
              ["Kai", "coder", "coding"],
              ["Quinn", "reviewer", "reviewing"],
              ["Dev", "deployment", "using_tool"],
              ["Echo", "support", "thinking"],
            ].map(([name, role, status]) => (
              <div key={name} className="rounded-md border border-white/10 bg-white/[0.03] p-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-medium text-white">{name}</p>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </div>
                <p className="mt-0.5 text-[11px] text-slate-300">{role}</p>
                <p className="text-[10px] text-slate-500">{status}</p>
              </div>
            ))}
          </div>
        </aside>

        <div className="col-span-6 min-h-[340px] border-r border-white/10 p-3 lg:col-span-7">
          <div className="relative h-full overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-[#0d1725] to-[#0a111a]">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(114,182,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(114,182,255,0.08)_1px,transparent_1px)] bg-[size:24px_24px]" />

            {[
              ["Planning", "left-10 top-10", "#72b6ff"],
              ["Research", "left-16 top-28", "#37b3d9"],
              ["Coding", "left-44 top-48", "#60a5fa"],
              ["Review", "right-12 top-44", "#fbbf24"],
              ["Deploy", "right-10 top-20", "#34d399"],
              ["Incident", "right-12 bottom-10", "#f97316"],
            ].map(([name, position, color]) => (
              <div key={name} className={`absolute ${position}`}>
                <div className="rounded-md border border-white/20 bg-black/45 px-2 py-0.5 text-[10px] uppercase tracking-wide" style={{ color: String(color) }}>
                  {name}
                </div>
              </div>
            ))}

            {[
              ["Mira", "left-1/2 top-16", "#72b6ff"],
              ["Kai", "left-1/3 top-2/3", "#60a5fa"],
              ["Alex", "left-1/2 top-2/3", "#60a5fa"],
              ["Quinn", "right-1/4 top-2/3", "#fbbf24"],
              ["Dev", "right-1/4 top-1/3", "#34d399"],
              ["Omar", "right-1/4 bottom-10", "#f97316"],
            ].map(([name, position, color]) => (
              <div key={name} className={`absolute ${position}`}>
                <div className="relative">
                  <span className="block h-3 w-3 rounded-full border border-white/40" style={{ backgroundColor: String(color), boxShadow: `0 0 12px ${String(color)}66` }} />
                  <span className="absolute left-1/2 top-3.5 -translate-x-1/2 whitespace-nowrap rounded bg-black/55 px-1.5 py-0.5 text-[9px] text-slate-200">
                    {name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="col-span-3 p-3 lg:col-span-3">
          <p className="mb-2 text-[11px] uppercase tracking-wide text-slate-400">Inspector</p>
          <div className="space-y-2 rounded-lg border border-white/10 bg-white/[0.02] p-3">
            <p className="text-sm font-medium text-white">Kai</p>
            <p className="text-xs text-slate-300">coder · Claude</p>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <p className="text-slate-500">Status</p>
                <p className="text-sky-200">coding</p>
              </div>
              <div>
                <p className="text-slate-500">Progress</p>
                <p className="text-slate-100">56%</p>
              </div>
              <div>
                <p className="text-slate-500">Tokens</p>
                <p className="font-mono text-slate-100">19.3k</p>
              </div>
              <div>
                <p className="text-slate-500">Cost</p>
                <p className="font-mono text-slate-100">$0.52</p>
              </div>
            </div>
            <p className="text-[11px] text-slate-400">Editing DashboardShell.tsx</p>
          </div>
        </aside>
      </div>

      <div className="flex items-center justify-between border-t border-white/10 bg-[#0c121c] px-4 py-2 text-[11px] text-slate-300">
        <div className="flex items-center gap-2">
          <span className="rounded border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 text-emerald-200">Live</span>
          <span>Run: launch checklist</span>
        </div>
        <div className="flex items-center gap-3 font-mono text-slate-400">
          <span>events 248</span>
          <span>tokens 141k</span>
          <span>cost $2.31</span>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="surface-panel rounded-xl p-5">
      <h3 className="text-base font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm text-slate-300">{body}</p>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicNav />

      <main>
        <section className="px-4 pb-16 pt-16 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-7xl text-center">
            <h1 className="mx-auto max-w-4xl text-4xl font-semibold tracking-tight text-white sm:text-5xl"
            >
              See what your AI agents are doing.
            </h1>
            <p className="mx-auto mt-5 max-w-3xl text-base text-slate-300 sm:text-lg">
              Veyn turns agent runs from Claude, OpenAI, LangGraph, and custom systems into a live spatial command
              center - so teams can observe, debug, replay, and control work in real time.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href="/room" className="inline-flex items-center rounded-md bg-[#5fa4ff] px-4 py-2.5 text-sm font-medium text-[#f6fbff] hover:bg-[#74b1ff]">
                <PlayCircle className="mr-2 h-4 w-4" />
                View live demo
              </Link>
              <Link href="/app/integrations" className="inline-flex items-center rounded-md border border-white/20 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-slate-200 hover:bg-white/[0.07]">
                <Link2 className="mr-2 h-4 w-4" />
                Connect your first agent
              </Link>
            </div>

            <p className="mt-4 text-xs text-slate-400">API keys stay encrypted and server-side. Webhooks are signed.</p>
          </div>

          <div className="mx-auto mt-12 max-w-7xl">
            <HeroFrame />
          </div>
        </section>

        <section className="border-y border-white/10 bg-[#0c1119] px-4 py-16 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-3xl font-semibold text-white">Agent work is becoming invisible.</h2>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <FeatureCard
                title="Logs do not show coordination."
                body="Multi-agent runs create thousands of events, but the actual flow of work is hard to understand."
              />
              <FeatureCard
                title="Humans lose control."
                body="When agents switch tools, delegate work, or hit blockers, supervisors need live context."
              />
              <FeatureCard
                title="Replay is missing."
                body="Teams need to rewind a run, inspect decisions, and understand what changed."
              />
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-3xl font-semibold text-white">A control room for agent operations.</h2>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="surface-panel rounded-xl p-4">
                <p className="mb-3 text-xs uppercase tracking-wide text-slate-400">Provider events</p>
                <div className="space-y-2 text-sm text-slate-200">
                  {"Claude OpenAI LangGraph GitHub Vercel Webhook".split(" ").map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <CircleDashed className="h-3.5 w-3.5 text-sky-300" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
              <div className="surface-panel rounded-xl p-4">
                <p className="mb-3 text-xs uppercase tracking-wide text-slate-400">Veyn event engine</p>
                <div className="space-y-2 text-sm text-slate-200">
                  {"normalize route store replay cost state".split(" ").map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <Waypoints className="h-3.5 w-3.5 text-cyan-300" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
              <div className="surface-panel rounded-xl p-4">
                <p className="mb-3 text-xs uppercase tracking-wide text-slate-400">Spatial room</p>
                <div className="space-y-2 text-sm text-slate-200">
                  {"agents zones tasks tools logs".split(" ").map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <ArrowRight className="h-3.5 w-3.5 text-emerald-300" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-white/10 bg-[#0c1119] px-4 py-16 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-3xl font-semibold text-white">Feature set</h2>
            <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                title="Spatial observability"
                body="Agents appear where work is happening - research, coding, review, deployment, or incident response."
              />
              <FeatureCard
                title="Live agent state"
                body="Track task, status, model, tool, tokens, cost, and blockers as they change."
              />
              <FeatureCard
                title="Replay every run"
                body="Scrub through previous runs and inspect how agents moved through the workflow."
              />
              <FeatureCard
                title="Human controls"
                body="Pause, redirect, assign work, approve actions, or stop a runaway run."
              />
              <FeatureCard
                title="Provider connections"
                body="Connect Claude, OpenAI, LangGraph, GitHub, Vercel, or a signed webhook."
              />
              <FeatureCard
                title="Team scale"
                body="Support many agents per role, clustered by zone and project."
              />
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-2xl font-semibold text-white">Integrations</h2>
            <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {[
                ["Claude", "API key", "connected"],
                ["OpenAI", "API key", "connected"],
                ["LangGraph", "Webhook", "needs attention"],
                ["GitHub", "OAuth", "connected"],
                ["Vercel", "OAuth", "connected"],
                ["Custom Webhook", "Webhook", "connected"],
              ].map(([name, method, status]) => (
                <div key={name} className="surface-panel rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-white">{name}</p>
                    <span className="rounded border border-white/20 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-slate-300">
                      {status}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-300">Connection method: {method}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-white/10 bg-[#0c1119] px-4 py-16 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-3xl font-semibold text-white">Built for real agent infrastructure.</h2>
            <div className="mt-8 grid gap-3 md:grid-cols-2">
              {[
                "Encrypted provider keys",
                "Server-side provider calls",
                "Webhook signing",
                "Workspace roles",
                "Audit trail",
                "Data retention controls",
              ].map((item) => (
                <div key={item} className="surface-panel flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-slate-200">
                  <ShieldCheck className="h-4 w-4 text-emerald-300" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-20 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-3xl rounded-2xl border border-sky-500/20 bg-sky-500/10 p-8 text-center">
            <h2 className="text-3xl font-semibold text-white">Bring your agents into the room.</h2>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link href="/signup" className="inline-flex items-center rounded-md bg-[#5fa4ff] px-4 py-2.5 text-sm font-medium text-[#f6fbff] hover:bg-[#74b1ff]">
                Start free
              </Link>
              <Link href="/room" className="inline-flex items-center rounded-md border border-white/25 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-slate-100 hover:bg-white/[0.08]">
                View demo
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
