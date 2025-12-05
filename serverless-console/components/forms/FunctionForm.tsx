'use client';

import { useState } from "react";
import type { CreateFunctionPayload } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CodeEditor } from "@/components/ui/CodeEditor";

type Props = {
  onSubmit: (payload: CreateFunctionPayload) => Promise<void> | void;
};

const RUNTIMES = ["python:3.9-alpine", "node:18-alpine"];
const DEFAULT_CODE = `exports.handler = async (event) => {
  // TODO: add your logic
  const name = event?.name ?? "world";
  return { message: \`Hello \${name}\` };
};`;

export default function FunctionForm({ onSubmit }: Props) {
  const [name, setName] = useState("");
  const [runtime, setRuntime] = useState(RUNTIMES[0]);
  const [code, setCode] = useState(DEFAULT_CODE);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCode, setShowCode] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({ name, runtime, code });
      setName("");
      setCode(DEFAULT_CODE);
    } catch (err) {
      setError(err instanceof Error ? err.message : "요청을 처리하지 못했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="flex flex-col gap-2">
          <Label htmlFor="func_name">함수 이름</Label>
          <Input
            id="func_name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예: user-service"
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="func_runtime">런타임</Label>
          <Select
            id="func_runtime"
            value={runtime}
            onChange={(e) => setRuntime(e.target.value)}
          >
            {RUNTIMES.map((rt) => (
              <option key={rt} value={rt}>
                {rt}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {showCode && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="func_code">함수 코드</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowCode((v) => !v)}
            >
              접기
            </Button>
          </div>
          <CodeEditor value={code} onChange={setCode} readOnly={false} />
        </div>
      )}

      {!showCode && (
        <div className="flex items-center justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowCode(true)}
          >
            Code Editor 펼치기
          </Button>
        </div>
      )}

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex justify-start">
        <Button type="submit" disabled={submitting} variant="primary">
          {submitting ? "생성 중..." : "생성"}
        </Button>
      </div>
    </form>
  );
}
