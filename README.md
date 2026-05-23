# AI Agent Mission Control

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Current Production Readiness

- API routes now use Supabase when server env vars are set.
- If Supabase env vars are missing, the app falls back to in-memory demo storage.
- Replay mode has deterministic rewind/restore behavior.
- Production UI sync is enabled in non-demo mode.

## Supabase Setup (Step-by-Step)

1. Create a Supabase project.
2. In SQL Editor, run:
   - [`supabase/migrations/20260523_init_mission_control.sql`](/C:/Users/gosar/Documents/Github/ai-agent-mission-control/supabase/migrations/20260523_init_mission_control.sql)
3. Create your webhook endpoint record:

```sql
insert into public.webhook_endpoints (workspace_id, webhook_id, signing_secret)
values ('ws_prod', 'wh_prod', 'whsec_your_secret_here')
on conflict (workspace_id, webhook_id) do update
set signing_secret = excluded.signing_secret;
```

4. Seed at least one run row so timeline/run panels have initial data:

```sql
insert into public.runs (id, workspace_id, title, status, started_at, total_cost_usd, total_tokens, provider)
values ('run_initial', 'ws_prod', 'Initial run', 'running', now(), 0, 0, 'custom_webhook')
on conflict (id) do nothing;
```

5. Use your ingest API:
   - `POST /api/ingest/:workspaceId/:webhookId`
   - Include header `x-veyn-signature: sha256=<hmac>`

## Environment Variables

Copy `.env.example` to `.env.local` for local development, then set real values.

Required:

```bash
# client mode flag
NEXT_PUBLIC_VEYN_DEMO_MODE=false

# workspace routing (server + UI)
VEYN_WORKSPACE_ID=ws_prod
NEXT_PUBLIC_VEYN_WORKSPACE_ID=ws_prod
NEXT_PUBLIC_VEYN_WEBHOOK_ID=wh_prod

# optional hint shown in UI (never place your real secret in NEXT_PUBLIC vars)
NEXT_PUBLIC_VEYN_WEBHOOK_SECRET_HINT=stored-in-server-secret-manager

# Supabase server credentials (never NEXT_PUBLIC)
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
```

## Vercel Deployment (Step-by-Step)

1. Link project:

```bash
vercel link --yes --project <your-project> --scope <your-team>
```

2. Add env vars in Vercel:

```bash
vercel env add NEXT_PUBLIC_VEYN_DEMO_MODE production
vercel env add VEYN_WORKSPACE_ID production
vercel env add NEXT_PUBLIC_VEYN_WORKSPACE_ID production
vercel env add NEXT_PUBLIC_VEYN_WEBHOOK_ID production
vercel env add NEXT_PUBLIC_VEYN_WEBHOOK_SECRET_HINT production
vercel env add SUPABASE_URL production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
```

3. Deploy:

```bash
vercel --prod
```

4. Verify deployment and logs:

```bash
vercel ls
vercel logs --since 1h
```

## Remaining Work You Should Plan Next

1. Add Supabase Auth and workspace membership model.
2. Add RLS policies for `authenticated` users per workspace.
3. Replace placeholder provider adapter tests with real API checks.
4. Add Supabase Realtime subscriptions instead of polling.
5. Add durable queue/retry path for ingest bursts.
6. Add audit logging and error tracking.

## Replay Notes

Replay now supports deterministic scrubbing from a captured baseline and live restore when leaving replay mode.

## Build And Run

```bash
npm run lint
npm run build
npm run start
```
