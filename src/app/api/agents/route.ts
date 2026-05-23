import { NextRequest, NextResponse } from "next/server";
import { AgentCreateSchema } from "@/lib/schemas";
import { mockDb } from "@/lib/mock-db";

export async function GET() {
  return NextResponse.json({ agents: mockDb.getAgents() });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = AgentCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
    }

    const now = new Date().toISOString();

    const agent = mockDb.addAgent({
      id: `agent_${Date.now()}`,
      workspaceId: "ws_demo",
      providerConnectionId: parsed.data.providerConnectionId,
      name: parsed.data.name,
      role: parsed.data.role,
      model: parsed.data.model,
      provider: parsed.data.provider,
      status: "idle",
      currentTask: "Waiting for assignment",
      currentTool: undefined,
      zone: parsed.data.zone ?? "lounge",
      progress: 0,
      tokensUsed: 0,
      costUsd: 0,
      lastEventAt: now,
      position: { x: -3.5, y: 0, z: 2.2 },
    });

    return NextResponse.json({ agent }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
