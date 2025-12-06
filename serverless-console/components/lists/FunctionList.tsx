'use client';

import { useState } from "react";
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

export default function FunctionList({ items, loading, onDelete }: Props) {
  const [busyId, setBusyId] = useState<string | null>(null);

  if (loading) {
    return <p className="text-sm text-slate-600">불러오는 중...</p>;
  }

  if (!items.length) {
    return <p className="text-sm text-slate-600">함수가 없습니다.</p>;
  }

  const handleDelete = async (id: string) => {
    setBusyId(id);
    try {
      await deleteFunction(id);
      await onDelete?.(id);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
      {items.map((fn) => (
        <Card key={fn.functionId} className="p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-2 text-sm text-slate-800">
              <Link
                href={`/functions/${fn.functionId}`}
                className="text-base font-semibold text-blue-700 hover:underline"
              >
                {fn.name}
              </Link>
              <div className="space-y-1 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>런타임</span>
                  <span>{fn.runtime}</span>
                </div>
                <div className="flex justify-between">
                  <span>버전</span>
                  <span>v{fn.latestVersion}</span>
                </div>
                <div className="flex justify-between">
                  <span>업데이트</span>
                  <span>{fn.updatedAt ? new Date(fn.updatedAt).toLocaleString() : "-"}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge variant="muted">ID {fn.functionId}</Badge>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleDelete(fn.functionId)}
                disabled={busyId === fn.functionId}
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
