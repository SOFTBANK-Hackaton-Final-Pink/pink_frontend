'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import FunctionForm from "@/components/forms/FunctionForm";
import FunctionList from "@/components/lists/FunctionList";
import { createFunction, listFunctions, type ListFunctionsParams } from "@/lib/api";
import type { FunctionListItem } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 10;

export default function HomePage() {
  const router = useRouter();
  const [functions, setFunctions] = useState<FunctionListItem[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFunctions = async (params: ListFunctionsParams) => {
    try {
      setLoading(true);
      setError(null);
      const res = await listFunctions(params);
      setFunctions(res.items);
      setTotal(res.total ?? res.items.length);
      setPage(res.page ?? 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "불러오기 오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFunctions({ page: 1, pageSize: PAGE_SIZE });
  }, []);

  const handleCreate = async (payload: { name: string; runtime: string; code: string }) => {
    await createFunction(payload);
    await loadFunctions({ page: 1, pageSize: PAGE_SIZE });
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handleDeleted = async (id: string) => {
    setFunctions((prev) => prev.filter((fn) => fn.functionId !== id));
    setTotal((prev) => Math.max(0, prev - 1));
    await loadFunctions({ page: 1, pageSize: PAGE_SIZE });
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <header className="bg-[var(--primary)] text-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
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
            <span className="text-xs opacity-85">SoftBank Hackathon · Prod</span>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-6">
        <section className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--secondary)] px-4 py-3 text-[var(--foreground)]">
          <h2 className="text-lg font-semibold">함수 생성</h2>
          <p className="text-sm text-[var(--muted-foreground)]">함수 정보를 입력하고 코드를 등록하세요.</p>
        </section>

        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-[var(--foreground)]">함수 생성</h3>
              <p className="text-sm text-[var(--muted-foreground)]"></p>
            </div>
            <span className="text-xs text-[var(--muted-foreground)]">POST /api/functions</span>
          </div>
          <FunctionForm onSubmit={handleCreate} />
        </Card>

        <section className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--secondary)] px-4 py-3 text-[var(--foreground)]">
          <h2 className="text-lg font-semibold">함수 목록</h2>
          <p className="text-sm text-[var(--muted-foreground)]">함수를 선택해 상세 정보와 실행 기록을 확인하세요.</p>
        </section>

        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-xs text-[var(--muted-foreground)]">
              Page {page} / {Math.max(1, totalPages)}
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
              disabled={page === 1 || loading}
              onClick={() => loadFunctions({ page: Math.max(1, page - 1), pageSize: PAGE_SIZE })}
            >
              이전
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={page === totalPages || loading}
              onClick={() =>
                loadFunctions({
                  page: Math.min(totalPages, page + 1),
                  pageSize: PAGE_SIZE,
                })
              }
            >
              다음
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
}
