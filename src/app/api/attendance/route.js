import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Attendance from "@/models/attendance";
import Teacher from "@/models/teacher";

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get('date');
    const date = dateStr ? new Date(dateStr) : new Date();
    
    // Set to start and end of day
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));

    const attendance = await Attendance.find({
      date: { $gte: startOfDay, $lte: endOfDay }
    }).populate('teacherId', 'name');

    return NextResponse.json(attendance);
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return NextResponse.json(
      { error: "Failed to fetch attendance" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json(); // Array of { teacherId, status, date, note }
    
    if (!Array.isArray(body)) {
      return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
    }

    const results = await Promise.all(body.map(async (record) => {
      const date = record.date ? new Date(record.date) : new Date();
      date.setHours(0, 0, 0, 0);

      return await Attendance.findOneAndUpdate(
        { teacherId: record.teacherId, date },
        { status: record.status, note: record.note || "" },
        { upsert: true, new: true }
      );
    }));

    return NextResponse.json(results, { status: 201 });
  } catch (error) {
    console.error("Error saving attendance:", error);
    return NextResponse.json(
      { error: "Failed to save attendance", message: error.message },
      { status: 500 }
    );
  }
}
