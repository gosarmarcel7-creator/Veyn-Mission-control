import { cpSync, existsSync, mkdirSync, rmSync } from "fs";
import { join } from "path";

const root = process.cwd();
const standaloneDir = join(root, ".next", "standalone");
const staticSrc = join(root, ".next", "static");
const staticDest = join(standaloneDir, ".next", "static");
const publicSrc = join(root, "public");
const publicDest = join(standaloneDir, "public");

if (!existsSync(join(standaloneDir, "server.js"))) {
  console.error("Missing .next/standalone/server.js — run npm run build first.");
  process.exit(1);
}

mkdirSync(join(standaloneDir, ".next"), { recursive: true });
rmSync(staticDest, { recursive: true, force: true });
cpSync(staticSrc, staticDest, { recursive: true });
rmSync(publicDest, { recursive: true, force: true });
cpSync(publicSrc, publicDest, { recursive: true });

console.log("Prepared Electron standalone bundle.");
