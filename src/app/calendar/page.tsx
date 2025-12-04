"use client";
import React, { useState, useEffect } from "react";
import "./calendar.css";
import toast, { Toaster } from "react-hot-toast";

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

  // 🔥 NEW — streak state
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [streakDays, setStreakDays] = useState<string[]>([]);

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDay = firstDay.getDay();
  const daysInMonth = lastDay.getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // Fetch logged workouts (with userId header)
  const fetchWorkouts = async () => {
    try {
      const res = await fetch("/api/workouts", {
        headers: { "userId": "demo-user" }
      });
      if (!res.ok) throw new Error("Failed to fetch workouts");
      const data = await res.json();
      setLoggedDays(data.map((w: any) => w.date));
    } catch (err) {
      console.error("Error fetching workouts:", err);
    }
  };

  // Fetch streak data (with userId header)
  const fetchStreak = async () => {
    try {
      const res = await fetch("/api/streak", {
        headers: { "userId": "demo-user" }
      });

      if (!res.ok) throw new Error("Failed to fetch streak");

      const data = await res.json();

      setCurrentStreak(data.streak.currentStreak);
      setLongestStreak(data.streak.longestStreak);
      setStreakDays(data.streakDays);

    } catch (err) {
      console.error("Error fetching streak:", err);
    }
  };

  useEffect(() => {
    fetchWorkouts();
    fetchStreak();
  }, []);

  // Achievement popups
  useEffect(() => {
    if (currentStreak === 3) toast.success("🔥 3-Day Streak Achieved!");
    if (currentStreak === 7) toast.success("🏆 7-Day Streak Achieved!");
    if (currentStreak === 14) toast.success("💥 14-Day Mega Streak!");
  }, [currentStreak]);

  // Save workout
  const saveWorkout = async () => {
    if (!selectedDate || !workoutName || !sets || !reps) {
      alert("Required fields missing.");
      return;
    }

    try {
      const res = await fetch("/api/workouts", {
        method: "POST",
        headers: { "Content-Type": "application/json", "userId": "demo-user" },
        body: JSON.stringify({
          userId: "demo-user",
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
      fetchStreak(); // refresh streak after saving
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
      <Toaster />

      {/* STREAK SUMMARY */}
      <div className="streak-summary">
        <h2>🔥 Streak Summary</h2>
        <p>Current Streak: {currentStreak} days</p>
        <p>Longest Streak: {longestStreak} days</p>
      </div>

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
          <button onClick={prevMonth} className="nav-btn">← Previous</button>
          <h2 className="month-title">
            {currentDate.toLocaleString("default", { month: "long" })} {year}
          </h2>
          <button onClick={nextMonth} className="nav-btn">Next →</button>
        </div>

        {/* Calendar Grid */}
        <div className="calendar-grid">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="day-label">{day}</div>
          ))}

          {daysArray.map((day, idx) => {
            if (!day) return <div key={idx} className="empty-day"></div>;

            const dayString =
              `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

            const isLogged = loggedDays.includes(dayString);
            const isStreakDay = streakDays.includes(dayString);

            return (
              <div
                key={idx}
                className={`day-cell ${isLogged ? "logged" : ""} ${isStreakDay ? "streak-highlight" : ""}`}
              >
                <span className="day-num">{day}</span>
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
              <div className="form-section">
                <div className="form-group half">
                  <label>Date *</label>
                  <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
                </div>

                <div className="form-group half">
                  <label>Exercise Name *</label>
                  <input type="text" value={workoutName} onChange={(e) => setWorkoutName(e.target.value)} />
                </div>
              </div>

              <div className="form-section">
                <div className="form-group third">
                  <label>Sets *</label>
                  <input type="number" value={sets} onChange={(e) => setSets(e.target.value)} />
                </div>

                <div className="form-group third">
                  <label>Reps *</label>
                  <input type="number" value={reps} onChange={(e) => setReps(e.target.value)} />
                </div>

                <div className="form-group third">
                  <label>Weight (lbs)</label>
                  <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} />
                </div>
              </div>

              <div className="form-section">
                <div className="form-group full">
                  <label>Notes</label>
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
                </div>
              </div>

              <div className="modal-actions">
                <button onClick={saveWorkout} className="save-btn">Save Workout</button>
                <button onClick={() => setShowModal(false)} className="cancel-btn">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
