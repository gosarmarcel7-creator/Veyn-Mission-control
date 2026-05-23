import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { AgentRole, AgentStatus, ConnectionStatus, TaskPriority, AgentZone } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function statusColor(status: AgentStatus): string {
  switch (status) {
    case "thinking":
      return "text-blue-300";
    case "using_tool":
      return "text-cyan-300";
    case "coding":
      return "text-sky-300";
    case "reviewing":
      return "text-amber-300";
    case "blocked":
      return "text-orange-300";
    case "done":
      return "text-emerald-300";
    case "paused":
      return "text-slate-400";
    case "idle":
    default:
      return "text-slate-400";
  }
}

export function statusDotColor(status: AgentStatus): string {
  switch (status) {
    case "thinking":
      return "bg-blue-400";
    case "using_tool":
      return "bg-cyan-400";
    case "coding":
      return "bg-sky-400";
    case "reviewing":
      return "bg-amber-400";
    case "blocked":
      return "bg-orange-400";
    case "done":
      return "bg-emerald-400";
    case "paused":
      return "bg-slate-500";
    case "idle":
    default:
      return "bg-slate-500";
  }
}

export function roleColor(role: AgentRole): string {
  switch (role) {
    case "manager":
      return "text-blue-300";
    case "researcher":
      return "text-cyan-300";
    case "coder":
      return "text-sky-300";
    case "reviewer":
      return "text-amber-300";
    case "deployment":
      return "text-emerald-300";
    case "analyst":
      return "text-violet-300";
    case "support":
      return "text-indigo-300";
    case "custom":
    default:
      return "text-slate-300";
  }
}

export function roleBadgeColor(role: AgentRole): string {
  switch (role) {
    case "manager":
      return "border-blue-500/30 bg-blue-500/10 text-blue-200";
    case "researcher":
      return "border-cyan-500/30 bg-cyan-500/10 text-cyan-200";
    case "coder":
      return "border-sky-500/30 bg-sky-500/10 text-sky-200";
    case "reviewer":
      return "border-amber-500/30 bg-amber-500/10 text-amber-200";
    case "deployment":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-200";
    case "analyst":
      return "border-violet-500/30 bg-violet-500/10 text-violet-200";
    case "support":
      return "border-indigo-500/30 bg-indigo-500/10 text-indigo-200";
    default:
      return "border-slate-500/30 bg-slate-500/10 text-slate-200";
  }
}

export function zoneLabel(zone: AgentZone): string {
  switch (zone) {
    case "planning":
      return "Planning";
    case "research":
      return "Research";
    case "coding":
      return "Coding";
    case "review":
      return "Review";
    case "deployment":
      return "Deployment";
    case "incident":
      return "Incident";
    case "lounge":
    default:
      return "Lounge";
  }
}

export function zoneBadgeColor(zone: AgentZone): string {
  switch (zone) {
    case "planning":
      return "border-blue-500/25 text-blue-200 bg-blue-500/10";
    case "research":
      return "border-cyan-500/25 text-cyan-200 bg-cyan-500/10";
    case "coding":
      return "border-sky-500/25 text-sky-200 bg-sky-500/10";
    case "review":
      return "border-amber-500/25 text-amber-200 bg-amber-500/10";
    case "deployment":
      return "border-emerald-500/25 text-emerald-200 bg-emerald-500/10";
    case "incident":
      return "border-orange-500/25 text-orange-200 bg-orange-500/10";
    case "lounge":
    default:
      return "border-slate-500/25 text-slate-200 bg-slate-500/10";
  }
}

export function priorityColor(priority: TaskPriority): string {
  switch (priority) {
    case "urgent":
      return "text-orange-200 border-orange-500/40 bg-orange-500/10";
    case "high":
      return "text-amber-200 border-amber-500/40 bg-amber-500/10";
    case "medium":
      return "text-cyan-200 border-cyan-500/35 bg-cyan-500/10";
    case "low":
    default:
      return "text-slate-200 border-slate-500/35 bg-slate-500/10";
  }
}

export function connectionStatusColor(status: ConnectionStatus): string {
  switch (status) {
    case "connected":
      return "text-emerald-300";
    case "needs_attention":
      return "text-amber-300";
    case "disconnected":
      return "text-orange-300";
    default:
      return "text-slate-300";
  }
}

export function formatCost(usd: number): string {
  if (usd < 0.01) return `$${usd.toFixed(4)}`;
  if (usd < 1) return `$${usd.toFixed(3)}`;
  return `$${usd.toFixed(2)}`;
}

export function formatTokens(tokens: number): string {
  if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(1)}M`;
  if (tokens >= 1000) return `${(tokens / 1000).toFixed(1)}k`;
  return `${tokens}`;
}

export function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const sec = Math.max(0, Math.floor(diffMs / 1000));

  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  return `${day}d ago`;
}

export function dateTimeLabel(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function initials(name: string) {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 1).toUpperCase();
  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}
