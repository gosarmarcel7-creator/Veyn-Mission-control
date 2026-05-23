import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { WebhookIngestSchema } from "@/lib/schemas";
import { CustomWebhookAdapter } from "@/lib/adapters";
import { mockDb } from "@/lib/mock-db";

function verifySignature(payload: string, signatureHeader: string | null, secret: string) {
  if (!secret) return true;
  if (!signatureHeader) return false;

  const digest = createHmac("sha256", secret).update(payload).digest("hex");
  const expected = Buffer.from(`sha256=${digest}`);
  const actual = Buffer.from(signatureHeader);

  if (expected.length !== actual.length) return false;
  return timingSafeEqual(expected, actual);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string; webhookId: string }> }
) {
  const { workspaceId, webhookId } = await params;

  const rawPayload = await request.text();
  const signature = request.headers.get("x-veyn-signature") ?? request.headers.get("x-hub-signature-256");
  const secret = mockDb.getWebhookSecret(workspaceId, webhookId);

  if (!verifySignature(rawPayload, signature, secret)) {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
  }

  let parsedBody: unknown;
  try {
    parsedBody = JSON.parse(rawPayload);
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const validated = WebhookIngestSchema.safeParse(parsedBody);
  if (!validated.success) {
    return NextResponse.json({ error: "Validation failed", details: validated.error.flatten() }, { status: 400 });
  }

  const normalized = CustomWebhookAdapter.normalizeEvent({
    ...validated.data,
    id: `evt_ingest_${Date.now()}`,
    workspaceId,
    runId: validated.data.runId,
    provider: validated.data.provider ?? "custom_webhook",
    title: validated.data.title ?? `${validated.data.agentName ?? validated.data.agentId} update`,
    eventType: validated.data.eventType ?? "agent.thinking",
    timestamp: validated.data.timestamp ?? new Date().toISOString(),
  });

  const stored = mockDb.addEvent(normalized);

  const updatedAgent = mockDb.updateAgent(normalized.agentId, {
    currentTask: normalized.task,
    currentTool: normalized.tool,
    status:
      normalized.eventType === "agent.blocked"
        ? "blocked"
        : normalized.eventType === "agent.completed"
        ? "done"
        : normalized.eventType === "agent.review.started"
        ? "reviewing"
        : normalized.eventType === "agent.tool_call.started"
        ? "using_tool"
        : normalized.eventType === "agent.file.changed"
        ? "coding"
        : "thinking",
    progress:
      normalized.eventType === "agent.completed"
        ? 100
        : normalized.eventType === "agent.blocked"
        ? 30
        : undefined,
  });

  const broadcast = {
    channel: `workspace:${workspaceId}`,
    eventId: stored.id,
    enabled: false,
    note: "Realtime broadcasting is stubbed. Wire this to Supabase Realtime, SSE, or WebSocket in production.",
  };

  return NextResponse.json({ success: true, event: stored, updatedAgent, broadcast }, { status: 202 });
}
