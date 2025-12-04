import { NextResponse } from "next/server";
import { PDFDocument, rgb } from "pdf-lib";
import Workout from "@/models/WorkoutDay";
import {dbConnect} from "@/lib/mongodb";

function drawVerticalGradient(page: any, width: number, height: number) {
  const steps = 100;
  const start = { r: 1, g: 0.4, b: 0.6 }; // pink
  const end = { r: 1, g: 0.65, b: 0 };   // orange

  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);

    const r = start.r + (end.r - start.r) * t;
    const g = start.g + (end.g - start.g) * t;
    const b = start.b + (end.b - start.b) * t;

    page.drawRectangle({
      x: 0,
      y: (height / steps) * i,
      width,
      height: height / steps,
      color: rgb(r, g, b),
    });
  }
}

function drawRoundedBox(page: any, x: number, y: number, w: number, h: number) {
  page.drawRectangle({
    x,
    y,
    width: w,
    height: h,
    color: rgb(1, 1, 1),
    opacity: 0.75,
    borderRadius: 16,
  });
}

export async function GET() {
  await dbConnect();

  const workouts = await Workout.find({}).sort({ date: 1 });

  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage();

  const { width, height } = page.getSize();

  drawVerticalGradient(page, width, height);

  // Title
  page.drawText("Workout Report", {
    x: width / 2 - 110,
    y: height - 70,
    size: 28,
    color: rgb(1, 1, 1),
  });

  let cursorY = height - 140;

  for (const w of workouts) {
    const boxHeight = 130;

    // Page break
    if (cursorY - boxHeight < 40) {
      page = pdfDoc.addPage();
      drawVerticalGradient(page, width, height);
      cursorY = height - 100;
    }

    drawRoundedBox(page, 40, cursorY - boxHeight, width - 80, boxHeight);

    // Workout fields
    page.drawText(` ${new Date(w.date).toLocaleDateString()}`, {
      x: 55,
      y: cursorY - 30,
      size: 16,
      color: rgb(0, 0, 0),
    });

    page.drawText(
      ` ${w.sets} sets × ${w.reps} reps${w.weight > 0 ? ` @ ${w.weight} lbs` : ""}`,
      {
        x: 55,
        y: cursorY - 60,
        size: 14,
        color: rgb(0, 0, 0),
      }
    );

    page.drawText(` Intensity: ${w.intensity}/5`, {
      x: 55,
      y: cursorY - 80,
      size: 14,
      color: rgb(0, 0, 0),
    });

    if (w.notes) {
      page.drawText(` Notes: ${w.notes}`, {
        x: 55,
        y: cursorY - 100,
        size: 12,
        color: rgb(0, 0, 0),
      });
    }

    cursorY -= boxHeight + 20;
  }

  const pdfBytes = await pdfDoc.save();

  return new NextResponse(pdfBytes, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "inline; filename=workout_report.pdf",
    },
  });
}
