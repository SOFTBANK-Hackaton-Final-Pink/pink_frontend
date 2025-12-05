'use client';

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type TimeRange = "15m" | "1h" | "6h" | "24h" | "7d";

type MetricSnapshot = {
  totalInvocations: number;
  successRate: number;
  avgResponseMs: number;
  health: number;
  p95Ms: number;
  change: number;
};

type SeriesPoint = { label: string; success: number; error: number };

const ranges: { key: TimeRange; label: string }[] = [
  { key: "15m", label: "Last 15 minutes" },
  { key: "1h", label: "Last 1 hour" },
  { key: "6h", label: "Last 6 hours" },
  { key: "24h", label: "Last 24 hours" },
  { key: "7d", label: "Last 7 days" },
];

function generateSnapshot(range: TimeRange): MetricSnapshot {
  const factor = { "15m": 0.3, "1h": 0.6, "6h": 1, "24h": 1.4, "7d": 2 }[range];
  const total = Math.floor(500 * factor + Math.random() * 200);
  const successRate = Math.max(0, Math.min(100, 70 + Math.random() * 25));
  const avgResponseMs = Math.floor(30 + Math.random() * 120);
  const p95Ms = avgResponseMs + Math.floor(50 + Math.random() * 120);
  const health = Math.max(40, Math.min(100, successRate - Math.random() * 10));
  const change = Math.round((Math.random() * 10 - 5) * 10) / 10;
  return { totalInvocations: total, successRate, avgResponseMs, health, p95Ms, change };
}

function generateSeries(range: TimeRange): SeriesPoint[] {
  const buckets = range === "7d" ? 14 : range === "24h" ? 12 : 8;
  return Array.from({ length: buckets }, (_, i) => {
    const success = Math.floor(Math.random() * 60) + 5;
    const error = Math.floor(Math.random() * 8);
    return { label: `${i * (range === "7d" ? 12 : 2)}h ago`, success, error };
  }).reverse();
}

export default function DashboardPage() {
  const router = useRouter();
  const [range, setRange] = useState<TimeRange>("1h");
  const [snapshot, setSnapshot] = useState<MetricSnapshot>(() => generateSnapshot("1h"));
  const [series, setSeries] = useState<SeriesPoint[]>(() => generateSeries("1h"));
  const [runtimeSplit, setRuntimeSplit] = useState({ node: 50, python: 50 });
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  useEffect(() => {
    setSnapshot(generateSnapshot(range));
    setSeries(generateSeries(range));
    const node = Math.floor(40 + Math.random() * 20);
    const python = 100 - node;
    setRuntimeSplit({ node, python });
    setLastUpdated(new Date());
  }, [range]);

  useEffect(() => {
    const id = setInterval(() => {
      setSnapshot(generateSnapshot(range));
      setSeries(generateSeries(range));
      setLastUpdated(new Date());
    }, 5000);
    return () => clearInterval(id);
  }, [range]);

  const runtimeGradient = useMemo(() => {
    const total = runtimeSplit.node + runtimeSplit.python || 1;
    const n = (runtimeSplit.node / total) * 100;
    const p = 100 - n;
    return `conic-gradient(#60a5fa 0 ${n}%, #22c55e ${n}% 100%)`;
  }, [runtimeSplit]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="bg-[var(--primary)] text-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleBack}
              className="rounded-full bg-white/15 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/25"
            >
              ←
            </button>
            <div className="rounded-md bg-white/15 px-3 py-2 text-sm font-semibold uppercase tracking-wide">
              SERVERLESS
            </div>
            <span className="text-sm">Functions Console</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs opacity-85">SoftBank Hackathon · Prod</span>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-white">Serverless Functions - Overview</h1>
            <p className="text-sm text-slate-400">Last updated: {lastUpdated.toLocaleTimeString()}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 rounded-full bg-slate-900/70 px-2 py-1">
            <span className="px-2 text-xs text-slate-300">Time Range:</span>
            {ranges.map((r) => (
              <button
                key={r.key}
                onClick={() => setRange(r.key)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                  range === r.key ? "bg-blue-500 text-white shadow" : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Total Invocations"
            value={snapshot.totalInvocations.toLocaleString()}
            footer={`${snapshot.change > 0 ? "+" : ""}${snapshot.change}% vs last period`}
            icon="📈"
            tone="blue"
          />
          <MetricCard
            title="Success Rate"
            value={`${snapshot.successRate.toFixed(1)}%`}
            footer={`${Math.round((snapshot.successRate / 100) * snapshot.totalInvocations)} successful`}
            icon="✅"
            tone="green"
          />
          <MetricCard
            title="Avg Response Time"
            value={`${snapshot.avgResponseMs}ms`}
            footer={`P95: ${snapshot.p95Ms}ms`}
            icon="⚡"
            tone="purple"
          />
          <MetricCard
            title="System Health"
            value={`${snapshot.health.toFixed(0)}/100`}
            footer={snapshot.health > 75 ? "Healthy" : snapshot.health > 50 ? "Warning" : "Critical"}
            icon="❤️"
            tone="red"
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-slate-900 p-4 shadow-lg">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Invocations Over Time</h3>
              <span className="text-xs text-slate-400">Success vs Error</span>
            </div>
            <div className="h-56 rounded-lg border border-slate-800 bg-slate-950 px-3 py-4">
              <div className="flex h-full items-end gap-2">
                {series.map((pt) => {
                  const total = pt.success + pt.error || 1;
                  const successHeight = (pt.success / total) * 100;
                  const errorHeight = (pt.error / total) * 100;
                  return (
                    <div key={pt.label} className="flex w-full flex-col justify-end gap-1 text-xs text-slate-400">
                      <div className="flex h-36 items-end gap-1">
                        <div
                          className="w-2 rounded-sm bg-emerald-400"
                          style={{ height: `${successHeight}%` }}
                          title={`Success: ${pt.success}`}
                        />
                        <div
                          className="w-2 rounded-sm bg-rose-400"
                          style={{ height: `${errorHeight}%` }}
                          title={`Error: ${pt.error}`}
                        />
                      </div>
                      <span className="text-[10px] text-slate-500">{pt.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 shadow-lg">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Runtime Distribution</h3>
              <span className="text-xs text-slate-400">node:18-alpine / python:3.9-alpine</span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div
                className="h-48 w-48 rounded-full border border-slate-800 shadow-inner"
                style={{ background: runtimeGradient }}
              />
              <div className="grid w-full grid-cols-2 gap-2 text-xs text-slate-300">
                <Legend label="node:18-alpine" value={runtimeSplit.node} color="#60a5fa" />
                <Legend label="python:3.9-alpine" value={runtimeSplit.python} color="#22c55e" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 shadow-lg lg:col-span-2">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">System Resources</h3>
              <span className="text-xs text-slate-400">Live</span>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <ResourceBar label="CPU Usage" value={48} />
              <ResourceBar label="Memory Usage" value={62} />
              <ResourceBar label="Disk IO" value={35} />
              <ResourceBar label="Network" value={54} />
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 shadow-lg">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Recent Errors</h3>
              <span className="text-xs text-slate-400">Last 10</span>
            </div>
            <div className="space-y-3 text-xs text-slate-300">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-rose-300">Error {i + 1}</span>
                    <span className="text-[10px] text-slate-500">{new Date().toLocaleTimeString()}</span>
                  </div>
                  <p className="mt-1 text-slate-400">Timeout on function exec-{i + 10}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function MetricCard({
  title,
  value,
  footer,
  icon,
  tone,
}: {
  title: string;
  value: string;
  footer: string;
  icon: string;
  tone: "blue" | "green" | "purple" | "red";
}) {
  const toneMap = {
    blue: "bg-blue-500/15 text-blue-300",
    green: "bg-emerald-500/15 text-emerald-300",
    purple: "bg-purple-500/15 text-purple-300",
    red: "bg-rose-500/15 text-rose-300",
  } as const;
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 shadow-lg">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">{title}</p>
          <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
          <p className="mt-1 text-xs text-slate-400">{footer}</p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${toneMap[tone]}`}>{icon}</div>
      </div>
    </div>
  );
}

function Legend({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="h-3 w-3 rounded-sm" style={{ background: color }} />
      <span className="text-slate-200">{label}</span>
      <span className="text-slate-400">{value}%</span>
    </div>
  );
}

function ResourceBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs text-slate-300">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="mt-1 h-2 w-full rounded-full bg-slate-800">
        <div
          className="h-2 rounded-full bg-gradient-to-r from-emerald-400 to-blue-500"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
