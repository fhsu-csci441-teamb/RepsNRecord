// backend/data_collection/collect_data.ts
// Written by: Simranjit Sandhu
// Tested by: Simranjit Sandhu
// Debugged by: Simranjit Sandhu
// Unit test for data collection functionality

import fetch from "node-fetch";
import fs from "fs";
import path from "path";

type Workout = {
  _id?: string;
  userId: string;
  date: string;
  exerciseName: string;
  sets: number;
  reps: number;
  weight?: number;
};

// API and output file constants
const API_URL = "http://localhost:3000/api/workout-days";
const OUTPUT_FILE = path.join(__dirname, "dataoutput.json");

//  Create a new workout entry
async function createWorkout(): Promise<Workout> {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: "collector_user",
      date: new Date().toISOString(),
      exerciseName: "Data Collection Squats",
      sets: 4,
      reps: 10,
      weight: 50,
    }),
  });

  if (!res.ok) {
    throw new Error(`Failed to create workout: ${res.statusText}`);
  }

  const data = (await res.json()) as Workout;
  console.log("Created Workout:", data);
  return data;
}

// Fetch all workouts
async function getWorkouts(): Promise<Workout[]> {
  const res = await fetch(API_URL);
  if (!res.ok) {
    throw new Error(`Failed to fetch workouts: ${res.statusText}`);
  }

  const data = (await res.json()) as Workout[];
  console.log("Retrieved Workouts:", data.length);
  return data;
}

//  Save results to a local file
async function saveToFile(data: any) {
  try {
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2), "utf-8");
    console.log(`Data saved to ${OUTPUT_FILE}`);
  } catch (err) {
    console.error("Failed to write file:", err);
  }
}


(async () => {
  try {
    console.log("Starting data collection...");
    const createdWorkout = await createWorkout();
    const allWorkouts = await getWorkouts();

    const output = {
      timestamp: new Date().toISOString(),
      newWorkout: createdWorkout,
      totalWorkouts: allWorkouts.length,
      workouts: allWorkouts,
    };

    await saveToFile(output);
    console.log("Data collection completed successfully!");
  } catch (err) {
    console.error("Data collection failed:", err);
  }
})();
