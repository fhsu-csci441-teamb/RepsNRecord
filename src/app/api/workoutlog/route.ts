import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { LogWorkout } from "@/models/workoutlogmodel";


// GET /api/workoutlog to fetch all workout logs
export async function GET(req: Request) 
{
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const date = searchParams.get("date");

    if (!userId || !date) 
    {
        return NextResponse.json({ error: "Missing userId or date parameter" }, { status: 400 });
    }

    const filter: any = {};
    if (userId) filter.userId = userId;
    if (date) filter.date = date;

    const workouts = await LogWorkout.find(filter).sort({_id: -1});

    // Map MongoDB _id to id for frontend
    const formattedWorkouts = workouts.map(e => ({
        ...e.toObject(),
        id: e._id.toString(),
    }));
    return NextResponse.json(formattedWorkouts);
}

// POST /api/workoutlog to create a new workout log
export async function POST(req: Request)
{
    await dbConnect();
    const data = await req.json();
    const workout = await LogWorkout.create(data);

    const formattedWorkouts = {
        ...workout.toObject(),
        id: workout._id.toString(),
    }

    return NextResponse.json(formattedWorkouts);
}

// DELETE api/workoutlog to delete a workout log by ID
export async function DELETE(req: Request)
{
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) 
    {
        return NextResponse.json({ error: "Missing id parameter" }, { status: 400 });
    }
    
    
    const deleted = LogWorkout.findByIdAndDelete(id);

    if(!deleted)
    {
        return NextResponse.json({ error: "Workout not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Workout deleted" });
}