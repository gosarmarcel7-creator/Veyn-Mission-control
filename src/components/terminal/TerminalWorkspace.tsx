"use client";

import Link from "next/link";
import { TerminalSquare, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { isElectronDesktop, useTerminalStore } from "@/lib/terminal-store";
import { ElectronTerminal } from "./ElectronTerminal";

export function TerminalWorkspace() {
  const { sessions, activeSessionId, setActiveSession, closeSession } = useTerminalStore();
  const desktop = isElectronDesktop();

  if (!desktop) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 bg-[#080b12] p-8 text-center">
        <TerminalSquare className="h-12 w-12 text-sky-300" />
        <div>
          <h2 className="text-lg font-semibold text-white">Terminals require the desktop app</h2>
          <p className="mt-2 max-w-md text-sm text-slate-300">
            Download Veyn from GitHub Releases to spawn local shells. The web app still supports agents, integrations, and webhooks.
          </p>
        </div>
        <Button asChild>
          <Link
            href={
              process.env.NEXT_PUBLIC_GITHUB_REPO ??
              "https://github.com/search?q=ai-agent-mission-control&type=repositories"
            }
          >
            Download from GitHub
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-[#080b12]">
      <div className="flex items-center gap-1 border-b border-white/10 px-2 py-1.5">
        {sessions.map((session) => (
          <button
            key={session.id}
            type="button"
            onClick={() => setActiveSession(session.id)}
            className={cn(
              "flex max-w-[200px] items-center gap-1.5 rounded-md px-2 py-1 text-xs",
              activeSessionId === session.id
                ? "bg-white/10 text-white"
                : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
            )}
          >
            <TerminalSquare className="h-3 w-3 shrink-0" />
            <span className="truncate">{session.title}</span>
            <span
              role="button"
              tabIndex={0}
              className="ml-1 rounded p-0.5 hover:bg-white/10"
              onClick={(event) => {
                event.stopPropagation();
                void window.veyn?.terminal.kill(session.id);
                closeSession(session.id);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.stopPropagation();
                  void window.veyn?.terminal.kill(session.id);
                  closeSession(session.id);
                }
              }}
            >
              <X className="h-3 w-3" />
            </span>
          </button>
        ))}
      </div>

      <div className="relative min-h-0 flex-1">
        {sessions.map((session) => (
          <div
            key={session.id}
            className={cn(
              "absolute inset-0",
              activeSessionId === session.id ? "visible" : "invisible pointer-events-none"
            )}
          >
            <ElectronTerminal sessionId={session.id} active={activeSessionId === session.id} />
          </div>
        ))}
      </div>
    </div>
  );
}
