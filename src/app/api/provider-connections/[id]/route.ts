import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/data-store";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await dataStore.deleteConnection(id);
  return NextResponse.json({ success: true, id });
}
