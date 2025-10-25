"use client";
import { useState, useEffect } from "react";
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
import { auth } from "@/lib/firebase";

interface MonthData {
  month: string;
  count: number;
}

export default function ProgressPage() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [data, setData] = useState<MonthData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUserId(user?.uid || null);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (authLoading) return;
    
    if (!userId) {
      setData([]);
      setLoading(false);
      setError("Please log in to view your progress.");
      return;
    }

    const abortController = new AbortController();
    const currentUserId = userId;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/progress?userId=${currentUserId}&year=${year}`,
          { signal: abortController.signal }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch progress data");
        }

        const result = await response.json();
        
        if (currentUserId === userId && !abortController.signal.aborted) {
          setData(result);
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        console.error("Error fetching progress:", err);
        if (currentUserId === userId && !abortController.signal.aborted) {
          setError("Failed to load progress data. Please try again later.");
        }
      } finally {
        if (currentUserId === userId && !abortController.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      abortController.abort();
    };
  }, [userId, year, authLoading]);

  const totalWorkouts = data.reduce((sum, month) => sum + month.count, 0);
  const bestMonth = data.reduce(
    (max, month) => (month.count > max.count ? month : max),
    { month: "", count: 0 }
  );

  const isEmpty = totalWorkouts === 0;

  const yearOptions = [];
  for (let y = currentYear; y >= currentYear - 5; y--) {
    yearOptions.push(y);
  }

  return (
    <AuthGuard>
      <main className="min-h-screen p-6 bg-gradient-to-b from-pink-100 via-orange-100 to-white">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-3xl font-extrabold text-pink-600">
              Progress Tracker
            </h1>

            <div className="flex items-center gap-2">
              <label htmlFor="year-select" className="text-sm font-medium text-gray-700">
                Year:
              </label>
              <select
                id="year-select"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800"
            >
              <p className="font-medium">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-pink-200/60 bg-white/85 backdrop-blur p-6 shadow-lg">
              <p className="text-sm font-medium text-gray-600">Total Workouts</p>
              <p className="mt-2 text-4xl font-extrabold text-pink-600">
                {loading ? "..." : totalWorkouts}
              </p>
            </div>

            <div className="rounded-2xl border border-orange-200/60 bg-white/85 backdrop-blur p-6 shadow-lg">
              <p className="text-sm font-medium text-gray-600">Best Month</p>
              <p className="mt-2 text-4xl font-extrabold text-orange-600">
                {loading
                  ? "..."
                  : isEmpty
                  ? "—"
                  : `${bestMonth.month} (${bestMonth.count})`}
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-orange-200/60 bg-white/85 backdrop-blur p-6 shadow-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Monthly Workout Count
            </h2>

            {loading ? (
              <div className="h-80 flex items-center justify-center">
                <div className="animate-pulse space-y-4 w-full">
                  <div className="h-64 bg-gray-200 rounded"></div>
                  <div className="grid grid-cols-12 gap-2">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div key={i} className="h-4 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                </div>
              </div>
            ) : isEmpty ? (
              <div className="h-80 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-lg font-medium text-gray-500">
                    No workouts logged in {year} yet.
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    Start logging your workouts to see your progress!
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-80" aria-label={`Monthly workout chart for ${year}`}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="month"
                      tick={{ fill: "#666" }}
                      axisLine={{ stroke: "#ddd" }}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fill: "#666" }}
                      axisLine={{ stroke: "#ddd" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                      }}
                      cursor={{ fill: "rgba(236, 72, 153, 0.1)" }}
                    />
                    <Bar
                      dataKey="count"
                      radius={[8, 8, 0, 0]}
                      fill="url(#barFill)"
                    >
                      <LabelList dataKey="count" position="top" fill="#666" />
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
            )}
          </div>
        </div>
      </main>
    </AuthGuard>
  );
}
