"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Pause, Play, RotateCcw, SkipBack } from "lucide-react";
import { useRoomStore, applyReplaySnapshot } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const SPEEDS = [0.5, 1, 2, 4, 8];

export function BottomTimeline() {
  const {
    liveMode,
    replayMode,
    setLiveMode,
    setReplayMode,
    timelineCursor,
    setTimelineCursor,
    captureReplayBaseline,
    restoreReplayBaseline,
    currentRun,
    events,
    agents,
  } = useRoomStore();

  const [speed, setSpeed] = useState(1);
  const [replayPlaying, setReplayPlaying] = useState(false);
  const [agentFilter, setAgentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [toolFilter, setToolFilter] = useState("all");

  const eventTimestamps = useMemo(
    () => events.map((event) => new Date(event.timestamp).getTime()).filter((value) => Number.isFinite(value)),
    [events]
  );

  const fallbackStart = eventTimestamps.length > 0 ? Math.min(...eventTimestamps) : 0;
  const fallbackEnd = eventTimestamps.length > 0 ? Math.max(...eventTimestamps) : fallbackStart + 60_000;

  const runStart = currentRun?.startedAt ? new Date(currentRun.startedAt).getTime() : fallbackStart;
  const runEnd = currentRun?.endedAt ? new Date(currentRun.endedAt).getTime() : fallbackEnd;
  const duration = Math.max(1, runEnd - runStart);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      if (agentFilter !== "all" && event.agentId !== agentFilter) return false;
      if (statusFilter !== "all" && !event.eventType.includes(statusFilter)) return false;
      if (toolFilter !== "all" && event.tool !== toolFilter) return false;
      return true;
    });
  }, [events, agentFilter, statusFilter, toolFilter]);

  const cursorPercent = Math.max(0, Math.min(100, ((timelineCursor - runStart) / duration) * 100));
  const lastTickRef = useRef<number | null>(null);

  useEffect(() => {
    if (!replayMode || liveMode || !replayPlaying) {
      lastTickRef.current = null;
      return;
    }

    let rafId = 0;
    const tick = (now: number) => {
      if (lastTickRef.current === null) {
        lastTickRef.current = now;
      }
      const elapsed = now - (lastTickRef.current ?? now);
      lastTickRef.current = now;

      const delta = elapsed * speed;
      const nextCursor = Math.min(runEnd, timelineCursor + delta);
      setTimelineCursor(nextCursor);
      applyReplaySnapshot(nextCursor);

      if (nextCursor >= runEnd) {
        setReplayPlaying(false);
        return;
      }

      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, [replayMode, liveMode, replayPlaying, speed, runEnd, timelineCursor, setTimelineCursor]);

  const onScrub = (clientX: number, rect: DOMRect) => {
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const nextCursor = Math.floor(runStart + ratio * duration);
    if (liveMode) {
      captureReplayBaseline();
    }
    setTimelineCursor(nextCursor);
    setReplayMode(true);
    setLiveMode(false);
    setReplayPlaying(false);
    applyReplaySnapshot(nextCursor);
  };

  return (
    <div className="border-t border-white/10 bg-[#0b1018] px-3 py-2 sm:px-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant={liveMode ? "default" : "outline"}
            className={cn("h-7", liveMode ? "bg-emerald-500/80 text-[#07120d] hover:bg-emerald-400" : "border-white/15 bg-white/[0.03]")}
            onClick={() => {
              restoreReplayBaseline();
              setLiveMode(true);
              setReplayMode(false);
              setReplayPlaying(false);
            }}
          >
            Live
          </Button>
          <Button
            size="sm"
            variant={replayMode ? "default" : "outline"}
            className={cn("h-7", replayMode ? "bg-sky-500/80 text-[#07121b] hover:bg-sky-400" : "border-white/15 bg-white/[0.03]")}
            onClick={() => {
              if (liveMode) {
                captureReplayBaseline();
              }
              setReplayMode(true);
              setLiveMode(false);
              setReplayPlaying(false);
              applyReplaySnapshot(timelineCursor);
            }}
          >
            Replay
          </Button>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => {
            if (liveMode) {
              captureReplayBaseline();
              setLiveMode(false);
              setReplayMode(true);
              setReplayPlaying(true);
            } else {
              setReplayPlaying((value) => !value);
            }
          }}
          aria-label={liveMode || replayPlaying ? "Pause live or replay" : "Resume replay"}
        >
          {liveMode || replayPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => {
            if (liveMode) {
              captureReplayBaseline();
            }
            setTimelineCursor(runStart);
            setReplayMode(true);
            setLiveMode(false);
            setReplayPlaying(false);
            applyReplaySnapshot(runStart);
          }}
          aria-label="Jump to beginning"
        >
          <SkipBack className="h-4 w-4" />
        </Button>

        <div className="flex min-w-[220px] flex-1 items-center gap-2">
          <span className="text-[10px] font-mono text-slate-500">
            {new Date(runStart).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>

          <div
            className="group relative h-2 flex-1 cursor-pointer rounded-full bg-white/10"
            onClick={(event) => onScrub(event.clientX, event.currentTarget.getBoundingClientRect())}
            onMouseMove={(event) => {
              if (event.buttons !== 1) return;
              onScrub(event.clientX, event.currentTarget.getBoundingClientRect());
            }}
          >
            <div className="absolute inset-y-0 left-0 rounded-full bg-sky-400/45" style={{ width: `${cursorPercent}%` }} />
            {filteredEvents.slice(0, 120).map((event) => {
              const markerPercent = ((new Date(event.timestamp).getTime() - runStart) / duration) * 100;
              if (markerPercent < 0 || markerPercent > 100) return null;
              return (
                <span
                  key={event.id}
                  className="absolute top-1/2 h-2 w-0.5 -translate-y-1/2 bg-slate-300/80"
                  style={{ left: `${markerPercent}%` }}
                />
              );
            })}
            <span
              className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border border-sky-200 bg-sky-400 shadow-[0_0_12px_rgba(110,179,255,0.7)]"
              style={{ left: `calc(${cursorPercent}% - 6px)` }}
            />
          </div>

          <span className="text-[10px] font-mono text-slate-500">
            {new Date(replayMode ? timelineCursor : runEnd).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>

        <Select value={String(speed)} onValueChange={(value) => setSpeed(Number(value ?? "1"))}>
          <SelectTrigger className="h-7 w-[88px] border-white/15 bg-white/[0.03] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-white/10 bg-[#111722]">
            {SPEEDS.map((item) => (
              <SelectItem key={item} value={String(item)} className="text-xs">
                {item}x speed
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={agentFilter} onValueChange={(value) => setAgentFilter(value ?? "all")}>
          <SelectTrigger className="h-7 w-[140px] border-white/15 bg-white/[0.03] text-xs">
            <SelectValue placeholder="Filter agent" />
          </SelectTrigger>
          <SelectContent className="border-white/10 bg-[#111722]">
            <SelectItem value="all" className="text-xs">All agents</SelectItem>
            {agents.map((agent) => (
              <SelectItem key={agent.id} value={agent.id} className="text-xs">
                {agent.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value ?? "all")}>
          <SelectTrigger className="h-7 w-[130px] border-white/15 bg-white/[0.03] text-xs">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="border-white/10 bg-[#111722]">
            <SelectItem value="all" className="text-xs">All status</SelectItem>
            <SelectItem value="thinking" className="text-xs">Thinking</SelectItem>
            <SelectItem value="tool_call" className="text-xs">Tool calls</SelectItem>
            <SelectItem value="file" className="text-xs">File changes</SelectItem>
            <SelectItem value="review" className="text-xs">Review</SelectItem>
            <SelectItem value="blocked" className="text-xs">Blocked</SelectItem>
          </SelectContent>
        </Select>

        <Select value={toolFilter} onValueChange={(value) => setToolFilter(value ?? "all")}>
          <SelectTrigger className="h-7 w-[120px] border-white/15 bg-white/[0.03] text-xs">
            <SelectValue placeholder="Tool" />
          </SelectTrigger>
          <SelectContent className="border-white/10 bg-[#111722]">
            <SelectItem value="all" className="text-xs">All tools</SelectItem>
            {Array.from(new Set(events.map((event) => event.tool).filter(Boolean))).map((tool) => (
              <SelectItem key={tool} value={tool ?? ""} className="text-xs">
                {tool}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => {
            setAgentFilter("all");
            setStatusFilter("all");
            setToolFilter("all");
          }}
          aria-label="Reset filters"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>

        <div className="ml-auto text-xs text-slate-400">
          {filteredEvents.length} markers
        </div>
      </div>
    </div>
  );
}
