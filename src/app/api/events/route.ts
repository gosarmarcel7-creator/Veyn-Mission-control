import { NextRequest, NextResponse } from "next/server";
import { mockDb } from "@/lib/mock-db";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const agentId = params.get("agentId");
  const provider = params.get("provider");
  const runId = params.get("runId");

  const events = mockDb
    .getEvents()
    .filter((event) => (agentId ? event.agentId === agentId : true))
    .filter((event) => (provider ? event.provider === provider : true))
    .filter((event) => (runId ? event.runId === runId : true));

  return NextResponse.json({ events });
}
