import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/data-store";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const updated = await dataStore.updateAgent(id, { status: "thinking" });
  if (!updated) return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  return NextResponse.json({ agent: updated });
}
