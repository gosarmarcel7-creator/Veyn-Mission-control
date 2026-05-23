import { PublicNav } from "@/components/layout/PublicNav";

const SECTIONS = [
  {
    title: "Overview",
    body: "Veyn is designed for secure agent operations with server-side execution boundaries and clear auditability.",
  },
  {
    title: "Secret handling",
    body: "Veyn never asks for ChatGPT or Claude passwords. Provider access uses API keys or OAuth where supported.",
  },
  {
    title: "API key encryption",
    body: "API keys are encrypted and only used server-side.",
  },
  {
    title: "Server-side provider calls",
    body: "Provider calls are proxied through secure backend routes and not exposed in browser runtime.",
  },
  {
    title: "Webhook signatures",
    body: "Webhook ingest routes can validate signing secrets before accepting events.",
  },
  {
    title: "Workspace access control",
    body: "Workspaces can manage members and roles for owner, admin, member, and viewer access.",
  },
  {
    title: "Audit logs",
    body: "Connection changes, task control actions, and replay operations can be written to an audit trail.",
  },
  {
    title: "Data retention",
    body: "Retention windows are configurable by plan and environment. Enterprise tiers can define custom retention controls.",
  },
  {
    title: "Provider permissions",
    body: "Only requested scopes are used for OAuth providers. API keys are scoped by provider policy.",
  },
  {
    title: "Enterprise controls",
    body: "Designed for SSO integration, private networking patterns, and stricter governance workflows.",
  },
];

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicNav />

      <main className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:px-10">
        <header className="max-w-3xl">
          <h1 className="text-4xl font-semibold tracking-tight text-white">Security</h1>
          <p className="mt-4 text-lg text-slate-300">
            Security posture for provider keys, event ingest, and workspace operations.
          </p>
        </header>

        <div className="mt-8 grid gap-3 md:grid-cols-2">
          {SECTIONS.map((section) => (
            <section key={section.title} className="rounded-xl border border-white/10 bg-[#0f1622] p-4">
              <h2 className="text-lg font-semibold text-white">{section.title}</h2>
              <p className="mt-2 text-sm text-slate-300">{section.body}</p>
            </section>
          ))}
        </div>

        <p className="mt-6 text-sm text-slate-400">
          Veyn is designed for secure infrastructure operations. Compliance programs depend on deployment architecture and
          organizational controls.
        </p>
      </main>
    </div>
  );
}
