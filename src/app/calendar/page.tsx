"use client";
import React, { useState, useEffect, useCallback } from "react";
import { auth } from "@/lib/firebase";
import "./calendar.css";

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loggedDays, setLoggedDays] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [workoutName, setWorkoutName] = useState("");
  const [sets, setSets] = useState("");
  const [reps, setReps] = useState("");
  const [weight, setWeight] = useState("");
  const [notes, setNotes] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDay = firstDay.getDay();
  const daysInMonth = lastDay.getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

useEffect(() => {
  const unsubscribe = auth.onAuthStateChanged((user) => {
    setUserId(user?.uid || null);
  });
  return () => unsubscribe();
}, []);

  interface Workout {
    userId?: string;
    date: string;
    exerciseName?: string;
    sets?: number;
    reps?: number;
    weight?: number;
    notes?: string;
  }

  // Fetch logged workouts
  const fetchWorkouts = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch(`/api/workouts?userId=${userId}`);
      if (!res.ok) throw new Error("Failed to fetch workouts");
      const data = await res.json();
      setLoggedDays(data.map((w: Workout) => w.date));
    } catch (err) {
      console.error("Error fetching workouts:", err);
    }
  }, [userId]);

  useEffect(() => {
    fetchWorkouts();
  }, [fetchWorkouts]);

 
  // Save workout
    const saveWorkout = async () => {
    if (!userId) {
      alert("Please log in to save workouts.");
      return;
    }
      if (!selectedDate || !workoutName || !sets || !reps) {
        alert("Please fill in required fields (date, name, sets, reps).");
        return;
      }
  
      try {
        const res = await fetch("/api/workouts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: userId,
            date: selectedDate,
            exerciseName: workoutName,
            sets: parseInt(sets),
            reps: parseInt(reps),
            weight: parseInt(weight) || 0,
            notes,
          }),
        });
  
        if (!res.ok) throw new Error("Failed to save workout");
  
        setShowModal(false);
        setSelectedDate("");
        setWorkoutName("");
        setSets("");
        setReps("");
        setWeight("");
        setNotes("");
        fetchWorkouts();
      } catch (err) {
        console.error("Error saving workout:", err);
        alert("Failed to save workout");
      }
    };

  // Build calendar grid
  const daysArray = [];
  for (let i = 0; i < startDay; i++) daysArray.push(null);
  for (let i = 1; i <= daysInMonth; i++) daysArray.push(i);

  return (
    <div className="calendar-page">
      {/* Header */}
      <div className="calendar-header">
        <h1>💪 Workout Calendar</h1>
        <button className="log-workout-btn" onClick={() => setShowModal(true)}>
          + Log Workout
        </button>
      </div>

      {/* Month Navigation */}
      <div className="calendar-wrapper">
        <div className="month-nav">
          <button onClick={prevMonth} className="nav-btn">
            ← Previous
          </button>
          <h2 className="month-title">
            {currentDate.toLocaleString("default", { month: "long" })} {year}
          </h2>
          <button onClick={nextMonth} className="nav-btn">
            Next →
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="calendar-grid">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="day-label">
              {day}
            </div>
          ))}

          {daysArray.map((day, idx) => {
            if (!day) return <div key={idx} className="empty-day"></div>;

            const dayString = `${year}-${String(month + 1).padStart(
              2,
              "0"
            )}-${String(day).padStart(2, "0")}`;
            const isLogged = loggedDays.includes(dayString);

            return (
              <div key={idx} className={`day-cell ${isLogged ? "logged" : ""}`}>
                {isLogged ? (
                  <div className="ring-wrapper">
                    <svg
                      width="90"
                      height="90"
                      viewBox="0 0 90 90"
                      className="completion-svg"
                    >
                      <circle
                        cx="45"
                        cy="45"
                        r="38"
                        fill="none"
                        stroke="url(#gradient1)"
                        strokeWidth="8"
                      />
                      <circle
                        cx="45"
                        cy="45"
                        r="28"
                        fill="none"
                        stroke="url(#gradient2)"
                        strokeWidth="6"
                      />
                      <circle cx="45" cy="45" r="20" fill="url(#gradient3)" />
                      <defs>
                        <linearGradient
                          id="gradient1"
                          x1="0%"
                          y1="0%"
                          x2="100%"
                          y2="100%"
                        >
                          <stop offset="0%" stopColor="#ff4d6d" />
                          <stop offset="100%" stopColor="#ff9966" />
                        </linearGradient>
                        <linearGradient
                          id="gradient2"
                          x1="0%"
                          y1="0%"
                          x2="100%"
                          y2="100%"
                        >
                          <stop offset="0%" stopColor="#ff9966" />
                          <stop offset="100%" stopColor="#ffd166" />
                        </linearGradient>
                        <linearGradient
                          id="gradient3"
                          x1="0%"
                          y1="0%"
                          x2="100%"
                          y2="100%"
                        >
                          <stop offset="0%" stopColor="#ffd166" />
                          <stop offset="100%" stopColor="#fff9e6" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <span className="day-num-ring">{day}</span>
                  </div>
                ) : (
                  <span className="day-num">{day}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Log Workout 💪</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              {/* Section 1: Date & Exercise */}
              <div className="form-section">
                <div className="form-group half">
                  <label>Date *</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group half">
                  <label>Exercise Name *</label>
                  <input
                    type="text"
                    placeholder="e.g., Bench Press"
                    value={workoutName}
                    onChange={(e) => setWorkoutName(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Section 2: Sets / Reps / Weight */}
              <div className="form-section">
                <div className="form-group third">
                  <label>Sets *</label>
                  <input
                    type="number"
                    placeholder="4"
                    value={sets}
                    onChange={(e) => setSets(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group third">
                  <label>Reps *</label>
                  <input
                    type="number"
                    placeholder="12"
                    value={reps}
                    onChange={(e) => setReps(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group third">
                  <label>Weight (lbs)</label>
                  <input
                    type="number"
                    placeholder="185"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                  />
                </div>
              </div>

              {/* Section 3: Notes */}
              <div className="form-section">
                <div className="form-group full">
                  <label>Notes</label>
                  <textarea
                    placeholder="Optional notes..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>

              {/* Section 4: Actions */}
              <div className="modal-actions">
                <button onClick={saveWorkout} className="save-btn">
                  Save Workout
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="cancel-btn"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}