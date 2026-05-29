const { contextBridge, ipcRenderer } = require("electron");

const listeners = new Set();

ipcRenderer.on("terminal:data", (_event, payload) => {
  for (const listener of listeners) {
    listener(payload);
  }
});

contextBridge.exposeInMainWorld("veyn", {
  terminal: {
    isDesktop: () => true,
    create: (options) => ipcRenderer.invoke("terminal:create", options ?? {}),
    write: (id, data) => ipcRenderer.invoke("terminal:write", { id, data }),
    resize: (id, cols, rows) => ipcRenderer.invoke("terminal:resize", { id, cols, rows }),
    kill: (id) => ipcRenderer.invoke("terminal:kill", { id }),
    onData: (callback) => {
      listeners.add(callback);
      return () => listeners.delete(callback);
    },
  },
});
