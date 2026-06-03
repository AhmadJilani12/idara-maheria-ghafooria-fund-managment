import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Attendance from "@/models/attendance";

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    
    const teacherId = searchParams.get('teacherId');
    const startDateStr = searchParams.get('startDate');
    const endDateStr = searchParams.get('endDate');

    let query = {};

    if (teacherId) {
      query.teacherId = teacherId;
    }

    if (startDateStr || endDateStr) {
      query.date = {};
      if (startDateStr) {
        const start = new Date(startDateStr + 'T00:00:00');
        query.date.$gte = start;
      }
      if (endDateStr) {
        const end = new Date(endDateStr + 'T23:59:59');
        query.date.$lte = end;
      }
    }

    const history = await Attendance.find(query)
      .populate('teacherId', 'name designation')
      .sort({ date: -1, createdAt: -1 });

    return NextResponse.json(history);
  } catch (error) {
    console.error("Fetch History Error:", error);
    return NextResponse.json({ error: "Failed to fetch attendance history" }, { status: 500 });
  }
}
