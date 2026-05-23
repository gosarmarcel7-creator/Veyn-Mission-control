"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  PauseCircle,
  Plus,
  Radio,
  Route,
  ShieldAlert,
  Users,
  Waves,
  Link2,
} from "lucide-react";
import { toast } from "sonner";
import { useRoomStore } from "@/lib/store";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

export function CommandMenu() {
  const router = useRouter();
  const {
    commandMenuOpen,
    setCommandMenuOpen,
    agents,
    spawnTeam,
    pauseAgent,
    setSelectedAgentId,
    assignTaskToAgent,
  } = useRoomStore();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandMenuOpen(true);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [setCommandMenuOpen]);

  const execute = (callback: () => void) => {
    setCommandMenuOpen(false);
    setTimeout(callback, 50);
  };

  return (
    <CommandDialog open={commandMenuOpen} onOpenChange={setCommandMenuOpen}>
      <CommandInput placeholder="Search commands" />
      <CommandList>
        <CommandEmpty>No command found.</CommandEmpty>

        <CommandGroup heading="Quick Actions">
          <CommandItem
            onSelect={() =>
              execute(() => {
                const first = agents[0];
                if (!first) return;
                setSelectedAgentId(first.id);
                router.push("/agents");
                toast.success(`Selected ${first.name}.`);
              })
            }
          >
            <Plus className="mr-2 h-4 w-4" />
            Create agent
          </CommandItem>

          <CommandItem
            onSelect={() =>
              execute(() => {
                spawnTeam();
                toast.success("Spawned team in demo mode.");
              })
            }
          >
            <Users className="mr-2 h-4 w-4" />
            Spawn team
          </CommandItem>

          <CommandItem
            onSelect={() =>
              execute(() => {
                const first = agents[0];
                if (!first) return;
                assignTaskToAgent(first.id, "Take ownership of launch incident follow-up");
                toast.success(`Assigned task to ${first.name}.`);
              })
            }
          >
            <Route className="mr-2 h-4 w-4" />
            Assign task
          </CommandItem>

          <CommandItem onSelect={() => execute(() => router.push("/app/integrations"))}>
            <Link2 className="mr-2 h-4 w-4" />
            Connect provider
          </CommandItem>

          <CommandItem onSelect={() => execute(() => router.push("/timeline"))}>
            <Radio className="mr-2 h-4 w-4" />
            Open timeline
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Control">
          <CommandItem
            onSelect={() =>
              execute(() => {
                agents.forEach((agent) => pauseAgent(agent.id));
                toast.warning("Paused all agents.");
              })
            }
          >
            <PauseCircle className="mr-2 h-4 w-4" />
            Pause all agents
          </CommandItem>

          <CommandItem
            onSelect={() =>
              execute(() => {
                const blocked = agents.filter((agent) => agent.status === "blocked");
                if (blocked.length === 0) {
                  toast.info("No blocked agents.");
                  return;
                }
                toast.warning(`Blocked agents: ${blocked.map((agent) => agent.name).join(", ")}`);
              })
            }
          >
            <ShieldAlert className="mr-2 h-4 w-4" />
            Show blocked agents
          </CommandItem>

          <CommandItem
            onSelect={() =>
              execute(() => {
                router.push("/timeline");
                toast.info("Opened replay for latest run.");
              })
            }
          >
            <Waves className="mr-2 h-4 w-4" />
            Replay last run
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
