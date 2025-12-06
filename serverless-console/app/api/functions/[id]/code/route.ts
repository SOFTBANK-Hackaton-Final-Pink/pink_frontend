import { NextResponse, type NextRequest } from "next/server";
import { getStore } from "../../store";

type ContextParams = { params: Promise<{ id: string }> };

type UpdateBody = {
  code?: string;
};

export async function PUT(req: NextRequest, { params }: ContextParams) {
  const { id: rawId } = await params;
  const id = (rawId ?? "").trim();
  if (!id) {
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: "functionId is required" } },
      { status: 400 },
    );
  }

  const body = (await req.json().catch(() => null)) as UpdateBody | null;
  if (!body || !body.code) {
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: "code is required" } },
      { status: 400 },
    );
  }

  const store = getStore();
  const fn = store.find((f) => f.functionId === id);
  if (!fn) {
    return NextResponse.json(
      { success: false, error: { code: "NOT_FOUND", message: "Function not found" } },
      { status: 404 },
    );
  }

  // Update code and bump version
  const newVersion = fn.latestVersion + 1;
  const now = new Date().toISOString();
  fn.code = body.code;
  fn.latestVersion = newVersion;
  fn.updatedAt = now;

  return NextResponse.json({
    success: true,
    data: {
      functionId: fn.functionId,
      newVersion,
      updatedAt: now,
    },
    message: "ok",
  });
}
