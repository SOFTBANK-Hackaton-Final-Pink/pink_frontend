import { NextResponse, type NextRequest } from "next/server";
import { allocId, getStore, type FunctionRow } from "./store";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor"); // ISO datetime string
  const pageSize = 10;

  const store = getStore();
  const sorted = [...store].sort((a, b) => {
    const aDate = new Date(a.updatedAt).getTime();
    const bDate = new Date(b.updatedAt).getTime();
    return bDate - aDate; // 최신순
  });

  const filtered = cursor
    ? sorted.filter((item) => new Date(item.updatedAt).getTime() < new Date(cursor).getTime())
    : sorted;

  const items = filtered.slice(0, pageSize);

  return NextResponse.json({
    success: true,
    data: items,
    message: "ok",
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
    data: {
      functionId: row.functionId,
      name: row.name,
      runtime: row.runtime,
      version: row.latestVersion,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    },
    message: "ok",
  });
}
