'use client';

import Link from "next/link";
import type { FunctionListItem } from "@/lib/types";
import { deleteFunction } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Props = {
  items: FunctionListItem[];
  loading?: boolean;
  onDelete?: (id: string) => Promise<void> | void;
};

const maskId = (id: string) => {
  if (!id) return "";
  if (id.length <= 8) return "****";
  return `${id.slice(0, 4)}…${id.slice(-4)}`;
};

export default function FunctionList({ items, loading, onDelete }: Props) {
  if (loading) {
    return (
      <div className="overlay-loader">
        <div className="loading-visual">
          <img src="/loading/loading.gif" alt="loading" className="h-28 w-28 object-contain" />
        </div>
        <div className="w-full max-w-[320px] rounded-full bg-white/40 h-2 overflow-hidden shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-[#ff6b9d] via-[#ff9f9f] to-[#ffd9a3] animate-[obentoProgress_1.5s_linear_infinite]"
            style={{ animationDuration: "1500ms" }}
          />
        </div>
        <div className="text-sm text-[var(--foreground)]">불러오는 중...</div>
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
    );
  }

  if (!items.length) {
    return <p className="text-sm text-[var(--muted-foreground)]">함수가 없습니다.</p>;
  }

  const handleDelete = async (id: string) => {
    // 삭제 시 별도 로딩 오버레이 없이 즉시 처리
    await deleteFunction(id);
    await onDelete?.(id);
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map((fn) => (
        <Card
          key={fn.functionId}
          className="p-4 shadow-sm border border-[var(--border)] bg-white/90 transition hover:-translate-y-1 hover:shadow-lg hover:border-[#ff6b9d]/70"
        >
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-2 text-sm text-[var(--foreground)]">
              <Link
                href={`/functions/${fn.functionId}`}
                className="text-base font-semibold text-[var(--foreground)] transition hover:text-[#ff2d55]"
              >
                {fn.name || "(이름 없음)"}
              </Link>
              <div className="space-y-1 text-xs text-[var(--muted-foreground)]">
                <div className="flex justify-between">
                  <span>런타임</span>
                  <span className="text-[var(--foreground)]">{fn.runtime}</span>
                </div>
                <div className="flex justify-between">
                  <span>버전</span>
                  <span className="text-[var(--foreground)]">v{fn.latestVersion}</span>
                </div>
                <div className="flex justify-between">
                  <span>업데이트</span>
                  <span className="text-[var(--foreground)]">
                    {fn.updatedAt
                      ? new Date(new Date(fn.updatedAt).getTime() + 9 * 60 * 60 * 1000).toLocaleString()
                      : "-"}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className="inline-flex items-center rounded-full bg-[#ffecf3] px-2 py-1 text-[10px] font-semibold text-[#ff2d55] border border-[#ffb7d5]/60">
                ID {maskId(fn.functionId)}
              </span>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleDelete(fn.functionId)}
                aria-label="함수 삭제"
              >
                삭제
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
