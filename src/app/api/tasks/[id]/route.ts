import { NextRequest, NextResponse } from "next/server";
import { TaskPatchSchema } from "@/lib/schemas";
import { dataStore } from "@/lib/data-store";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await request.json();
    const parsed = TaskPatchSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
    }

    const updated = await dataStore.updateTask(id, parsed.data);
    if (!updated) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    return NextResponse.json({ task: updated });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
