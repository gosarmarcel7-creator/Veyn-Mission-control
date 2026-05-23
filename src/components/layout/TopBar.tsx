"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Bell,
  Command,
  Link2,
  Menu,
  PanelRight,
  Search,
  Settings,
  Users,
} from "lucide-react";
import { useRoomStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { VeynMark } from "@/components/brand/VeynMark";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

const APP_NAV = [
  { label: "Room", href: "/room" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Agents", href: "/agents" },
  { label: "Tasks", href: "/tasks" },
  { label: "Timeline", href: "/timeline" },
  { label: "Integrations", href: "/app/integrations" },
  { label: "Analytics", href: "/analytics" },
  { label: "Settings", href: "/settings" },
];

interface TopBarProps {
  showSidebars?: boolean;
}

export function TopBar({ showSidebars = false }: TopBarProps) {
  const pathname = usePathname();
  const {
    workspace,
    agents,
    liveMode,
    setCommandMenuOpen,
    setLeftSidebarOpen,
    setRightSidebarOpen,
  } = useRoomStore();

  const activeAgents = agents.filter((agent) => !["idle", "done", "paused"].includes(agent.status)).length;

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center border-b border-white/10 bg-[#090d15]/95 px-3 backdrop-blur sm:px-4">
      <div className="flex w-full items-center gap-3">
        <div className="flex items-center gap-2">
          {showSidebars && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 lg:hidden"
              onClick={() => setLeftSidebarOpen(true)}
              aria-label="Open agent sidebar"
            >
              <Menu className="h-4 w-4" />
            </Button>
          )}

          <Link href="/dashboard" className="shrink-0">
            <VeynMark />
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 gap-2 text-xs text-slate-300 hover:text-white">
                <Users className="h-3.5 w-3.5" />
                {workspace.name}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 border-white/10 bg-[#0f1622]">
              <DropdownMenuItem className="flex items-center justify-between text-xs">
                <span>{workspace.name}</span>
                <Badge variant="secondary" className="h-5 text-[10px] uppercase">
                  {workspace.plan}
                </Badge>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-xs">Create workspace</DropdownMenuItem>
              <DropdownMenuItem className="text-xs">Switch workspace</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <nav className="hidden items-center gap-1 lg:flex">
          {APP_NAV.map((item) => {
            const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-2.5 py-1.5 text-sm transition-colors",
                  active ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/6 hover:text-white"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="hidden h-8 border-white/15 bg-white/5 text-slate-200 md:inline-flex"
            onClick={() => setCommandMenuOpen(true)}
          >
            <Search className="mr-2 h-3.5 w-3.5" />
            Command
            <span className="ml-2 rounded border border-white/20 px-1 font-mono text-[10px]">⌘K</span>
          </Button>

          <Button asChild variant="outline" size="sm" className="h-8 border-white/15 bg-white/5 text-slate-200">
            <Link href="/app/integrations">
              <Link2 className="mr-1.5 h-3.5 w-3.5" />
              Connect
            </Link>
          </Button>

          <Badge
            variant="outline"
            className={cn(
              "hidden h-7 items-center gap-1 border px-2 text-[11px] md:inline-flex",
              liveMode ? "border-emerald-500/40 text-emerald-300" : "border-slate-500/40 text-slate-300"
            )}
          >
            <span className={cn("h-1.5 w-1.5 rounded-full", liveMode ? "bg-emerald-400" : "bg-slate-400")} />
            {liveMode ? "Live" : "Replay"}
          </Badge>

          <Badge variant="secondary" className="hidden h-7 px-2 text-[11px] md:inline-flex">
            <Activity className="mr-1 h-3.5 w-3.5" />
            {activeAgents} active
          </Badge>

          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-white">
            <Bell className="h-4 w-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8 border border-white/15">
                  <AvatarImage src="" alt="User" />
                  <AvatarFallback className="bg-[#182436] text-xs text-sky-100">MG</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 border-white/10 bg-[#0f1622]">
              <DropdownMenuItem asChild className="text-xs">
                <Link href="/settings">
                  <Settings className="mr-2 h-3.5 w-3.5" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-xs" onClick={() => setCommandMenuOpen(true)}>
                <Command className="mr-2 h-3.5 w-3.5" />
                Open command menu
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {showSidebars && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 lg:hidden"
              onClick={() => setRightSidebarOpen(true)}
              aria-label="Open inspector"
            >
              <PanelRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
