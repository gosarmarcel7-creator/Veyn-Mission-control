"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Eye, EyeOff, Focus, Grid3X3, Orbit, Route, Scan } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { RoomCanvas } from "@/components/room/RoomCanvas";
const TerminalWorkspace = dynamic(
  () => import("@/components/terminal/TerminalWorkspace").then((m) => m.TerminalWorkspace),
  { ssr: false }
);
import { useDemoSimulation } from "@/hooks/useDemoSimulation";
import { useRoomStore } from "@/lib/store";
import { useTerminalStore } from "@/lib/terminal-store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function RoomPage() {
  useDemoSimulation();

  const {
    selectedAgentId,
    selectedZone,
    roomSettings,
    updateRoomSettings,
    setSelectedZone,
    isDemoMode,
  } = useRoomStore();
  const { sessions } = useTerminalStore();

  const cameraMode = roomSettings.cameraMode;
  const showAgents = sessions.length === 0;

  return (
    <AppShell showSidebars showTimeline>
      <div className="relative h-full w-full overflow-hidden">
        {showAgents ? <RoomCanvas /> : <TerminalWorkspace />}

        {showAgents && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="pointer-events-none absolute left-3 top-3 z-20 flex w-[min(560px,calc(100%-1.5rem))] flex-wrap items-center gap-2 rounded-lg border border-white/15 bg-[#0c121d]/90 px-3 py-2 backdrop-blur"
        >
          <Scan className="h-3.5 w-3.5 text-sky-300" />
          <p className="text-xs text-slate-200">Live spatial command center for multi-agent operations.</p>
          {isDemoMode && (
            <span className="rounded border border-sky-500/25 bg-sky-500/10 px-2 py-0.5 text-[11px] text-sky-100">
              Demo mode
            </span>
          )}
          {!showAgents && (
            <span className="rounded border border-violet-500/25 bg-violet-500/10 px-2 py-0.5 text-[11px] text-violet-100">
              Terminal active — close all tabs to return to the agent room
            </span>
          )}
        </motion.div>
        )}

        {showAgents && (
        <div className="absolute right-3 top-3 z-20 flex flex-wrap items-center gap-1.5 rounded-lg border border-white/15 bg-[#0c121d]/90 p-1.5 backdrop-blur">
          <Button
            size="icon"
            variant="ghost"
            className={cn("h-8 w-8", roomSettings.showLabels ? "bg-white/10 text-white" : "text-slate-300")}
            onClick={() => updateRoomSettings({ showLabels: !roomSettings.showLabels })}
            aria-label="Toggle labels"
          >
            {roomSettings.showLabels ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </Button>

          <Button
            size="icon"
            variant="ghost"
            className={cn("h-8 w-8", roomSettings.showZones ? "bg-white/10 text-white" : "text-slate-300")}
            onClick={() => updateRoomSettings({ showZones: !roomSettings.showZones })}
            aria-label="Toggle zones"
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>

          <Button
            size="icon"
            variant="ghost"
            className={cn("h-8 w-8", roomSettings.showTrails ? "bg-white/10 text-white" : "text-slate-300")}
            onClick={() => updateRoomSettings({ showTrails: !roomSettings.showTrails })}
            aria-label="Toggle collaboration lines"
          >
            <Route className="h-4 w-4" />
          </Button>

          <Button
            size="sm"
            variant={cameraMode === "orbit" ? "default" : "ghost"}
            className="h-8"
            onClick={() => updateRoomSettings({ cameraMode: "orbit", followAgentId: undefined })}
          >
            <Orbit className="mr-1.5 h-3.5 w-3.5" />
            Reset view
          </Button>

          <Button
            size="sm"
            variant={cameraMode === "topdown" ? "default" : "ghost"}
            className="h-8"
            onClick={() => updateRoomSettings({ cameraMode: "topdown", followAgentId: undefined })}
          >
            Top-down
          </Button>

          <Button
            size="sm"
            variant={cameraMode === "follow" ? "default" : "ghost"}
            className="h-8"
            onClick={() =>
              updateRoomSettings({
                cameraMode: "follow",
                followAgentId: selectedAgentId ?? undefined,
              })
            }
            disabled={!selectedAgentId}
          >
            Follow selected
          </Button>

          <Button
            size="sm"
            variant="ghost"
            className="h-8"
            onClick={() => {
              if (selectedZone) {
                setSelectedZone(null);
                updateRoomSettings({ cameraMode: "orbit" });
                return;
              }
              setSelectedZone("planning");
              updateRoomSettings({ cameraMode: "orbit" });
            }}
          >
            <Focus className="mr-1.5 h-3.5 w-3.5" />
            {selectedZone ? "Clear zone focus" : "Focus zone"}
          </Button>
        </div>
        )}
      </div>
    </AppShell>
  );
}
