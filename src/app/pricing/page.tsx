import { PublicNav } from "@/components/layout/PublicNav";
import { Button } from "@/components/ui/button";

const PLANS = [
  {
    name: "Free",
    price: "$0",
    subtitle: "For evaluation",
    features: ["Demo room", "1 workspace", "Custom webhook", "Limited events", "Basic replay"],
    cta: "Start free",
  },
  {
    name: "Pro",
    price: "$49",
    subtitle: "Per workspace / month",
    features: [
      "Multiple providers",
      "More events",
      "Timeline replay",
      "Analytics",
      "Team members",
      "Agent controls",
    ],
    cta: "Start Pro",
    recommended: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    subtitle: "Annual contract",
    features: [
      "SSO placeholder",
      "Audit logs",
      "Custom retention",
      "Advanced security controls",
      "Dedicated support",
      "Custom limits",
    ],
    cta: "Contact sales",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicNav />

      <main className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-10">
        <header className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-semibold tracking-tight text-white">Pricing</h1>
          <p className="mt-4 text-lg text-slate-300">Choose a plan based on event volume, provider count, and team size.</p>
        </header>

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {PLANS.map((plan) => (
            <article
              key={plan.name}
              className={`rounded-xl border p-5 ${
                plan.recommended
                  ? "border-sky-500/35 bg-sky-500/10"
                  : "border-white/10 bg-[#0f1622]"
              }`}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">{plan.name}</h2>
                {plan.recommended && (
                  <span className="rounded border border-sky-400/40 bg-sky-500/15 px-2 py-0.5 text-xs text-sky-100">
                    Recommended
                  </span>
                )}
              </div>
              <p className="mt-4 text-4xl font-semibold text-white">{plan.price}</p>
              <p className="mt-1 text-sm text-slate-400">{plan.subtitle}</p>

              <ul className="mt-6 space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-slate-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-sky-300" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button className="mt-6 w-full" variant={plan.recommended ? "default" : "outline"}>
                {plan.cta}
              </Button>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
