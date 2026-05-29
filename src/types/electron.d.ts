export interface VeynTerminalApi {
  create: (options?: { cwd?: string; cols?: number; rows?: number }) => Promise<{ id: string }>;
  write: (id: string, data: string) => Promise<void>;
  resize: (id: string, cols: number, rows: number) => Promise<void>;
  kill: (id: string) => Promise<void>;
  onData: (callback: (payload: { id: string; data: string }) => void) => () => void;
  isDesktop: () => boolean;
}

declare global {
  interface Window {
    veyn?: {
      terminal: VeynTerminalApi;
    };
  }
}

export {};
