const { app, BrowserWindow, ipcMain } = require("electron");
const { spawn } = require("child_process");
const http = require("http");
const path = require("path");
const fs = require("fs");
const ptyManager = require("./pty-manager.cjs");

const isDev = !app.isPackaged;
let mainWindow = null;
let nextProcess = null;
let serverPort = 3310;

function getUserDataPath() {
  return app.getPath("userData");
}

function resolveStandaloneDir() {
  if (isDev) {
    return path.join(__dirname, "..", ".next", "standalone");
  }
  return path.join(process.resourcesPath, "standalone");
}

function startNextServer() {
  return new Promise((resolve, reject) => {
    const standaloneDir = resolveStandaloneDir();
    const serverScript = path.join(standaloneDir, "server.js");

    if (!fs.existsSync(serverScript)) {
      reject(new Error(`Next standalone server not found at ${serverScript}. Run npm run build first.`));
      return;
    }

    const env = {
      ...process.env,
      PORT: String(serverPort),
      HOSTNAME: "127.0.0.1",
      VEYN_DESKTOP: "1",
      VEYN_LOCAL_DB: "1",
      VEYN_DATA_DIR: getUserDataPath(),
      NEXT_PUBLIC_VEYN_DEMO_MODE: "false",
      NEXT_PUBLIC_VEYN_DESKTOP: "1",
    };

    nextProcess = spawn(process.execPath, [serverScript], {
      cwd: standaloneDir,
      env: { ...env, ELECTRON_RUN_AS_NODE: "1" },
      stdio: "inherit",
    });

    nextProcess.on("error", reject);

    const deadline = Date.now() + 60000;
    const poll = () => {
      const req = http.get(`http://127.0.0.1:${serverPort}/`, (res) => {
        res.resume();
        if (res.statusCode && res.statusCode < 500) {
          resolve();
          return;
        }
        retry();
      });
      req.on("error", retry);
      req.setTimeout(1500, () => {
        req.destroy();
        retry();
      });
    };

    const retry = () => {
      if (Date.now() > deadline) {
        reject(new Error("Timed out waiting for Next.js server"));
        return;
      }
      setTimeout(poll, 400);
    };

    poll();
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    backgroundColor: "#080b12",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadURL(`http://127.0.0.1:${serverPort}/room`);

  if (isDev) {
    mainWindow.webContents.openDevTools({ mode: "detach" });
  }
}

function registerIpc() {
  ipcMain.handle("terminal:create", async (_event, options) => {
    return ptyManager.createSession({
      cwd: options?.cwd,
      cols: options?.cols ?? 80,
      rows: options?.rows ?? 24,
      onData: (payload) => {
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send("terminal:data", payload);
        }
      },
    });
  });

  ipcMain.handle("terminal:write", (_event, { id, data }) => {
    ptyManager.writeSession(id, data);
    return true;
  });

  ipcMain.handle("terminal:resize", (_event, { id, cols, rows }) => {
    ptyManager.resizeSession(id, cols, rows);
    return true;
  });

  ipcMain.handle("terminal:kill", (_event, { id }) => {
    ptyManager.killSession(id);
    return true;
  });
}

app.whenReady().then(async () => {
  registerIpc();
  try {
    await startNextServer();
    createWindow();
  } catch (error) {
    console.error(error);
    app.quit();
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("before-quit", () => {
  if (nextProcess) {
    nextProcess.kill();
    nextProcess = null;
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
