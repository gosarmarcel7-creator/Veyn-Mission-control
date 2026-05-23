import { NextRequest, NextResponse } from "next/server";
import { ProviderConnectionSchema } from "@/lib/schemas";
import { mockDb } from "@/lib/mock-db";

function fakeEncrypt(secret: string) {
  return `enc_ref_${Buffer.from(secret.slice(0, 8)).toString("base64")}`;
}

export async function GET() {
  return NextResponse.json({ connections: mockDb.getConnections() });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = ProviderConnectionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
    }

    const secret = parsed.data.apiKey ?? parsed.data.webhookSecret;

    const connection = mockDb.addConnection({
      id: `conn_${Date.now()}`,
      workspaceId: "ws_demo",
      provider: parsed.data.provider,
      authType: parsed.data.authType,
      displayName: parsed.data.displayName,
      status: "connected",
      lastSyncedAt: new Date().toISOString(),
      encryptedSecretRef: secret ? fakeEncrypt(secret) : undefined,
      metadata: parsed.data.metadata,
    });

    return NextResponse.json({ connection }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
