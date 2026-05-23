"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { VeynMark } from "@/components/brand/VeynMark";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      toast.info("Auth is running in demo mode. Redirecting to dashboard.");
      router.push("/dashboard");
    }, 700);
  };

  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-2">
      <aside className="hidden border-r border-white/10 bg-[#0b111a] p-8 lg:block">
        <div className="flex h-full flex-col">
          <VeynMark />
          <div className="mt-12 rounded-2xl border border-white/10 bg-[#0f1622] p-5">
            <h2 className="text-2xl font-semibold text-white">See what your AI agents are doing.</h2>
            <p className="mt-3 text-sm text-slate-300">
              Live state for agent work across providers, tools, and deployments.
            </p>

            <div className="mt-6 rounded-xl border border-white/10 bg-[#0b1018] p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">Room preview</p>
              <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-slate-200">
                <div className="rounded border border-white/10 bg-white/[0.03] p-2">Agents: 15</div>
                <div className="rounded border border-white/10 bg-white/[0.03] p-2">Events: 248</div>
                <div className="rounded border border-white/10 bg-white/[0.03] p-2">Cost: $2.31</div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex items-center justify-center p-6 sm:p-10">
        <Card className="w-full max-w-md border-white/10 bg-[#0f1622]">
          <CardHeader>
            <CardTitle className="text-2xl text-white">Login</CardTitle>
            <p className="text-sm text-slate-300">
              Sign in to your workspace. No provider passwords required.
            </p>
          </CardHeader>
          <CardContent>
            <form className="space-y-3" onSubmit={onSubmit}>
              <Input
                type="email"
                placeholder="Work email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="border-white/15 bg-white/[0.03]"
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                className="border-white/15 bg-white/[0.03]"
              />
              <Button className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign in"}
              </Button>
            </form>

            <div className="mt-3 text-right">
              <Link href="#" className="text-xs text-sky-300 hover:text-sky-200">
                Forgot password
              </Link>
            </div>

            <Separator className="my-4 bg-white/10" />

            <div className="space-y-2">
              <Button variant="outline" className="w-full border-white/20 bg-white/[0.02]" onClick={() => toast.info("Google OAuth stub")}>Continue with Google</Button>
              <Button variant="outline" className="w-full border-white/20 bg-white/[0.02]" onClick={() => toast.info("GitHub OAuth stub")}>Continue with GitHub</Button>
            </div>

            <p className="mt-4 text-center text-sm text-slate-300">
              New to Veyn?{" "}
              <Link href="/signup" className="text-sky-300 hover:text-sky-200">
                Create account
              </Link>
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
