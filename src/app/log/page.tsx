"use client";
import AuthGuard from "@/components/AuthGuard";
import { auth } from "@/lib/firebase";
import { useMemo, useState, useEffect, use } from "react";

type Entry = {
  id: string; // MongoDB document ID
  userId: string;
  date: string;
  exerciseName: string;
  bodyPart: string;
  intensity: number;
  sets: number;
  reps: number;
};

// Constants for dropdown
const BODY_PARTS = ["Arms", "Legs", "Chest", "Back", "Abs"];

export default function LogPage() {
  // read ?date=YYYY-MM-DD (fallback to today)
  const date = useMemo(
    () => new URLSearchParams(window.location.search).get("date") ?? new Date().toISOString().slice(0, 10),
    []
  );

  const userId = auth.currentUser?.uid || "demo-user"; 
  //= "demo-user"; // TODO: replace with actual user ID from auth

  const [entries, setEntries] = useState<Entry[]>([]);
  const [form, setForm] = useState<Entry>({
    id: "00000" ,
    userId: 'demo-user',
    date: new Date().toISOString().slice(0, 10),
    exerciseName: "",
    bodyPart: "Arms",
    intensity: 3,
    sets: 3,
    reps: 10,
  });

  // Fetch existing workout entries when date changes
  useEffect(() => 
  {
    const fetchWorkouts = async () => 
      {
        const res = await fetch(`/api/workoutlog?userId=${userId}&date=${date}`);
        if (res.ok)
        {
          const data = await res.json();
          setEntries(data);
        }
        else {
          console.error("Failed to fetch workouts");
        }
      };
      fetchWorkouts();
  }, [date]);

  // Add a new workout entry
  const add =  async () => {
    if (!form.exerciseName.trim()) return;

    const newEntry = 
    {
      ...form,
      userId,
      date,
    }

    try {
      const res = await fetch("/api/workoutlog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEntry),
      });
      if (res.ok) 
      {
        const savedEntry = await res.json();
        setEntries((prev) => [savedEntry, ...prev]);
        setForm({ ...form, exerciseName: "", intensity: 3, sets: 3, reps: 10 });
      }
      else {
        console.error("Failed to save workout");
      }
    } catch (error) {
      console.error("Error saving workout:", error);
    }
    
  };

  // Remove a workout Entry by ID
  const remove = async (id: string) => {
    try {
      const res = await fetch(`/api/workoutlog?id=${id}`, { method: "DELETE" });
      if (res.ok)
      {
        setEntries((prev) => prev.filter((e) => e.id !== id));
      } 
      else 
      {
        console.error("Failed to delete workout");
      } 
    } catch (error) {
      console.error("Error deleting workout:", error);
    
    }
  };

  return (
    <AuthGuard>
      {/* Themed background to match the calendar page */}
      <main className="min-h-screen p-6 bg-gradient-to-b from-pink-100 via-orange-100 to-white">
        <div className="max-w-5xl mx-auto space-y-6">

          {/* Header */}
          <div className="flex items-baseline justify-between">
            <h1 className="text-3xl font-extrabold text-pink-600">Workout Log</h1>
            <div className="text-sm text-neutral-600">
              Date: <span className="font-mono">{date}</span>
            </div>
          </div>

          {/* Quick Add Card */}
          <div className="rounded-3xl border border-pink-200/60 bg-white/80 backdrop-blur p-5 shadow-lg">
            <div className="grid gap-3 md:grid-cols-7">
             
              {/* Exercise Name */}
              <div className = "flex flex-col">
                <label className= "text-sm font-semibold text-pink-700 mb-1">Exercise</label>

                <input
                  className="rounded-2xl border border-pink-200/70 bg-white/70 p-3 outline-none focus:ring-2 focus:ring-pink-300"
                  placeholder="Exercise (e.g., Squat)"
                  value={form.exerciseName}
                  onChange={(e) => setForm({ ...form, exerciseName: e.target.value })}
                />
              </div>

              {/*Body Part Dropdown*/}
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-pink-700 mb-1">Body Part</label>
                <select
                title="Body Part Dropdown"
                className="h-[50px] rounded-2xl border border-pink-200/70 bg-white/70 p-3 outline-none focus:ring-2 focus:ring-pink-300"
                value={form.bodyPart}
                onChange={(e) => setForm({ ...form, bodyPart: e.target.value })}
              >
                {BODY_PARTS.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
              </div>
              
              {/* Intensity */}
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-pink-700 mb-1">Intensity</label>
                <input
                type="number"
                min={1}
                max={5}
                className="rounded-2xl border border-pink-200/70 bg-white/70 p-3 outline-none focus:ring-2 focus:ring-pink-300"
                value={form.intensity}
                onChange={(e) => setForm({ ...form, intensity: Number(e.target.value) })}
                placeholder="Intensity 1–5"
              />
              </div>
              {/* Sets */}
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-pink-700 mb-1">Sets</label>
                <input
                type="number"
                min={1}
                className="rounded-2xl border border-pink-200/70 bg-white/70 p-3 outline-none focus:ring-2 focus:ring-pink-300"
                value={form.sets}
                onChange={(e) => setForm({ ...form, sets: Number(e.target.value) })}
                placeholder="Sets"
              />
              </div>
              
              {/*Reps */}
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-pink-700 mb-1">Reps</label>
                <input
                  type="number"
                  min={1}
                  className="flex-1 rounded-2xl border border-pink-200/70 bg-white/70 p-3 outline-none focus:ring-2 focus:ring-pink-300"
                  value={form.reps}
                  onChange={(e) => setForm({ ...form, reps: Number(e.target.value) })}
                  placeholder="Reps"
                />
              </div>
              
              {/* Add Button */}
              <div className="flex flex-col md:col-span-2 md:justify-end md:flex-row">
                
                <button
                  onClick={add}
                  className="rounded-2xl px-5 whitespace-nowrap bg-gradient-to-r from-pink-500 to-amber-400 text-white font-semibold shadow hover:opacity-90 transition"
                >
                  Add Entry
                </button>
              </div>
            </div>
          </div>

          {/* Table Card */}
          <div className="rounded-3xl overflow-hidden border border-orange-200/60 bg-white/80 backdrop-blur shadow-lg">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-pink-50 to-orange-50 text-pink-700">
                <tr>
                  <th className="text-left p-3">Exercise</th>
                  <th className="text-left p-3">Body Part</th>
                  <th className="text-left p-3">Intensity</th>
                  <th className="text-left p-3">Sets</th>
                  <th className="text-left p-3">Reps</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody>
                {entries.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-neutral-500">
                      No entries yet.
                    </td>
                  </tr>
                )}
                {entries.map((e) => (
                  <tr key={e.id} className="border-t border-orange-100/70">
                    <td className="p-3">{e.exerciseName}</td>
                    <td className="p-3">
                      <span className="inline-block rounded-full px-2 py-0.5 text-xs font-semibold bg-pink-100 text-pink-700">
                        {e.bodyPart}
                      </span>
                    </td>
                    <td className="p-3">{e.intensity} / 5</td>
                    <td className="p-3">{e.sets}</td>
                    <td className="p-3">{e.reps}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => remove(e.id)}
                        className="text-pink-600 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </main>
    </AuthGuard>
  );
}
