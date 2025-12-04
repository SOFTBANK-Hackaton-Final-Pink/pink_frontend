import { NextResponse, type NextRequest } from "next/server";
import { removeById, getStore } from "../store";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const id = (params.id ?? "").trim();
  const store = getStore();
  const fn = store.find((f) => f.functionId === id);
  if (!fn) {
    return NextResponse.json(
      { success: false, error: { code: "NOT_FOUND", message: "Function not found" } },
      { status: 404 },
    );
  }

  const executions = [
    {
      executionId: "exec-1",
      version: fn.latestVersion,
      status: "SUCCESS",
      durationMs: 120,
      createdAt: new Date().toISOString(),
      input: { name: "demo" },
      output: { message: "Hello demo" },
      errorMessage: null,
      cpuUsage: 2.3,
      memoryUsageMb: 18.2,
    },
    {
      executionId: "exec-2",
      version: fn.latestVersion,
      status: "ERROR",
      durationMs: 3000,
      createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
      input: { name: "demo" },
      output: null,
      errorMessage: "Timeout exceeded",
      cpuUsage: 2.1,
      memoryUsageMb: 15.4,
    },
    {
      executionId: "exec-3",
      version: fn.latestVersion - 1,
      status: "SUCCESS",
      durationMs: 180,
      createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      input: { name: "sample" },
      output: { message: "Hello sample" },
      errorMessage: null,
      cpuUsage: 2.0,
      memoryUsageMb: 14.8,
    },
  ];

  const stats = {
    totalExecutions: executions.length,
    successRate:
      (executions.filter((e) => e.status === "SUCCESS").length / executions.length) * 100,
    avgDurationMs:
      executions.reduce((sum, e) => sum + e.durationMs, 0) / executions.length,
    errorRate:
      (executions.filter((e) => e.status !== "SUCCESS").length / executions.length) * 100,
    invocationsByVersion: executions.reduce<Record<string, { count: number; successRate: number; avgDuration: number }>>(
      (acc, e) => {
        const key = String(e.version);
        if (!acc[key]) acc[key] = { count: 0, successRate: 0, avgDuration: 0 };
        acc[key].count += 1;
        return acc;
      },
      {},
    ),
  };

  // compute successRate/avgDuration per version
  Object.keys(stats.invocationsByVersion).forEach((key) => {
    const versionExecs = executions.filter((e) => String(e.version) === key);
    const successCount = versionExecs.filter((e) => e.status === "SUCCESS").length;
    stats.invocationsByVersion[key].successRate =
      (successCount / versionExecs.length) * 100;
    stats.invocationsByVersion[key].avgDuration =
      versionExecs.reduce((sum, e) => sum + e.durationMs, 0) / versionExecs.length;
  });

  return NextResponse.json({
    success: true,
    data: {
      functionId: fn.functionId,
      name: fn.name,
      runtime: fn.runtime,
      latestVersion: fn.latestVersion,
      code: fn.code,
      createdAt: fn.createdAt,
      updatedAt: fn.updatedAt,
      executions,
      stats,
    },
  });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const id = (params.id ?? "").trim();

  const deleted = removeById(id);
  return NextResponse.json({ success: true, data: { deleted } });
}
