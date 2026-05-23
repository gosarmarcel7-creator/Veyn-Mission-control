import { NextRequest, NextResponse } from "next/server";
import { mockDb } from "@/lib/mock-db";
import { PROVIDER_ADAPTERS } from "@/lib/adapters";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const connection = mockDb.getConnections().find((entry) => entry.id === id);

  if (!connection) {
    return NextResponse.json({ error: "Connection not found" }, { status: 404 });
  }

  const adapter = PROVIDER_ADAPTERS[connection.provider];
  const start = Date.now();
  const result = await adapter.testConnection(connection);

  return NextResponse.json({
    ...result,
    connectionId: id,
    latencyMs: result.latencyMs ?? Date.now() - start,
  });
}
