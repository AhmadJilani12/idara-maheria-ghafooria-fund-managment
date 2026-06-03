import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Attendance from "@/models/attendance";

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get('date'); // Expects YYYY-MM-DD
    
    // Use local time for start/end of day to match POST logic
    const baseDate = dateStr ? new Date(dateStr + 'T00:00:00') : new Date();
    const startOfDay = new Date(baseDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(baseDate);
    endOfDay.setHours(23, 59, 59, 999);

    const attendance = await Attendance.find({
      date: { $gte: startOfDay, $lte: endOfDay }
    }).populate('teacherId', 'name');

    return NextResponse.json(attendance);
  } catch (error) {
    console.error("Fetch Attendance Error:", error);
    return NextResponse.json({ error: "Failed to fetch attendance" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { teacherId, date: bodyDate } = body;

    if (!teacherId) {
      return NextResponse.json({ error: "Teacher ID is required" }, { status: 400 });
    }

    const now = new Date();
    // Ensure we use the date provided by the body (YYYY-MM-DD) or current local date
    const dateStr = bodyDate || now.toISOString().split('T')[0];
    const today = new Date(dateStr + 'T00:00:00');
    
    const hour = now.getHours();
    console.log(`Attendance Scan: Teacher=${teacherId}, Hour=${hour}, Date=${dateStr}`);

    // Find existing record for today
    let record = await Attendance.findOne({ teacherId, date: today });

    if (hour >= 5 && hour < 12) {
      // CHECK-IN WINDOW (5 AM - 12 PM) - Slightly expanded for flexibility
      if (!record) {
        record = await Attendance.create({
          teacherId,
          date: today,
          checkIn: now,
          status: 'Present',
          note: 'Face Scan Check-in'
        });
        console.log("Check-in created:", record._id);
      } else {
        // If they scan again during check-in window, just return success
        return NextResponse.json({ message: "Already checked in.", data: record }, { status: 200 });
      }
    } else if (hour >= 12 && hour < 23) {
      // CHECK-OUT WINDOW (12 PM - 11 PM)
      if (record) {
        // Only update check-out if it hasn't been set yet, or allow re-scan
        record.checkOut = now;
        record.note = (record.note || '') + (record.note?.includes('Check-out') ? '' : ' | Face Scan Check-out');
        await record.save();
        console.log("Check-out updated:", record._id);
      } else {
        // Teacher missed check-in but scanning for check-out
        record = await Attendance.create({
          teacherId,
          date: today,
          checkIn: null, 
          checkOut: now,
          status: 'Present',
          note: 'Missed Check-in, Scanned for Check-out'
        });
        console.log("Check-out created (missed check-in):", record._id);
      }
    } else {
      // Rest of the time (e.g., late night or very early morning)
      const msg = hour < 5 ? "Attendance starts after 5:00 AM" : "Attendance window closed for today";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    console.error("Attendance POST Error:", error);
    return NextResponse.json({ error: "Failed to save attendance: " + error.message }, { status: 500 });
  }
}
