"use client";
import AuthGuard from "@/components/AuthGuard";
import {
  Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis,
  ResponsiveContainer, LabelList
} from "recharts";

const data = [
  { month: "Jan", count: 6 }, { month: "Feb", count: 8 }, { month: "Mar", count: 10 },
  { month: "Apr", count: 7 }, { month: "May", count: 11 }, { month: "Jun", count: 9 },
  { month: "Jul", count: 12 }, { month: "Aug", count: 8 }, { month: "Sep", count: 13 },
  { month: "Oct", count: 7 }, { month: "Nov", count: 9 }, { month: "Dec", count: 5 },
];

export default function ProgressPage() {
  return (
    <AuthGuard>
      <main className="min-h-screen p-6 bg-gradient-to-b from-pink-100 via-orange-100 to-white">
        <div className="max-w-5xl mx-auto space-y-4">
          <h1 className="text-3xl font-extrabold text-pink-600">2025 Progress</h1>

          <div className="rounded-3xl border border-orange-200/60 bg-white/85 backdrop-blur p-4 shadow-lg">
            <div className="h-80">
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
            </div>
          </div>
        </div>
      </main>
    </AuthGuard>
  );
}
