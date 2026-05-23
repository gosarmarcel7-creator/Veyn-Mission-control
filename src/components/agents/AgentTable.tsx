"use client";

import { useMemo, useState } from "react";
import { MoreHorizontal, Search } from "lucide-react";
import { toast } from "sonner";
import { useRoomStore } from "@/lib/store";
import {
  formatCost,
  formatTokens,
  roleBadgeColor,
  statusColor,
  statusDotColor,
  timeAgo,
} from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AgentDrawer } from "./AgentDrawer";
import type { AgentStatus, AgentRole, AgentProviderType } from "@/lib/types";

const AGENT_ROLES: AgentRole[] = [
  "manager",
  "researcher",
  "coder",
  "reviewer",
  "deployment",
  "analyst",
  "support",
  "custom",
];

const AGENT_PROVIDERS: AgentProviderType[] = ["openai", "anthropic", "github", "vercel", "langgraph", "custom"];
const AGENT_STATUSES: AgentStatus[] = ["idle", "thinking", "using_tool", "coding", "reviewing", "blocked", "done", "paused"];

export function AgentTable() {
  const { agents, agentFilters, setAgentFilters, pauseAgent, resumeAgent, assignTaskToAgent } = useRoomStore();
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);

  const filteredAgents = useMemo(() => {
    return agents.filter((agent) => {
      if (agentFilters.search) {
        const query = agentFilters.search.toLowerCase();
        const matches =
          agent.name.toLowerCase().includes(query) ||
          agent.role.toLowerCase().includes(query) ||
          agent.provider.toLowerCase().includes(query) ||
          (agent.currentTask ?? "").toLowerCase().includes(query);
        if (!matches) return false;
      }
      if (agentFilters.role && agent.role !== agentFilters.role) return false;
      if (agentFilters.provider && agent.provider !== agentFilters.provider) return false;
      if (agentFilters.model && agent.model !== agentFilters.model) return false;
      if (agentFilters.status && agent.status !== agentFilters.status) return false;
      return true;
    });
  }, [agents, agentFilters]);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 px-4 py-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
          <Input
            value={agentFilters.search ?? ""}
            onChange={(event) => setAgentFilters({ ...agentFilters, search: event.target.value })}
            placeholder="Search"
            className="h-8 w-48 border-white/15 bg-white/[0.03] pl-7 text-xs"
          />
        </div>

        <Select
          value={agentFilters.role ?? "all"}
          onValueChange={(value) =>
            setAgentFilters({
              ...agentFilters,
              role: !value || value === "all" ? undefined : (value as AgentRole),
            })
          }
        >
          <SelectTrigger className="h-8 w-[130px] border-white/15 bg-white/[0.03] text-xs"><SelectValue placeholder="Role" /></SelectTrigger>
          <SelectContent className="border-white/10 bg-[#111722]">
            <SelectItem value="all">All roles</SelectItem>
            {AGENT_ROLES.map((role) => (
              <SelectItem key={role} value={role} className="capitalize">{role}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={agentFilters.provider ?? "all"}
          onValueChange={(value) =>
            setAgentFilters({
              ...agentFilters,
              provider: !value || value === "all" ? undefined : (value as AgentProviderType),
            })
          }
        >
          <SelectTrigger className="h-8 w-[130px] border-white/15 bg-white/[0.03] text-xs"><SelectValue placeholder="Provider" /></SelectTrigger>
          <SelectContent className="border-white/10 bg-[#111722]">
            <SelectItem value="all">All providers</SelectItem>
            {AGENT_PROVIDERS.map((provider) => (
              <SelectItem key={provider} value={provider}>{provider}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={agentFilters.model ?? "all"}
          onValueChange={(value) =>
            setAgentFilters({
              ...agentFilters,
              model: !value || value === "all" ? undefined : value,
            })
          }
        >
          <SelectTrigger className="h-8 w-[130px] border-white/15 bg-white/[0.03] text-xs"><SelectValue placeholder="Model" /></SelectTrigger>
          <SelectContent className="border-white/10 bg-[#111722]">
            <SelectItem value="all">All models</SelectItem>
            {["Claude", "GPT-5", "GPT-4.1", "Local", "Gemini", "Custom"].map((model) => (
              <SelectItem key={model} value={model}>{model}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={agentFilters.status ?? "all"}
          onValueChange={(value) =>
            setAgentFilters({
              ...agentFilters,
              status: !value || value === "all" ? undefined : (value as AgentStatus),
            })
          }
        >
          <SelectTrigger className="h-8 w-[130px] border-white/15 bg-white/[0.03] text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent className="border-white/10 bg-[#111722]">
            <SelectItem value="all">All status</SelectItem>
            {AGENT_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>{status.replaceAll("_", " ")}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <p className="ml-auto text-xs text-slate-400">{filteredAgents.length} agents</p>
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead>Agent</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Model</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Current task</TableHead>
              <TableHead>Tokens</TableHead>
              <TableHead>Cost</TableHead>
              <TableHead>Last active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAgents.map((agent) => (
              <TableRow key={agent.id} className="border-white/10 hover:bg-white/[0.02]">
                <TableCell>
                  <button type="button" onClick={() => setSelectedAgentId(agent.id)} className="flex items-center gap-2 text-left">
                    <span className={`h-1.5 w-1.5 rounded-full ${statusDotColor(agent.status)}`} />
                    <span className="font-medium text-white">{agent.name}</span>
                  </button>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={roleBadgeColor(agent.role)}>
                    {agent.role}
                  </Badge>
                </TableCell>
                <TableCell className="capitalize text-slate-300">{agent.provider}</TableCell>
                <TableCell className="font-mono text-slate-300">{agent.model}</TableCell>
                <TableCell className={`${statusColor(agent.status)} capitalize`}>{agent.status.replaceAll("_", " ")}</TableCell>
                <TableCell className="max-w-[260px] truncate text-slate-300">{agent.currentTask ?? "-"}</TableCell>
                <TableCell className="font-mono text-slate-300">{formatTokens(agent.tokensUsed)}</TableCell>
                <TableCell className="font-mono text-slate-300">{formatCost(agent.costUsd)}</TableCell>
                <TableCell className="text-slate-400">{timeAgo(agent.lastEventAt)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="border-white/10 bg-[#111722]">
                      <DropdownMenuItem onClick={() => setSelectedAgentId(agent.id)}>View</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => pauseAgent(agent.id)}>Pause</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => resumeAgent(agent.id)}>Resume</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => assignTaskToAgent(agent.id, `Follow-up assigned from Agents page for ${agent.name}`)}>
                        Assign task
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toast.info("Log view is available in drawer")}>Logs</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toast.info("Settings are available in drawer")}>Settings</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedAgentId && (
        <AgentDrawer agentId={selectedAgentId} open={Boolean(selectedAgentId)} onClose={() => setSelectedAgentId(null)} />
      )}
    </div>
  );
}
