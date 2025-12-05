'use client';

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getFunctionDetail, deleteFunction } from "@/lib/api";
import type { FunctionDetail, ExecutionRow } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { CodeEditor } from "@/components/ui/CodeEditor";

function StatusBadge({ status }: { status: ExecutionRow["status"] }) {
  const variant =
    status === "SUCCESS" ? "success" : status === "ERROR" || status === "TIMEOUT" ? "error" : "muted";
  return <Badge variant={variant}>{status}</Badge>;
}

const tabs = [
  { key: "code", label: "코드 편집기" },
  { key: "execute", label: "실행" },
  { key: "history", label: "실행 기록" },
  { key: "metrics", label: "메트릭" },
] as const;

const formatDate = (value?: string) => (value ? new Date(value).toLocaleString() : "-");

export default function FunctionDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [detail, setDetail] = useState<FunctionDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editedCode, setEditedCode] = useState<string>("");
  const [invokeInput, setInvokeInput] = useState('{\n  "name": "demo"\n}');
  const [invokeResult, setInvokeResult] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]["key"]>("code");

  const fetchDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getFunctionDetail(params.id);
      setDetail(data);
      setEditedCode(data.code ?? "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "불러오기 중 오류가 발생했습니다.");
      setDetail(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [params.id]);

  const handleDelete = async () => {
    await deleteFunction(params.id);
    router.push("/");
  };

  const handleInvoke = () => {
    setInvokeResult(`요청 내용: ${invokeInput}`);
  };

  const isNotFound = error?.includes("NOT_FOUND") || error?.includes("404");
  const stats = detail?.stats;
  const isDirty = editedCode !== (detail?.code ?? "");

  const avgCpu = useMemo(() => {
    if (!detail?.executions?.length) return null;
    const filtered = detail.executions.filter((e) => typeof e.cpuUsage === "number");
    if (!filtered.length) return null;
    const sum = filtered.reduce((acc, cur) => acc + (cur.cpuUsage || 0), 0);
    return sum / filtered.length;
  }, [detail?.executions]);

  const avgMem = useMemo(() => {
    if (!detail?.executions?.length) return null;
    const filtered = detail.executions.filter((e) => typeof e.memoryUsageMb === "number");
    if (!filtered.length) return null;
    const sum = filtered.reduce((acc, cur) => acc + (cur.memoryUsageMb || 0), 0);
    return sum / filtered.length;
  }, [detail?.executions]);

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <header className="bg-[var(--primary)] text-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="rounded-full bg-white/15 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/25"
              aria-label="메인으로 돌아가기"
            >
              ←
            </button>
            <div className="rounded-md bg-white/15 px-3 py-2 text-sm font-semibold uppercase tracking-wide">
              SERVERLESS
            </div>
            <span className="text-sm">Functions Console</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 rounded-lg bg-white/15 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/25"
            >
              <span aria-hidden="true">▦</span>
              Dashboard
            </Link>
            <span className="text-xs opacity-85">Dashboard · Grafana Style</span>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-6">
        <div className="rounded-[var(--radius)] border border-emerald-200 bg-emerald-50 px-4 py-3">
          <h1 className="text-lg font-semibold text-[var(--foreground)]">함수 개요</h1>
          <p className="text-sm text-[var(--muted-foreground)]">함수의 생성·수정·실행 기록·메트릭을 관리합니다.</p>
        </div>

        <Card className="p-6">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <h2 className="text-xl font-semibold">
                {detail?.name ?? (isNotFound ? "함수를 찾을 수 없습니다" : "로딩 중")}
              </h2>
              <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--muted-foreground)]">
                <span>런타임: {detail?.runtime ?? "-"}</span>
                <Badge variant="muted">v{detail?.latestVersion ?? "-"}</Badge>
                <Badge variant="muted">ID {detail?.functionId ?? params.id}</Badge>
              </div>
            </div>
            <Button variant="danger" onClick={handleDelete} disabled={!detail}>
              삭제
            </Button>
          </div>
          {error && (
            <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {isNotFound
                ? "해당 함수를 찾을 수 없습니다. 목록에서 다시 선택해주세요."
                : error}
            </div>
          )}
          <div className="grid grid-cols-2 gap-3 text-sm text-[var(--muted-foreground)]">
            <span>생성: {formatDate(detail?.createdAt)}</span>
            <span className="text-right">수정: {formatDate(detail?.updatedAt)}</span>
          </div>
        </Card>

        <div className="flex flex-wrap items-center gap-6 border-b border-[var(--border)] px-1 pb-2">
          {tabs.map((tab) => {
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`pb-2 text-sm font-medium transition ${
                  active
                    ? "text-[var(--primary)] border-b-2 border-[var(--primary)]"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {activeTab === "code" && (
          <Card className="p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold">Function Code</h3>
              <Button
                variant={isDirty ? "primary" : "secondary"}
                size="sm"
                disabled={!isDirty}
                onClick={() => {
                  if (!detail) return;
                  setDetail({ ...detail, code: editedCode });
                }}
              >
                {isDirty ? "Save & Deploy New Version" : "No Changes"}
              </Button>
            </div>
            <CodeEditor
              value={
                editedCode ||
                detail?.code ||
                `exports.handler = async (event) => {\n  // Your code here\n  return {\n    statusCode: 200,\n    body: JSON.stringify({ message: "Hello from Node.js!" })\n  };\n};`
              }
              onChange={setEditedCode}
              readOnly={false}
            />
          </Card>
        )}

        {activeTab === "execute" && (
          <Card className="p-6">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-semibold">실행</h3>
              <span className="text-xs text-[var(--muted-foreground)]">JSON 입력을 넣고 실행해보세요.</span>
            </div>
            <div className="flex flex-col gap-3">
              <Textarea
                className="h-32 font-mono"
                value={invokeInput}
                onChange={(e) => setInvokeInput(e.target.value)}
              />
              <div className="flex gap-2">
                <Button variant="primary" onClick={handleInvoke}>
                  실행
                </Button>
                <Button variant="secondary" onClick={fetchDetail} disabled={loading}>
                  새로고침
                </Button>
              </div>
              {invokeResult && (
                <div className="rounded-md border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-sm text-[var(--foreground)]">
                  {invokeResult}
                </div>
              )}
            </div>
          </Card>
        )}

        {activeTab === "history" && (
          <Card className="p-6">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-semibold">실행 기록</h3>
              <span className="text-xs text-[var(--muted-foreground)]">최신 순으로 표시됩니다.</span>
            </div>
            {detail?.executions?.length ? (
              <div className="overflow-auto">
                <table className="min-w-full text-sm">
                  <thead className="text-left text-[var(--muted-foreground)]">
                    <tr>
                      <th className="pb-2 pr-3">상태</th>
                      <th className="pb-2 pr-3">버전</th>
                      <th className="pb-2 pr-3">실행 시간</th>
                      <th className="pb-2 pr-3">CPU %</th>
                      <th className="pb-2 pr-3">메모리(MB)</th>
                      <th className="pb-2 pr-3">실행 시각</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {detail.executions
                      .slice()
                      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                      .map((exec) => (
                        <tr key={exec.executionId} className="align-top">
                          <td className="py-2 pr-3"><StatusBadge status={exec.status} /></td>
                          <td className="py-2 pr-3">v{exec.version}</td>
                          <td className="py-2 pr-3">{exec.durationMs} ms</td>
                          <td className="py-2 pr-3">{exec.cpuUsage ?? "-"}%</td>
                          <td className="py-2 pr-3">{exec.memoryUsageMb ?? "-"} MB</td>
                          <td className="py-2 pr-3 whitespace-nowrap">{formatDate(exec.createdAt)}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-[var(--muted-foreground)]">실행 기록이 없습니다.</p>
            )}
          </Card>
        )}

        {activeTab === "metrics" && (
          <Card className="p-6">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-semibold">메트릭</h3>
              <span className="text-xs text-[var(--muted-foreground)]">기본 실행 지표를 확인하세요.</span>
            </div>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
              <Card className="p-4">
                <div className="text-xs text-[var(--muted-foreground)]">총 실행</div>
                <div className="text-lg font-semibold">{stats?.totalExecutions ?? "-"}</div>
              </Card>
              <Card className="p-4">
                <div className="text-xs text-[var(--muted-foreground)]">성공률</div>
                <div className="text-lg font-semibold">
                  {stats ? `${stats.successRate.toFixed(1)}%` : "-"}
                </div>
              </Card>
              <Card className="p-4">
                <div className="text-xs text-[var(--muted-foreground)]">평균 실행 시간</div>
                <div className="text-lg font-semibold">
                  {stats ? `${stats.avgDurationMs.toFixed(0)} ms` : "-"}
                </div>
              </Card>
              <Card className="p-4">
                <div className="text-xs text-[var(--muted-foreground)]">에러율</div>
                <div className="text-lg font-semibold">
                  {stats ? `${stats.errorRate.toFixed(1)}%` : "-"}
                </div>
              </Card>
              <Card className="p-4">
                <div className="text-xs text-[var(--muted-foreground)]">평균 CPU</div>
                <div className="text-lg font-semibold">
                  {avgCpu !== null ? `${avgCpu.toFixed(1)}%` : "-"}
                </div>
              </Card>
              <Card className="p-4">
                <div className="text-xs text-[var(--muted-foreground)]">평균 메모리</div>
                <div className="text-lg font-semibold">
                  {avgMem !== null ? `${avgMem.toFixed(1)} MB` : "-"}
                </div>
              </Card>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
