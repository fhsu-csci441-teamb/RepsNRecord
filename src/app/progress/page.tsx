"use client";

import { useEffect, useMemo, useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  ResponsiveContainer,
  LabelList,
} from "recharts";

type Monthly = { month: string; count: number };

const MONTHS = [
  "Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"
];

export default function ProgressPage() {
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [data, setData] = useState<Monthly[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [err, setErr] = useState<string | null>(null);

  // Refresh when Workout Log page dispatches this after a save
  useEffect(() => {
    const h = () => setYear((y) => y); // trigger re-fetch
    window.addEventListener("progress:dirty", h);
    return () => window.removeEventListener("progress:dirty", h);
  }, []);

  // Fetch monthly counts
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setErr(null);

    fetch(`/api/progress?year=${year}`, { credentials: "include" })
      .then(async (r) => {
        if (!r.ok) throw new Error(await safeText(r));
        return r.json() as Promise<{ monthly: Monthly[] }>;
      })
      .then(({ monthly }) => {
        if (!cancelled) setData(fillMissingMonths(monthly));
      })
      .catch((e) => !cancelled && setErr(e.message || "Failed to load progress"))
      .finally(() => !cancelled && setLoading(false));

    return () => { cancelled = true; };
  }, [year]);

  const totals = useMemo(() => {
    if (!data) return { total: 0, bestIndex: -1 };
    const total = data.reduce((s, m) => s + (m.count ?? 0), 0);
    const best = data.reduce(
      (acc, m, i) => (m.count > acc.count ? { index: i, count: m.count } : acc),
      { index: -1, count: -1 }
    );
    return { total, bestIndex: best.index };
  }, [data]);

  const downloadCsv = () => {
    if (!data) return;
    const header = "Month,Count\n";
    const rows = data.map((d) => `${d.month},${d.count}`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `repsnrecord_${year}_progress.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AuthGuard>
      <main className="min-h-screen p-6 bg-gradient-to-b from-pink-100 via-orange-100 to-white">
        <div className="mx-auto max-w-5xl space-y-6">
          {/* Header */}
          <header className="flex items-center justify-between">
            <h1 className="text-3xl font-extrabold text-pink-600">{year} Progress</h1>
            <div className="flex items-center gap-2">
              <button
                className="px-3 py-1 rounded-full bg-white/80 border border-orange-200 hover:bg-white shadow"
                onClick={() => setYear((y) => y - 1)}
                aria-label="Previous year"
              >
                ←
              </button>
              <button
                className="px-3 py-1 rounded-full bg-white/80 border border-orange-200 hover:bg-white shadow"
                onClick={() => setYear((y) => y + 1)}
                aria-label="Next year"
              >
                →
              </button>
              <button
                onClick={downloadCsv}
                className="ml-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-pink-500 to-amber-500 text-white font-semibold shadow"
              >
                Download CSV
              </button>
            </div>
          </header>

          {/* KPIs */}
          <section className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <Kpi label="Total workouts" value={(totals.total || 0).toString()} />
            <Kpi
              label="Best month"
              value={totals.bestIndex >= 0 ? MONTHS[totals.bestIndex] : "—"}
            />
            <Kpi
              label="Avg / month"
              value={data ? (totals.total / 12).toFixed(1) : "—"}
            />
          </section>

          {/* Chart */}
          <div className="rounded-3xl border border-orange-200/60 bg-white/85 backdrop-blur p-4 shadow-lg">
            <div className="h-80">
              {loading && <Skeleton />}
              {err && !loading && <p className="text-red-600">Error: {err}</p>}
              {!loading && !err && data && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" radius={[8, 8, 0, 0]} fill="url(#barFill)">
                      <LabelList dataKey="count" position="top" />
                    </Bar>
                    <defs>
                      <linearGradient id="barFill" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#ec4899" />
                        <stop offset="100%" stopColor="#f59e0b" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              )}
              {!loading && !err && data && totals.total === 0 && (
                <p className="text-center text-sm text-gray-500 mt-4">
                  No workouts yet for {year}. Log your first session to see progress!
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </AuthGuard>
  );
}

/* ---------- helpers ---------- */

function fillMissingMonths(incoming: Monthly[]): Monthly[] {
  const map = new Map(incoming.map((m) => [m.month, m.count]));
  return MONTHS.map((m) => ({ month: m, count: map.get(m) ?? 0 }));
}

async function safeText(r: Response) {
  try { return await r.text(); } catch { return "Request failed"; }
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/80 border border-orange-200 px-4 py-3 shadow">
      <p className="text-xs uppercase tracking-wide text-amber-600">{label}</p>
      <p className="text-2xl font-bold text-pink-600">{value}</p>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="animate-pulse h-full w-full rounded-xl bg-gradient-to-br from-white via-amber-50 to-white" />
  );
}
