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
import { Download, Send, X } from "lucide-react";

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
  const [exporting, setExporting] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [hasTrainer, setHasTrainer] = useState(false);
  const [sendingToTrainer, setSendingToTrainer] = useState(false);
  const [trainerMessage, setTrainerMessage] = useState("");
  const [showTrainerModal, setShowTrainerModal] = useState(false);
  const [shareSuccess, setShareSuccess] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUserId(user?.uid || null);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (userId) {
      fetch(`/api/trainer/share?visitorId=${userId}`)
        .then(res => {
          if (!res.ok) throw new Error('API error');
          return res.json();
        })
        .then(data => setHasTrainer(data.hasTrainer || false))
        .catch(() => setHasTrainer(false));
    }
  }, [userId]);
  const handleExport = async (format: "csv" | "zip-with-photos") => {
    if (!userId) return;
    setExporting(true);
    setShowExportMenu(false);

    try {
      let endpoint: string;
      let filename: string;
      const dateStr = new Date().toISOString().split("T")[0];

      if (format === "csv") {
        endpoint = `/api/export/csv?userId=${userId}`;
        filename = `workouts-export-${dateStr}.csv`;
      } else {
        endpoint = `/api/export/zip?userId=${userId}&includePhotos=true`;
        filename = `repsnrecord-export-${dateStr}.zip`;
      }
      
      // Get Firebase token for authentication
      const user = auth.currentUser;
      const token = user ? await user.getIdToken() : null;
      
      const response = await fetch(endpoint, {
        headers: token ? { "Authorization": `Bearer ${token}` } : {},
      });
      if (!response.ok) throw new Error("Export failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Export error:", err);
      alert("Failed to export data. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const handleSendToTrainer = async () => {
    if (!userId) return;
    setSendingToTrainer(true);

    try {
      const response = await fetch("/api/trainer/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: userId,
          exportType: "progress-summary",
          message: trainerMessage || null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setShareSuccess("Your progress has been sent to your trainer!");
        setShowTrainerModal(false);
        setTrainerMessage("");
        setTimeout(() => setShareSuccess(null), 5000);
      } else {
        alert(data.error || "Failed to send to trainer");
      }
    } catch (err) {
      console.error("Error sending to trainer:", err);
      alert("Failed to send to trainer. Please try again.");
    } finally {
      setSendingToTrainer(false);
    }
  };

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

            <div className="flex items-center gap-4">
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

              <div className="relative">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  disabled={exporting || !userId}
                  className="flex items-center gap-2 rounded-lg border border-pink-300 bg-white px-4 py-2 text-sm font-medium text-pink-600 shadow-sm hover:bg-pink-50 focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:opacity-50"
                  aria-expanded={showExportMenu}
                  aria-haspopup="true"
                >
                  <Download className="w-4 h-4" aria-hidden="true" />
                  {exporting ? "Exporting..." : "Export Data"}
                </button>
                
                {showExportMenu && (
                  <div className="absolute right-0 mt-2 w-64 rounded-lg border border-gray-200 bg-white shadow-lg z-10">
                    <div className="p-2">
                      <p className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase">Workouts Only</p>
                      <button
                        onClick={() => handleExport("csv")}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 rounded-md focus:outline-none focus:bg-pink-100"
                      >
                        Download CSV
                        <span className="block text-xs text-gray-500">Spreadsheet format</span>
                      </button>
                      <hr className="my-2 border-gray-200" />
                      <p className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase">Workouts + Photos</p>
                      <button
                        onClick={() => handleExport("zip-with-photos")}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 rounded-md focus:outline-none focus:bg-pink-100"
                      >
                        Download ZIP with Photos
                        <span className="block text-xs text-gray-500">Includes all your progress pictures</span>
                      </button>
                      {hasTrainer && (
                        <>
                          <hr className="my-2 border-gray-200" />
                          <p className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase">Share with Trainer</p>
                          <button
                            onClick={() => {
                              setShowExportMenu(false);
                              setShowTrainerModal(true);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 rounded-md focus:outline-none focus:bg-pink-100 flex items-center gap-2"
                          >
                            <Send className="w-4 h-4" aria-hidden="true" />
                            <div>
                              Send to Trainer
                              <span className="block text-xs text-gray-500">Share your progress directly</span>
                            </div>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
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

        {shareSuccess && (
          <div 
            className="fixed bottom-4 right-4 p-4 bg-green-500 text-white rounded-lg shadow-lg flex items-center gap-3 animate-pulse"
            role="alert"
          >
            <Send className="w-5 h-5" aria-hidden="true" />
            {shareSuccess}
          </div>
        )}

        {showTrainerModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">Send to Trainer</h3>
                <button
                  onClick={() => setShowTrainerModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>
              
              <p className="text-gray-600 mb-4">
                Your trainer will receive a summary of your workout progress including your recent workouts and stats.
              </p>

              <div className="mb-4">
                <label htmlFor="trainer-message" className="block text-sm font-medium text-gray-700 mb-1">
                  Add a message (optional)
                </label>
                <textarea
                  id="trainer-message"
                  value={trainerMessage}
                  onChange={(e) => setTrainerMessage(e.target.value)}
                  placeholder="Hey coach, check out my progress this week!"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowTrainerModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendToTrainer}
                  disabled={sendingToTrainer}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-500 to-orange-500 text-white rounded-lg hover:from-pink-600 hover:to-orange-600 font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {sendingToTrainer ? (
                    "Sending..."
                  ) : (
                    <>
                      <Send className="w-4 h-4" aria-hidden="true" />
                      Send
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </AuthGuard>
  );
}
