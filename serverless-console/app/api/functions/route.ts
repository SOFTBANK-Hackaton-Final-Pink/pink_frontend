import { NextResponse, type NextRequest } from "next/server";
import { allocId, getStore, type FunctionRow } from "./store";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const pageSize = Math.max(1, Number(searchParams.get("pageSize")) || 10);

  const store = getStore();
  const sorted = [...store].sort((a, b) => {
    const aId = Number(a.functionId);
    const bId = Number(b.functionId);
    if (Number.isFinite(aId) && Number.isFinite(bId)) return aId - bId;
    return String(a.functionId).localeCompare(String(b.functionId));
  });
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const items = sorted.slice(start, end);

  return NextResponse.json({
    success: true,
    data: items,
    total: sorted.length,
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null) as Partial<{
    name: string;
    runtime: string;
    code: string;
  }> | null;

  if (!body || !body.name || !body.runtime || !body.code) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "VALIDATION_ERROR", message: "name, runtime, code are required" },
      },
      { status: 400 },
    );
  }

  const store = getStore();
  const now = new Date().toISOString();
  const row: FunctionRow = {
    functionId: allocId(),
    name: body.name,
    runtime: body.runtime,
    latestVersion: 1,
    code: body.code,
    createdAt: now,
    updatedAt: now,
  };
  // Append so pagination keeps ascending order by insertion/ID
  store.push(row);

  return NextResponse.json({
    success: true,
    data: row,
  });
}
