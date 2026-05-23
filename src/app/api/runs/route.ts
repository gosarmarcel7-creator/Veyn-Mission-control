import { NextResponse } from "next/server";
import { dataStore } from "@/lib/data-store";

export async function GET() {
  const runs = await dataStore.listRuns();
  return NextResponse.json({ runs });
}
