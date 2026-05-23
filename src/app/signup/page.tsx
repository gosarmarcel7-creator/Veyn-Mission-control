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

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [workspace, setWorkspace] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      toast.success("Workspace created in demo mode.");
      router.push("/room");
    }, 800);
  };

  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-2">
      <main className="flex items-center justify-center p-6 sm:p-10">
        <Card className="w-full max-w-md border-white/10 bg-[#0f1622]">
          <CardHeader>
            <VeynMark className="mb-2" compact />
            <CardTitle className="text-2xl text-white">Create account</CardTitle>
            <p className="text-sm text-slate-300">Start a workspace and open the live room in minutes.</p>
          </CardHeader>
          <CardContent>
            <form className="space-y-3" onSubmit={onSubmit}>
              <Input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                className="border-white/15 bg-white/[0.03]"
              />
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
                minLength={8}
                className="border-white/15 bg-white/[0.03]"
              />
              <Input
                type="text"
                placeholder="Workspace name"
                value={workspace}
                onChange={(event) => setWorkspace(event.target.value)}
                required
                className="border-white/15 bg-white/[0.03]"
              />
              <Button className="w-full" disabled={loading}>
                {loading ? "Creating workspace..." : "Create account"}
              </Button>
            </form>

            <Separator className="my-4 bg-white/10" />

            <div className="space-y-2">
              <Button variant="outline" className="w-full border-white/20 bg-white/[0.02]" onClick={() => toast.info("Google OAuth stub")}>Continue with Google</Button>
              <Button variant="outline" className="w-full border-white/20 bg-white/[0.02]" onClick={() => toast.info("GitHub OAuth stub")}>Continue with GitHub</Button>
            </div>

            <p className="mt-4 text-center text-xs text-slate-400">
              By signing up, you agree to our terms and privacy policy.
            </p>

            <p className="mt-3 text-center text-sm text-slate-300">
              Already have an account?{" "}
              <Link href="/login" className="text-sky-300 hover:text-sky-200">
                Login
              </Link>
            </p>
          </CardContent>
        </Card>
      </main>

      <aside className="hidden border-l border-white/10 bg-[#0b111a] p-8 lg:block">
        <div className="flex h-full flex-col justify-center">
          <h2 className="text-3xl font-semibold text-white">Spatial observability for AI agent teams.</h2>
          <p className="mt-4 text-sm text-slate-300">
            Connect providers, route events, replay runs, and apply controls before agents continue.
          </p>
          <div className="mt-8 rounded-xl border border-white/10 bg-[#0f1622] p-4 text-sm text-slate-200">
            <p className="font-medium text-white">Demo mode includes</p>
            <ul className="mt-2 space-y-1 text-slate-300">
              <li>- 15+ agents and live updates</li>
              <li>- Timeline replay and inspector</li>
              <li>- Provider connection flows</li>
            </ul>
          </div>
        </div>
      </aside>
    </div>
  );
}
