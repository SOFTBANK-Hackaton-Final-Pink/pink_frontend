'use client';

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getFunctionDetail, deleteFunction, invokeFunction, updateFunctionCode } from "@/lib/api";
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
  { key: 'code', label: '코드 편집기' },
  { key: 'history', label: '실행 기록' },
  { key: 'metrics', label: '메트릭' },
] as const;

const toKstString = (value?: string) => {
  if (!value) return "-";
  const d = new Date(value);
  const kst = new Date(d.getTime() + 9 * 60 * 60 * 1000);
  return kst.toLocaleString();
};

const formatDate = toKstString;

const maskId = (id: string | undefined) => {
  if (!id) return "";
  if (id.length <= 8) return "****";
  return `${id.slice(0, 4)}...${id.slice(-4)}`;
};

export default function FunctionDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [detail, setDetail] = useState<FunctionDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editedCode, setEditedCode] = useState<string>("");
  const [invokeInput, setInvokeInput] = useState("");
  const [invokeResult, setInvokeResult] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]["key"]>("code");
  const [execCursor, setExecCursor] = useState<string | null>(null);
  const [execNextCursor, setExecNextCursor] = useState<string | null>(null);
  const [savingCode, setSavingCode] = useState(false);
  const [invoking, setInvoking] = useState(false);
  const MIN_INVOKE_MS = 2000;
  const RESULT_DURATION_MS = 10000;
  const resultTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearResultTimer = () => {
    if (resultTimer.current) {
      clearTimeout(resultTimer.current);
      resultTimer.current = null;
    }
  };

  const showResult = (msg: string) => {
    clearResultTimer();
    setInvokeResult(msg);
    resultTimer.current = setTimeout(() => {
      setInvokeResult(null);
    }, RESULT_DURATION_MS);
  };

  const fetchDetail = async () => {
    const started = Date.now();
    setLoading(true);
    try {
      setError(null);
      const data = await getFunctionDetail(params.id, execCursor ?? undefined);
      setDetail(data);
      setEditedCode(data.code ?? "");
      setExecNextCursor(data.nextCursor ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "불러오기 오류가 발생했습니다.");
      setDetail(null);
    } finally {
      const elapsed = Date.now() - started;
      if (elapsed < MIN_INVOKE_MS) {
        await new Promise((res) => setTimeout(res, MIN_INVOKE_MS - elapsed));
      }
      setLoading(false);
    }
  };

  const refreshExecutions = async () => {
    const started = Date.now();
    setLoading(true);
    setExecCursor(null);
    setExecNextCursor(null);
    await fetchDetail();
    const elapsed = Date.now() - started;
    if (elapsed < MIN_INVOKE_MS) {
      await new Promise((res) => setTimeout(res, MIN_INVOKE_MS - elapsed));
    }
    setLoading(false);
  };

  useEffect(() => {
    setExecCursor(null);
    setExecNextCursor(null);
    fetchDetail();
    return () => {
      clearResultTimer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const handleDelete = async () => {
    await deleteFunction(params.id);
    router.push("/");
  };

  const handleInvoke = async () => {
    setInvokeResult(null);
    setInvoking(true);
    const start = Date.now();
    try {
      const res = await invokeFunction(params.id);
      showResult(`요청을 접수했습니다. executionId: ${res.data.executionId} (상태: ${res.data.status})`);
      await refreshExecutions();
    } catch (err) {
      showResult(err instanceof Error ? err.message : "실행 요청 실패");
    } finally {
      const elapsed = Date.now() - start;
      if (elapsed < MIN_INVOKE_MS) {
        await new Promise((res) => setTimeout(res, MIN_INVOKE_MS - elapsed));
      }
      setInvoking(false);
    }
  };

  const isNotFound = error?.includes("NOT_FOUND") || error?.includes("404");
  const stats = detail?.stats;
  const isDirty = editedCode !== (detail?.code ?? "");

  const avgCpu = useMemo(() => {
    if (!detail?.executions?.length) return null;
    const filtered = detail.executions.filter((e) => typeof e.executionResult?.cpuUsage === "number");
    if (!filtered.length) return null;
    const sum = filtered.reduce((acc, cur) => acc + (cur.executionResult?.cpuUsage || 0), 0);
    return sum / filtered.length;
  }, [detail?.executions]);

  const avgMem = useMemo(() => {
    if (!detail?.executions?.length) return null;
    const filtered = detail.executions.filter((e) => typeof e.executionResult?.memoryUsageMb === "number");
    if (!filtered.length) return null;
    const sum = filtered.reduce((acc, cur) => acc + (cur.executionResult?.memoryUsageMb || 0), 0);
    return sum / filtered.length;
  }, [detail?.executions]);

  return (
    <div className="relative min-h-screen text-[var(--foreground)]">
      {invoking && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="glass-card flex flex-col items-center gap-3 px-6 py-5 shadow-2xl rounded-2xl border border-[var(--border)]">
            <div className="w-48 h-3 rounded-full bg-white/40 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#ff6b9d] to-[#ffcba4] bar-fill"
                style={{ animationDuration: `${Math.max(MIN_INVOKE_MS, 800)}ms` }}
                aria-label="loading"
              />
            </div>
            <div className="text-sm font-medium text-black drop-shadow">
              현재 코드가 실행되고 있습니다. 잠시만 기다려주세요.
            </div>
          </div>
          <style jsx>{`
            @keyframes obento-bar {
              from {
                width: 0%;
              }
              to {
                width: 100%;
              }
            }
            .bar-fill {
              animation-name: obento-bar;
              animation-timing-function: linear;
              animation-fill-mode: forwards;
            }
          `}</style>
        </div>
      )}
      {loading && (
        <div className="overlay-loader">
          <div className="loading-visual">
            <img
              src={invoking ? "/loading/start.gif" : "/loading/loading.gif"}
              alt="loading"
              className="h-20 w-20 object-contain"
            />
          </div>
          <div className="loading-visual w-full">
            <div className="w-full max-w-[320px] mx-auto rounded-full bg-white/50 h-2 overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-[#ff6b9d] via-[#ff9f9f] to-[#ffd9a3] animate-[obentoProgress_2s_linear_infinite]"
                style={{ animationDuration: `${Math.max(MIN_INVOKE_MS, 2000)}ms` }}
              />
            </div>
          </div>
          <div className="text-sm text-[var(--foreground)]">
            {invoking ? "코드를 실행하는 중입니다..." : "불러오는 중..."}
          </div>
          <style jsx>{`
            @keyframes obentoProgress {
              0% {
                transform: translateX(-100%);
              }
              100% {
                transform: translateX(100%);
              }
            }
          `}</style>
        </div>
      )}
      <header className="mb-4 flex items-center justify-between rounded-[20px] bg-gradient-to-r from-[#ff6b9d] to-[#ff9f9f] px-5 py-3 text-white shadow-lg">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">Pink</div>
          <span className="text-sm">Functions Console</span>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-4 rounded-[28px] border border-[var(--border)] bg-[#fff7f2] px-4 py-6 shadow-lg md:px-6">
        <div className="rounded-[var(--radius)] border border-pink-200 bg-white/70 px-5 py-4 shadow-sm backdrop-blur">
          <h1 className="flex items-center gap-2 text-lg font-semibold text-[var(--foreground)]">
            <span aria-hidden>🍱</span> 함수 상세
          </h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            함수 메타데이터, 코드, 실행 이력·메트릭을 확인합니다.
          </p>
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
                <Badge variant="muted">ID {maskId(detail?.functionId ?? params.id)}</Badge>
              </div>
            </div>
            <Button variant="danger" onClick={handleDelete} disabled={!detail}>
              삭제
            </Button>
          </div>
          {error && (
            <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {isNotFound ? "해당 함수를 찾을 수 없습니다. 목록에서 다시 선택해주세요." : error}
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
                    ? "border-b-2 border-[var(--primary)] text-[var(--primary)]"
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
                disabled={!isDirty || savingCode || !detail}
                onClick={async () => {
                  if (!detail) return;
                  try {
                    setSavingCode(true);
                    await updateFunctionCode(detail.functionId, editedCode);
                    await fetchDetail();
                  } catch (err) {
                    setError(err instanceof Error ? err.message : "코드 업데이트 실패");
                  } finally {
                    setSavingCode(false);
                  }
                }}
              >
                {isDirty ? (savingCode ? "Saving..." : "Save & Deploy New Version") : "No Changes"}
              </Button>
            </div>
            <CodeEditor
              value={editedCode || detail?.code || ""}
              onChange={setEditedCode}
              readOnly={false}
            />

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Button variant="primary" onClick={handleInvoke} disabled={invoking}>
                실행
              </Button>
              {invoking && (
                <span className="text-xs text-[var(--muted-foreground)]">
                  현재 코드가 실행되고 있습니다. 잠시만 기다려주세요.
                </span>
              )}
              {invokeResult && (
                <div className="flex items-center gap-2 rounded-md border border-[#d8d8d8] bg-white/80 px-3 py-2 text-sm text-[var(--foreground)]">
                  <span className="rounded-full bg-[#f1c40f] px-2 py-0.5 text-xs font-semibold text-black">PENDING</span>
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
              <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--muted-foreground)]">최신 순으로 정렬됩니다.</span>
                <Button variant="secondary" size="sm" onClick={refreshExecutions} disabled={loading}>
                  새로고침
                </Button>
              </div>
            </div>
            {detail?.executions?.length ? (
              <>
                <div className="overflow-auto">
                  <table className="min-w-full text-sm">
                    <thead className="text-left text-[var(--muted-foreground)]">
                      <tr>
                        <th className="pb-2 pr-3">상태</th>
                        <th className="pb-2 pr-3">CPU %</th>
                        <th className="pb-2 pr-3">메모리(MB)</th>
                        <th className="pb-2 pr-3">실행 시간</th>
                        <th className="pb-2 pr-3">출력</th>
                        <th className="pb-2 pr-3">에러</th>
                        <th className="pb-2 pr-3 whitespace-nowrap">시간</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)]">
                      {detail.executions
                        .slice()
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .map((exec) => (
                          <tr key={exec.executionId} className="align-top">
                            <td className="py-2 pr-3">
                              <StatusBadge status={exec.status} />
                            </td>
                            <td className="py-2 pr-3 text-xs text-[var(--muted-foreground)]">
                              {exec.executionResult?.cpuUsage ?? "-"}%
                            </td>
                            <td className="py-2 pr-3 text-xs text-[var(--muted-foreground)]">
                              {exec.executionResult?.memoryUsageMb ?? "-"} MB
                            </td>
                            <td className="py-2 pr-3 text-xs text-[var(--muted-foreground)]">
                              {exec.executionResult?.durationMs ?? "-"} ms
                            </td>
                            <td className="py-2 pr-3 text-xs text-[var(--muted-foreground)]">
                              {exec.executionResult?.output ?? "-"}
                            </td>
                            <td className="py-2 pr-3 text-xs text-[var(--muted-foreground)]">
                              {exec.executionResult?.errorMessage ?? "-"}
                            </td>
                            <td className="whitespace-nowrap py-2 pr-3 text-xs text-[var(--muted-foreground)]">
                              {formatDate(exec.createdAt)}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-3 flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={!execCursor || loading}
                    onClick={() => {
                      setExecCursor(null);
                      setExecNextCursor(null);
                      fetchDetail();
                    }}
                  >
                    처음
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={!execNextCursor || loading}
                    onClick={() => {
                      setExecCursor(execNextCursor);
                      fetchDetail();
                    }}
                  >
                    다음 실행 이력
                  </Button>
                </div>
              </>
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
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              <Card className="p-4">
                <div className="text-xs text-[var(--muted-foreground)]">평균 CPU</div>
                <div className="text-lg font-semibold">
                  {avgCpu !== null ? `${avgCpu.toFixed(3)}%` : "-"}
                </div>
              </Card>
              <Card className="p-4">
                <div className="text-xs text-[var(--muted-foreground)]">평균 메모리</div>
                <div className="text-lg font-semibold">
                  {avgMem !== null ? `${avgMem.toFixed(3)} MB` : "-"}
                </div>
              </Card>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
