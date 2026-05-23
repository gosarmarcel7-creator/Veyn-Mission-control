import { NextRequest, NextResponse } from "next/server";
import { mockDb } from "@/lib/mock-db";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const updated = mockDb.updateAgent(id, { status: "paused" });
  if (!updated) return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  return NextResponse.json({ agent: updated });
}
