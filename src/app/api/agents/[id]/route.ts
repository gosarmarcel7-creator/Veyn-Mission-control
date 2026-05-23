import { NextRequest, NextResponse } from "next/server";
import { AgentPatchSchema } from "@/lib/schemas";
import { mockDb } from "@/lib/mock-db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await request.json();
    const parsed = AgentPatchSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
    }

    const updated = mockDb.updateAgent(id, parsed.data);
    if (!updated) return NextResponse.json({ error: "Agent not found" }, { status: 404 });

    return NextResponse.json({ agent: updated });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
