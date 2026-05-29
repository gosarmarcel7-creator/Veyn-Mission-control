import { NextRequest, NextResponse } from "next/server";
import { ProviderConnectionSchema } from "@/lib/schemas";
import { dataStore } from "@/lib/data-store";
import { maskSecretRef } from "@/lib/secrets";

export async function GET() {
  const connections = await dataStore.listConnections();
  return NextResponse.json({ connections });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = ProviderConnectionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
    }

    const secret = parsed.data.apiKey ?? parsed.data.webhookSecret;

    const connection = await dataStore.createConnection(
      {
        id: `conn_${Date.now()}`,
        workspaceId: dataStore.workspaceId,
        provider: parsed.data.provider,
        authType: parsed.data.authType,
        displayName: parsed.data.displayName,
        status: "connected",
        lastSyncedAt: new Date().toISOString(),
        encryptedSecretRef: secret ? maskSecretRef(secret) : undefined,
        metadata: parsed.data.metadata,
      },
      secret
    );

    return NextResponse.json({ connection }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
