"use client";
import AuthGuard from "@/components/AuthGuard";
import { useMemo, useState } from "react";

function buildMonth(year: number, month: number) {
  const first = new Date(year, month, 1);
  const startDay = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export default function CalendarPage() {
  const today = new Date();
  const [ym, setYm] = useState({ y: today.getFullYear(), m: today.getMonth() });

  const cells = useMemo(() => buildMonth(ym.y, ym.m), [ym]);
  const monthLabel = new Date(ym.y, ym.m, 1).toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  const prev = () => {
    const d = new Date(ym.y, ym.m - 1, 1);
    setYm({ y: d.getFullYear(), m: d.getMonth() });
  };
  const next = () => {
    const d = new Date(ym.y, ym.m + 1, 1);
    setYm({ y: d.getFullYear(), m: d.getMonth() });
  };

  return (
    <AuthGuard>
      {/*Gradient background to match app theme */}
      <main className="min-h-screen p-6 bg-gradient-to-b from-pink-100 via-orange-100 to-white">
        <div className="max-w-4xl mx-auto p-6 bg-white/80 rounded-3xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={prev}
              className="px-4 py-1.5 rounded-full bg-pink-200 hover:bg-pink-300 text-pink-700 font-medium transition"
            >
              ← Prev
            </button>

            <h1 className="text-3xl font-bold text-pink-600">{monthLabel}</h1>

            <button
              onClick={next}
              className="px-4 py-1.5 rounded-full bg-orange-200 hover:bg-orange-300 text-orange-700 font-medium transition"
            >
              Next →
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-2 text-center text-sm font-semibold text-pink-600 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-2">
            {cells.map((d, i) => (
              <div
                key={i}
                className={`aspect-square flex items-center justify-center rounded-2xl border text-base transition
                ${
                  d
                    ? "bg-gradient-to-tr from-pink-50 to-orange-50 hover:from-pink-100 hover:to-orange-100 cursor-pointer text-gray-700 font-medium"
                    : "bg-transparent text-transparent border-none"
                }`}
                onClick={() =>
                  d &&
                  (window.location.href = `/log?date=${ym.y}-${String(
                    ym.m + 1
                  ).padStart(2, "0")}-${String(d).padStart(2, "0")}`)
                }
              >
                {d ?? ""}
              </div>
            ))}
          </div>
        </div>
      </main>
    </AuthGuard>
  );
}
