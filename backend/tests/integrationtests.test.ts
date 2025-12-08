// backend/tests/integrationtests.ts
// Written by: Simranjit Sandhu
// Tested by: Simranjit Sandhu
// Debugged by: Simranjit Sandhu
// Integration tests for WorkoutDays API

import request from "supertest";
import mongoose from "mongoose";
import { NextResponse } from "next/server";
import WorkoutDay from "@/models/WorkoutDay";
import { GET, POST, DELETE } from "@/app/api/workouts/route";
const baseUrl = "http://localhost:3000"; 

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI!);
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("WorkoutDays API Integration Tests", () => {
  let createdWorkoutId: string;

  it("should create a new workout", async () => {
    const res = await request(baseUrl)
      .post("/api/workout-days")
      .send({
        userId: "testuser",
        date: "2025-10-30",
        exerciseName: "Push Ups",
        sets: 3,
        reps: 12,
        weight: 0,
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.exerciseName).toBe("Push Ups");
    createdWorkoutId = res.body._id;
  });

  it("should get all workouts", async () => {
    const res = await request(baseUrl).get("/api/workout-days");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("should delete a workout", async () => {
    const res = await request(baseUrl).delete(`/api/workout-days?id=${createdWorkoutId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Workout deleted successfully");
  });
});
