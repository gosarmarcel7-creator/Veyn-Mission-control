# AI Agent Mission Control (Veyn)

**Veyn** is a spatial command center for multi-agent operations: a 3D ops room, provider integrations, signed webhook ingest, timeline replay, and a **desktop app** with local PTY terminals.

**Stack:** Next.js 16 (App Router, standalone output), React 19, TypeScript, Tailwind 4, React Three Fiber, Zustand, Supabase (optional), Electron + `node-pty` + xterm.js (desktop).

Repository: [github.com/gosarmarcel7-creator/ai-agent-mission-control](https://github.com/gosarmarcel7-creator/ai-agent-mission-control)

---

## Download (desktop)

1. Open [GitHub Releases](https://github.com/gosarmarcel7-creator/ai-agent-mission-control/releases).
2. Download the installer for your OS (Windows NSIS `.exe`, macOS `.dmg`, Linux `AppImage`).
3. Launch **Veyn**. No Supabase setup is required — the packaged app uses a local JSON database under your OS user data directory (`app.getPath('userData')`).

To publish a release locally:

```bash
npm run electron:dist
```

Pushing a git tag matching `v*` (for example `v0.1.0`) runs [`.github/workflows/release.yml`](.github/workflows/release.yml) and attaches build artifacts to the release.

---

## Quick start (web)

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

By default the web app runs in **demo mode** (`NEXT_PUBLIC_VEYN_DEMO_MODE` unset or not `"false"`): simulated agents, tasks, and events from [`src/lib/demo-data.ts`](src/lib/demo-data.ts). Turn off demo data in **Settings** or set `NEXT_PUBLIC_VEYN_DEMO_MODE=false` in `.env.local` to use the API and real persistence.

---

## Quick start (desktop dev)

```bash
npm install
npm run electron:dev
```

This runs `next build`, copies static assets into the standalone bundle (`npm run electron:prepare`), then starts Electron. The embedded server listens on **http://127.0.0.1:3310** and opens the **Room** page.

Electron sets automatically:

| Variable | Value |
|----------|--------|
| `VEYN_DESKTOP` | `1` |
| `VEYN_LOCAL_DB` | `1` |
| `NEXT_PUBLIC_VEYN_DEMO_MODE` | `false` |
| `VEYN_DATA_DIR` | OS userData path (packaged) or project `.veyn-data/` (dev) |

**PTY terminals** only work in the desktop app (not on Vercel). On the web build, Room shows a link to download the desktop app instead.

Alias script (same as `electron:dev`):

```bash
npm run dev:desktop
```

Seed webhook signing secrets for local ingest testing:

```bash
npm run seed:local
```

Writes `.veyn-data/veyn.json` (or `VEYN_DATA_DIR/veyn.json`) with `wh_prod` → `whsec_demo_2f8cf7c1` by default.

---

## App pages

| Route | Purpose |
|-------|---------|
| `/` | Marketing landing |
| `/dashboard` | Workspace overview |
| `/room` | 3D ops room **or** terminal workspace (desktop) |
| `/agents` | Agent table |
| `/tasks` | Task board |
| `/timeline` | Event timeline + replay scrubber |
| `/analytics` | Cost / utilization charts |
| `/app/integrations` | Connect providers (in-app) |
| `/settings` | Workspace settings, **demo mode toggle** |
| `/login`, `/signup` | Placeholder auth UI (not wired to Supabase Auth) |

---

## Room: terminals vs agents

| Main area (`/room`) | When |
|---------------------|------|
| **3D agent room** (`RoomCanvas`) | No terminal tabs open |
| **Terminal tabs** (xterm + local shell) | One or more terminals open (desktop only) |

- **New terminal:** Room top bar, command menu (`Ctrl+K` / `⌘K`), or agent inspector → “Open terminal”.
- **Close all terminal tabs** to return to the 3D room. Agent list and inspector sidebars stay visible.

---

## Data storage

The server picks a backend in [`src/lib/data-store.ts`](src/lib/data-store.ts):

1. **Supabase** — if `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set.
2. **Local file** — if `VEYN_DESKTOP=1` or `VEYN_LOCAL_DB=1` ([`src/lib/local-db.ts`](src/lib/local-db.ts) → `veyn.json`).
3. **In-memory mock** — otherwise (resets on server restart; includes demo seed data).

Provider API keys are encrypted at rest with AES-256-GCM ([`src/lib/secrets.ts`](src/lib/secrets.ts), key from `VEYN_SECRET_KEY` or a dev default). Keys are only used server-side.

---

## Providers and agents

Supported providers ([`src/lib/demo-data.ts`](src/lib/demo-data.ts)):

| Provider | Connect via | Live connection test | Remote agent sync (`POST .../sync`) |
|----------|-------------|----------------------|-------------------------------------|
| **OpenAI** | API key | Yes (`/v1/models`) | Yes — OpenAI Assistants API |
| **Anthropic (Claude)** | API key | Yes (minimal messages call) | No — use webhooks / manual agents |
| **GitHub** | API key (OAuth UI stubbed) | Yes (`/user`) | No — use webhooks |
| **Vercel** | API key (OAuth UI stubbed) | Yes (`/v2/user`) | No — use webhooks |
| **LangGraph** | Webhook | Config check only | No — agents via signed ingest |
| **Custom webhook** | Webhook URL + secret | Yes (config message) | No — agents created on ingest |

**How agents appear:**

1. **Sync** — After saving an API key, the integrations UI calls `POST /api/provider-connections/:id/sync` (also available via **Sync** on each card).
2. **Webhook ingest** — `POST /api/ingest/:workspaceId/:webhookId` upserts the agent (by `agentId`) before recording the event.
3. **Demo mode** — Pre-seeded `DEMO_AGENTS` in the client when `isDemoMode` is true.
4. **Manual** — `POST /api/agents`.

Production UI polls APIs every 4s when demo mode is off ([`src/hooks/useProductionSync.ts`](src/hooks/useProductionSync.ts)). Supabase Realtime is not implemented yet.

---

## Webhook ingest example

Endpoint:

```http
POST /api/ingest/{workspaceId}/{webhookId}
x-veyn-signature: sha256=<hmac-sha256-hex-of-raw-body>
Content-Type: application/json
```

Body (see [`WebhookIngestSchema`](src/lib/schemas.ts)):

```json
{
  "runId": "run_initial",
  "agentId": "agent_my_bot",
  "agentName": "My Bot",
  "role": "coder",
  "provider": "custom_webhook",
  "eventType": "agent.created",
  "title": "Agent joined"
}
```

For local desktop after `npm run seed:local`:

- `workspaceId`: `ws_prod` (or your `VEYN_WORKSPACE_ID`)
- `webhookId`: `wh_prod`
- Secret: `whsec_demo_2f8cf7c1` (or `VEYN_WEBHOOK_SECRET`)

If no signing secret is configured for the endpoint, signature verification is skipped.

---

## Environment variables

Copy [`.env.example`](.env.example) to `.env.local`.

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_VEYN_DEMO_MODE` | Set to `false` for production API/sync on web (default: demo on) |
| `NEXT_PUBLIC_VEYN_DESKTOP` | Marks desktop build in client (`DESKTOP_MODE`) |
| `VEYN_DESKTOP` / `VEYN_LOCAL_DB` | Enable local `veyn.json` persistence |
| `VEYN_DATA_DIR` | Directory containing `veyn.json` |
| `VEYN_WORKSPACE_ID` / `NEXT_PUBLIC_VEYN_WORKSPACE_ID` | Workspace id for API routes (default `ws_demo`) |
| `NEXT_PUBLIC_VEYN_WEBHOOK_ID` | Shown in webhook setup UI |
| `VEYN_SECRET_KEY` | Server-side encryption key for stored API keys |
| `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` | Optional cloud Postgres backend |
| `NEXT_PUBLIC_GITHUB_REPO` | Releases URL when terminals are unavailable on web |

---

## Supabase setup (optional cloud)

1. Create a Supabase project.
2. Run [`supabase/migrations/20260523_init_mission_control.sql`](supabase/migrations/20260523_init_mission_control.sql) in the SQL editor.
3. Seed a webhook endpoint:

```sql
insert into public.webhook_endpoints (workspace_id, webhook_id, signing_secret)
values ('ws_prod', 'wh_prod', 'whsec_your_secret_here')
on conflict (workspace_id, webhook_id) do update
set signing_secret = excluded.signing_secret;
```

4. Seed an initial run (required for event FK / timeline):

```sql
insert into public.runs (id, workspace_id, title, status, started_at, total_cost_usd, total_tokens, provider)
values ('run_initial', 'ws_prod', 'Initial run', 'running', now(), 0, 0, 'custom_webhook')
on conflict (id) do nothing;
```

5. Set env vars, `NEXT_PUBLIC_VEYN_DEMO_MODE=false`, then `npm run build` and `npm run start` or deploy (for example Vercel).

RLS is enabled with service-role policies only; end-user Supabase Auth is not wired in the app yet.

---

## HTTP API

| Method | Path | Notes |
|--------|------|--------|
| `GET` / `POST` | `/api/agents` | List / create agents |
| `GET` / `PATCH` / `DELETE` | `/api/agents/:id` | Single agent |
| `POST` | `/api/agents/:id/pause` | Pause agent |
| `POST` | `/api/agents/:id/resume` | Resume agent |
| `POST` | `/api/agents/:id/assign-task` | Assign task text |
| `GET` / `POST` | `/api/tasks` | Tasks |
| `GET` | `/api/runs` | Runs |
| `GET` | `/api/events` | Events (`?agentId`, `?provider`, `?runId`) |
| `GET` | `/api/analytics` | Aggregates |
| `GET` / `POST` | `/api/provider-connections` | List / create connection |
| `DELETE` | `/api/provider-connections/:id` | Remove connection |
| `POST` | `/api/provider-connections/:id/test` | Adapter connection test |
| `POST` | `/api/provider-connections/:id/sync` | Pull / upsert agents from provider |
| `POST` | `/api/ingest/:workspaceId/:webhookId` | Signed webhook ingest |

---

## npm scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Next.js dev server (port 3000) |
| `npm run build` | Production build (`output: "standalone"`) |
| `npm run start` | Run production server |
| `npm run lint` | ESLint |
| `npm run electron:prepare` | Copy `.next/static` and `public` into standalone bundle |
| `npm run electron:dev` | Build + prepare + launch Electron |
| `npm run dev:desktop` | Same as `electron:dev` |
| `npm run electron:dist` | Build installers via electron-builder → `dist/` |
| `npm run seed:local` | Seed local webhook secret in `veyn.json` |

---

## Project layout

```
electron/           # main.cjs, preload.cjs, pty-manager.cjs
src/app/            # Next.js routes + API
src/components/     # UI, room, terminal, integrations
src/lib/            # store, data-store, adapters, local-db, secrets
scripts/            # prepare-electron-standalone.mjs, seed-local.mjs
supabase/migrations/
```

---

## Not yet implemented

- Supabase Auth and per-user workspace membership
- Supabase Realtime (UI uses 4s polling)
- OAuth flows for GitHub / Vercel (UI stubs only)
- Durable ingest queue, audit log, billing
- OS keychain (`safeStorage`) for secrets in packaged builds (uses file encryption today)

---

## License

MIT — see [LICENSE](LICENSE).
