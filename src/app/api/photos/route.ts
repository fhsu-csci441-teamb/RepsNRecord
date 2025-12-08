import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { Photo } from "@/models/photomodel";

// GET /api/photos?month=YYYY-MM&userId=xxx
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const month = searchParams.get("month");
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const query: Record<string, unknown> = { userId };

    if (month) {
      // Filter by month: YYYY-MM
      const startDate = new Date(`${month}-01T00:00:00Z`);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);

      query.takenAt = {
        $gte: startDate,
        $lt: endDate,
      };
    }

    const photos = await Photo.find(query)
      .sort({ takenAt: -1, createdAt: -1 })
      .lean();

    return NextResponse.json(photos);
  } catch (error) {
    console.error("Error fetching photos:", error);
    return NextResponse.json(
      { error: "Failed to fetch photos" },
      { status: 500 }
    );
  }
}

// POST /api/photos - Save photo metadata after client uploads to Firebase Storage
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { userId, fileUrl, thumbUrl, mimeType, bytes, width, height, takenAt, description } = body;

    if (!userId || !fileUrl || !thumbUrl) {
      return NextResponse.json(
        { error: "userId, fileUrl, and thumbUrl are required" },
        { status: 400 }
      );
    }

    const photo = await Photo.create({
      userId,
      fileUrl,
      thumbUrl,
      mimeType,
      bytes,
      width,
      height,
      takenAt: takenAt ? new Date(takenAt) : null,
      description,
    });

    return NextResponse.json(photo, { status: 201 });
  } catch (error) {
    console.error("Error creating photo:", error);
    return NextResponse.json(
      { error: "Failed to create photo" },
      { status: 500 }
    );
  }
}

// DELETE /api/photos?id=xxx&userId=xxx
export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");
    const userId = searchParams.get("userId");

    if (!id || !userId) {
      return NextResponse.json(
        { error: "id and userId are required" },
        { status: 400 }
      );
    }

    const result = await Photo.findOneAndDelete({ _id: id, userId });

    if (!result) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Photo deleted successfully" });
  } catch (error) {
    console.error("Error deleting photo:", error);
    return NextResponse.json(
      { error: "Failed to delete photo" },
      { status: 500 }
    );
  }
}
