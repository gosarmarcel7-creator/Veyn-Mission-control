"use client";

import { useEffect, useRef } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";

interface ElectronTerminalProps {
  sessionId: string;
  active: boolean;
}

export function ElectronTerminal({ sessionId, active }: ElectronTerminalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<Terminal | null>(null);
  const fitRef = useRef<FitAddon | null>(null);

  useEffect(() => {
    const api = window.veyn?.terminal;
    if (!api || !containerRef.current) return;

    void import("@xterm/xterm/css/xterm.css");

    const term = new Terminal({
      cursorBlink: true,
      fontFamily: "Consolas, 'Courier New', monospace",
      fontSize: 13,
      theme: {
        background: "#080b12",
        foreground: "#e2e8f0",
        cursor: "#38bdf8",
      },
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(containerRef.current);
    fitAddon.fit();
    terminalRef.current = term;
    fitRef.current = fitAddon;

    const unsubscribe = api.onData(({ id, data }) => {
      if (id === sessionId) term.write(data);
    });

    const disposable = term.onData((data) => {
      void api.write(sessionId, data);
    });

    const resizeObserver = new ResizeObserver(() => {
      fitAddon.fit();
      void api.resize(sessionId, term.cols, term.rows);
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      disposable.dispose();
      unsubscribe();
      resizeObserver.disconnect();
      term.dispose();
      terminalRef.current = null;
      fitRef.current = null;
    };
  }, [sessionId]);

  useEffect(() => {
    if (!active || !fitRef.current) return;
    fitRef.current.fit();
  }, [active]);

  return <div ref={containerRef} className="h-full w-full p-1" />;
}
