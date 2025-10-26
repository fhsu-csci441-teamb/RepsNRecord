"use client";
import React, { useState, useEffect } from "react";

export default function LogPage() {
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWorkouts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/workouts");
      if (!res.ok) throw new Error("Failed to fetch workouts");
      const data = await res.json();
      setWorkouts(data);
    } catch (err) {
      console.error("Failed to fetch workouts:", err);
      setWorkouts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const deleteWorkout = async (id: string) => {
    if (!confirm("Delete this workout?")) return;
    try {
      const res = await fetch(`/api/workouts?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      fetchWorkouts();
    } catch (err) {
      console.error("Failed to delete workout:", err);
      alert("Failed to delete workout");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-500 via-orange-400 to-yellow-300">
        <p className="text-white text-xl font-bold">Loading workouts...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500 via-orange-400 to-yellow-300 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          💪 Workout Log
        </h1>

        {workouts.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center">
            <p className="text-gray-600 text-lg">No workouts logged yet.</p>
            <p className="text-gray-500 mt-2">
              Go to the{" "}
              <a href="/calendar" className="text-pink-500 font-bold underline">
                Calendar
              </a>{" "}
              to log your first workout!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {workouts.map((workout) => (
              <div
                key={workout._id}
                className="bg-white rounded-2xl p-6 shadow-lg flex justify-between items-center"
              >
                <div>
                  <h3 className="text-xl font-bold text-gray-800">
                    {workout.exerciseName || "Workout"}
                  </h3>
                  <p className="text-gray-600">📅 {workout.date}</p>
                  <p className="text-gray-600">
                    💪 {workout.sets} sets × {workout.reps} reps
                    {workout.weight > 0 && ` @ ${workout.weight} lbs`}
                  </p>
                  {workout.notes && (
                    <p className="text-gray-500 text-sm mt-1 italic">
                      "{workout.notes}"
                    </p>
                  )}
                </div>
                <button
                  onClick={() => deleteWorkout(workout._id)}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-600 transition"
                >
                  🗑️ Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}