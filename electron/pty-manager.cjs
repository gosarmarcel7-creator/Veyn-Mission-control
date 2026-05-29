const os = require("os");
const pty = require("node-pty");

const sessions = new Map();

function defaultShell() {
  if (process.platform === "win32") {
    return process.env.COMSPEC || "cmd.exe";
  }
  return process.env.SHELL || "/bin/bash";
}

function createSession({ cwd, cols = 80, rows = 24, onData }) {
  const id = `term_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const shell = defaultShell();
  const args = process.platform === "win32" ? [] : ["-l"];

  const ptyProcess = pty.spawn(shell, args, {
    name: "xterm-color",
    cols,
    rows,
    cwd: cwd || os.homedir(),
    env: process.env,
  });

  ptyProcess.onData((data) => {
    if (onData) onData({ id, data });
  });

  sessions.set(id, ptyProcess);
  return { id };
}

function writeSession(id, data) {
  const session = sessions.get(id);
  if (!session) return false;
  session.write(data);
  return true;
}

function resizeSession(id, cols, rows) {
  const session = sessions.get(id);
  if (!session) return false;
  session.resize(cols, rows);
  return true;
}

function killSession(id) {
  const session = sessions.get(id);
  if (!session) return false;
  session.kill();
  sessions.delete(id);
  return true;
}

module.exports = {
  createSession,
  writeSession,
  resizeSession,
  killSession,
};
