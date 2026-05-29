import { NextRequest, NextResponse } from "next/server";
import { PROVIDER_ADAPTERS } from "@/lib/adapters";
import { dataStore } from "@/lib/data-store";
import { decryptSecret } from "@/lib/secrets";
import type { ProviderConnection } from "@/lib/types";

function connectionWithSecret(
  connection: ProviderConnection,
  secret: string | null
): ProviderConnection {
  return {
    ...connection,
    metadata: {
      ...connection.metadata,
      ...(secret ? { apiKey: secret } : {}),
    },
  };
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const connection = (await dataStore.listConnections()).find((entry) => entry.id === id);

  if (!connection) {
    return NextResponse.json({ error: "Connection not found" }, { status: 404 });
  }

  const adapter = PROVIDER_ADAPTERS[connection.provider];
  if (!adapter) {
    return NextResponse.json({ error: "Unknown provider" }, { status: 400 });
  }

  let secret = await dataStore.getConnectionSecret(id);
  if (!secret && connection.encryptedSecretRef) {
    secret = decryptSecret(connection.encryptedSecretRef);
  }

  const enriched = connectionWithSecret(connection, secret);

  if (!adapter.listAgents) {
    return NextResponse.json({
      agents: await dataStore.listAgents(),
      message:
        connection.provider === "custom_webhook"
          ? "Agents appear when you send signed webhook events to the ingest endpoint."
          : `${adapter.name} does not expose a remote agent list. Use webhooks or manual agent creation.`,
      synced: 0,
    });
  }

  try {
    const externalAgents = await adapter.listAgents(enriched);
    const agents = await dataStore.upsertAgentsFromExternal(connection, externalAgents);

    return NextResponse.json({
      agents,
      synced: agents.length,
      message: `Synced ${agents.length} agent(s) from ${adapter.name}.`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sync failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
