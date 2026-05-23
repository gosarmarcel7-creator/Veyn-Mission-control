# AI Agent Mission Control

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Production Mode

The UI supports demo and production mode.

- Demo mode is on by default.
- Set `NEXT_PUBLIC_VEYN_DEMO_MODE=false` to run in production mode.

## Required Environment Variables

Add these in your hosting platform (Vercel/Render/Fly/etc):

```bash
# client mode flag
NEXT_PUBLIC_VEYN_DEMO_MODE=false

# webhook UI defaults
NEXT_PUBLIC_VEYN_WORKSPACE_ID=ws_your_workspace
NEXT_PUBLIC_VEYN_WEBHOOK_ID=wh_your_webhook

# optional hint shown in UI (never place your real secret in NEXT_PUBLIC vars)
NEXT_PUBLIC_VEYN_WEBHOOK_SECRET_HINT=stored-in-server-secret-manager
```

## What Must Be Wired For Real Production

This repo still includes demo-backed storage and provider test stubs. For full production use by everyone, wire these pieces:

1. Replace `mockDb` in `src/lib/mock-db.ts` and API routes under `src/app/api/*` with a real database.
2. Add authentication and workspace tenancy (user -> workspace mapping, RBAC).
3. Encrypt provider credentials server-side (KMS/secret manager), never in public env vars.
4. Implement real provider adapter tests in `src/lib/adapters/*` (OpenAI/Anthropic/GitHub/Vercel/LangGraph).
5. Add realtime broadcast for ingested events (WebSocket/SSE/Supabase Realtime).
6. Persist and query timeline/replay events per run from the database.
7. Add background processing/retries/dead-letter handling for webhook ingest.
8. Add observability: request logs, error tracking, metrics, and alerting.

## Replay Notes

Replay now supports deterministic scrubbing from a captured baseline and live restore when leaving replay mode.

## Build And Run

```bash
npm run lint
npm run build
npm run start
```
