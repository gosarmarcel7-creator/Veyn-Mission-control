import { create } from "zustand";

export interface TerminalSession {
  id: string;
  title: string;
  cwd?: string;
}

interface TerminalStore {
  sessions: TerminalSession[];
  activeSessionId: string | null;
  createSession: (session: TerminalSession) => void;
  closeSession: (id: string) => void;
  setActiveSession: (id: string | null) => void;
}

export const useTerminalStore = create<TerminalStore>((set) => ({
  sessions: [],
  activeSessionId: null,

  createSession: (session) =>
    set((state) => ({
      sessions: [...state.sessions, session],
      activeSessionId: session.id,
    })),

  closeSession: (id) =>
    set((state) => {
      const sessions = state.sessions.filter((s) => s.id !== id);
      const activeSessionId =
        state.activeSessionId === id ? (sessions[sessions.length - 1]?.id ?? null) : state.activeSessionId;
      return { sessions, activeSessionId };
    }),

  setActiveSession: (activeSessionId) => set({ activeSessionId }),
}));

export function isElectronDesktop() {
  return typeof window !== "undefined" && Boolean(window.veyn?.terminal?.isDesktop?.());
}
