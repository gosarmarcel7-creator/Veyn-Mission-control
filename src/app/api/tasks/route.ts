import { NextRequest, NextResponse } from "next/server";
import { TaskCreateSchema } from "@/lib/schemas";
import { mockDb } from "@/lib/mock-db";

export async function GET() {
  return NextResponse.json({ tasks: mockDb.getTasks() });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = TaskCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
    }

    const now = new Date().toISOString();
    const task = mockDb.addTask({
      id: `task_${Date.now()}`,
      workspaceId: "ws_demo",
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
