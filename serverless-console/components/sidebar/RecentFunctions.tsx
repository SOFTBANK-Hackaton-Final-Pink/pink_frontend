'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { listFunctions } from "@/lib/api";
import type { FunctionListItem } from "@/lib/types";

const MAX_ITEMS = 5;

const toKst = (value: string) => {
  const date = new Date(value);
  return new Date(date.getTime() + 9 * 60 * 60 * 1000);
};

const sortByUpdated = (items: FunctionListItem[]) =>
  [...items].sort((a, b) => {
    const aTime = a.updatedAt ? toKst(a.updatedAt).getTime() : 0;
    const bTime = b.updatedAt ? toKst(b.updatedAt).getTime() : 0;
    return bTime - aTime;
  });

export default function RecentFunctions() {
  const [items, setItems] = useState<FunctionListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await listFunctions({});
        const sorted = sortByUpdated(res.items ?? []);
        setItems(sorted.slice(0, MAX_ITEMS));
      } catch (err) {
        setError(err instanceof Error ? err.message : "최근 함수를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="glass-card p-4 space-y-3">
      <div className="flex items-center gap-2">
        <span aria-hidden className="text-lg">🚀</span>
        <div className="text-sm font-semibold text-[var(--foreground)]">함수 바로가기</div>
      </div>
      {loading ? (
        <div className="text-xs text-[var(--muted-foreground)]">불러오는 중...</div>
      ) : error ? (
        <div className="text-xs text-red-600">{error}</div>
      ) : items.length === 0 ? (
        <div className="text-xs text-[var(--muted-foreground)]">표시할 함수가 없습니다.</div>
      ) : (
        <ul className="space-y-2 text-xs text-[var(--muted-foreground)]">
          {items.map((fn) => (
            <li
              key={fn.functionId}
              className="rounded-xl border border-[var(--border)] bg-white/80 transition hover:-translate-y-0.5 hover:shadow-lg hover:border-[#ff6b9d]/70"
            >
              <Link
                href={`/functions/${fn.functionId}`}
                className="flex flex-col gap-1 px-3 py-2 rounded-xl transition hover:bg-[#ffecf3]"
              >
                <span className="text-[var(--foreground)] font-semibold truncate">
                  {fn.name || "이름 없음"}
                </span>
                <span className="flex items-center gap-2 text-[10px]">
                  <span className="rounded-full bg-[#ffb7d5]/40 px-2 py-0.5 text-[10px] text-[#ff2d55] font-semibold">
                    v{fn.latestVersion ?? "-"}
                  </span>
                  <span className="text-[var(--muted-foreground)]">
                    {fn.updatedAt ? toKst(fn.updatedAt).toLocaleString() : "-"}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
