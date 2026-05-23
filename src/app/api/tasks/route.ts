import { NextRequest, NextResponse } from "next/server";
import { TaskCreateSchema } from "@/lib/schemas";
import { dataStore } from "@/lib/data-store";

export async function GET() {
  const tasks = await dataStore.listTasks();
  return NextResponse.json({ tasks });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = TaskCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
    }

    const now = new Date().toISOString();
    const task = await dataStore.createTask({
      id: `task_${Date.now()}`,
      workspaceId: dataStore.workspaceId,
      title: parsed.data.title,
      description: parsed.data.description,
      status: "queued",
      assignedAgentIds: parsed.data.assignedAgentIds,
      priority: parsed.data.priority,
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
