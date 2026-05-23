import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/data-store";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const agentId = params.get("agentId");
  const provider = params.get("provider");
  const runId = params.get("runId");

  const events = await dataStore.listEvents({ agentId, provider, runId });

  return NextResponse.json({ events });
}
