/**
 * Seeds local desktop data with a webhook endpoint (run after first desktop launch or with VEYN_DATA_DIR set).
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const dataDir = process.env.VEYN_DATA_DIR || join(process.cwd(), ".veyn-data");
const dataPath = join(dataDir, "veyn.json");
const workspaceId = process.env.VEYN_WORKSPACE_ID || "ws_prod";

mkdirSync(dirname(dataPath), { recursive: true });

const state = existsSync(dataPath)
  ? JSON.parse(readFileSync(dataPath, "utf8"))
  : {
      workspaceId,
      providerConnections: [],
      agents: [],
      tasks: [],
      runs: [
        {
          id: "run_initial",
          workspaceId,
          title: "Initial run",
          status: "running",
          startedAt: new Date().toISOString(),
          totalCostUsd: 0,
          totalTokens: 0,
          provider: "custom_webhook",
        },
      ],
      events: [],
      webhookSecrets: {},
      connectionSecrets: {},
    };

state.webhookSecrets[`${workspaceId}:wh_prod`] =
  process.env.VEYN_WEBHOOK_SECRET || "whsec_demo_2f8cf7c1";

writeFileSync(dataPath, JSON.stringify(state, null, 2));
console.log(`Seeded ${dataPath}`);
