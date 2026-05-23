import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { mockDb } from "@/lib/mock-db";

const AssignTaskSchema = z.object({
  task: z.string().min(1),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await request.json();
    const parsed = AssignTaskSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
    }

    const updated = mockDb.updateAgent(id, {
      status: "thinking",
      currentTask: parsed.data.task,
      progress: 5,
    });

    if (!updated) return NextResponse.json({ error: "Agent not found" }, { status: 404 });

    return NextResponse.json({ agent: updated });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
