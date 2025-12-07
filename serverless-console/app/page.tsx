'use client';

import { useEffect, useState } from "react";
import FunctionForm from "@/components/forms/FunctionForm";
import FunctionList from "@/components/lists/FunctionList";
import { createFunction, listFunctions, type ListFunctionsParams } from "@/lib/api";
import type { FunctionListItem } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 10;
const MIN_LOADING_MS = 1500;

export default function HomePage() {
  const [functions, setFunctions] = useState<FunctionListItem[]>([]);
  const [cursorStack, setCursorStack] = useState<(string | null)[]>([null]); // visited cursors
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const page = cursorStack.length;
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
  const [loadingKind, setLoadingKind] = useState<"create" | "load">("load");
  const [error, setError] = useState<string | null>(null);

  const loadFunctions = async (params: ListFunctionsParams = {}) => {
    const started = Date.now();
    try {
      setLoadingKind("load");
      setLoading(true);
      setError(null);
      const res = await listFunctions(params);
      setFunctions(res.items);
      setNextCursor(res.nextCursor ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      const elapsed = Date.now() - started;
      if (elapsed < MIN_LOADING_MS) {
        await new Promise((res) => setTimeout(res, MIN_LOADING_MS - elapsed));
      }
      setLoading(false);
      setLoadingMessage(null);
    }
  };

  useEffect(() => {
    loadFunctions({});
  }, []);

  const handleCreate = async (payload: { name: string; runtime: string; code: string }) => {
    const started = Date.now();
    try {
      setLoadingKind("create");
      setLoading(true);
      setLoadingMessage("새 함수를 만드는 중입니다...");
      await createFunction(payload);
      await loadFunctions({ cursor: cursorStack[cursorStack.length - 1] ?? undefined });
    } catch (err) {
      setError(err instanceof Error ? err.message : "생성에 실패했습니다");
    } finally {
      const elapsed = Date.now() - started;
      if (elapsed < MIN_LOADING_MS) {
        await new Promise((res) => setTimeout(res, MIN_LOADING_MS - elapsed));
      }
      setLoading(false);
      setLoadingMessage(null);
    }
  };

  const handleDeleted = async (id: string) => {
    setFunctions((prev) => prev.filter((fn) => fn.functionId !== id));
    await loadFunctions({ cursor: cursorStack[cursorStack.length - 1] ?? undefined });
  };

  const handleNext = async () => {
    if (!nextCursor) return;
    const currentCursor = cursorStack[cursorStack.length - 1] ?? null;
    setCursorStack((prev) => [...prev, nextCursor]);
    await loadFunctions({ cursor: nextCursor });
  };

  const handlePrev = async () => {
    if (cursorStack.length <= 1) return;
    const newStack = [...cursorStack];
    newStack.pop();
    const prevCursor = newStack[newStack.length - 1];
    setCursorStack(newStack);
    await loadFunctions({ cursor: prevCursor ?? undefined });
  };

  return (
    <div className="relative min-h-screen text-[var(--foreground)]">
      {loading && (
        <div className="overlay-loader">
          <div className="loading-visual">
            <img
              src={loadingKind === "create" ? "/loading/create.gif" : "/loading/loading.gif"}
              alt="loading"
              className="h-28 w-28 object-contain"
            />
          </div>
          <div className="w-full max-w-[320px] rounded-full bg-white/40 h-2 overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-[#ff6b9d] via-[#ff9f9f] to-[#ffd9a3] animate-[obentoProgress_1.5s_linear_infinite]"
              style={{ animationDuration: `${Math.max(MIN_LOADING_MS, 1500)}ms` }}
            />
          </div>
          <div className="text-sm mt-2">{loadingMessage ?? "불러오는 중..."}</div>
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

      <header className="mb-4 rounded-[20px] bg-gradient-to-r from-[#ff6b9d] to-[#ff9f9f] px-5 py-3 shadow-lg text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">Pink</div>
          <span className="text-sm">Functions Console</span>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 md:px-6 bg-[#fff7f2] rounded-[28px] shadow-lg border border-[var(--border)]">
        <section className="glass-card px-4 py-4 text-[var(--foreground)] border-[4px] border-[#b7eac9] shadow-lg rounded-[24px]">
          <div className="flex items-center gap-2">
            <span className="text-xl" aria-hidden>
              🍙
            </span>
            <div>
              <h2 className="text-lg font-semibold text-[var(--foreground)]">함수 개요</h2>
              <p className="text-sm text-[var(--muted-foreground)]">함수 생성·목록·삭제를 관리합니다.</p>
            </div>
          </div>
        </section>

        <Card className="glass-card p-6 shadow-lg border-[4px] border-[#ffb7d5] rounded-[24px]">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg" aria-hidden>
                🎀
              </span>
              <div>
                <h3 className="text-base font-semibold text-[var(--foreground)]">새 함수 만들기</h3>
                <p className="text-xs text-[var(--muted-foreground)]">맛있는 함수 도시락을 만들어보세요</p>
              </div>
            </div>
            
          </div>
          <FunctionForm onSubmit={handleCreate} />
        </Card>

        <section className="glass-card px-4 py-4 text-[var(--foreground)] border-[4px] border-[#ffcba4] shadow-lg rounded-[24px]">
          <div className="flex items-center gap-2">
            <span className="text-lg" aria-hidden>
              🍱
            </span>
            <div>
              <h2 className="text-lg font-semibold">함수 목록</h2>
              <p className="text-sm text-[var(--muted-foreground)]">함수를 선택해 상세/실행 기록을 확인하세요.</p>
            </div>
          </div>
        </section>

        <Card className="glass-card p-6 shadow-lg border-[4px] border-[#e5b8f4] rounded-[24px]">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-xs text-[var(--muted-foreground)]">
              Page {page}
            </span>
            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}
          </div>
          <FunctionList items={functions} loading={loading} onDelete={handleDeleted} />
          <div className="mt-4 flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={cursorStack.length <= 1 || loading}
              onClick={handlePrev}
            >
              이전
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={!nextCursor || loading}
              onClick={handleNext}
            >
              다음
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
}
