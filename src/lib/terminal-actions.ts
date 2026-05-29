import { useTerminalStore } from "./terminal-store";

export async function spawnTerminalSession(title?: string) {
  const api = window.veyn?.terminal;
  if (!api?.isDesktop()) return null;

  const { id } = await api.create();
  const session = {
    id,
    title: title ?? `Terminal ${id.slice(-4)}`,
  };
  useTerminalStore.getState().createSession(session);
  return session;
}
