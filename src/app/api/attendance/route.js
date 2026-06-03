import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Attendance from "@/models/attendance";

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get('date');
    const date = dateStr ? new Date(dateStr) : new Date();
    
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));

    const attendance = await Attendance.find({
      date: { $gte: startOfDay, $lte: endOfDay }
    }).populate('teacherId', 'name');

    return NextResponse.json(attendance);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch attendance" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    
    const now = new Date();
    const today = new Date(body.date || now);
    today.setHours(0, 0, 0, 0);

    const hour = now.getHours();
    
    // Find existing record for today
    let record = await Attendance.findOne({ teacherId: body.teacherId, date: today });

    if (hour >= 6 && hour < 12) {
      // CHECK-IN WINDOW (6 AM - 12 PM)
      if (!record) {
        record = await Attendance.create({
          teacherId: body.teacherId,
          date: today,
          checkIn: now,
          status: 'Present',
          note: 'Face Scan Check-in'
        });
      } else {
        return NextResponse.json({ message: "Already checked in today.", data: record });
      }
    } else if (hour >= 12) {
      // CHECK-OUT WINDOW (After 12 PM)
      if (record) {
        record.checkOut = now;
        record.note = (record.note || '') + ' | Face Scan Check-out';
        await record.save();
      } else {
        // Teacher missed check-in but scanning for check-out
        record = await Attendance.create({
          teacherId: body.teacherId,
          date: today,
          checkIn: null, // Missed check-in window
          checkOut: now,
          status: 'Present',
          note: 'Missed Check-in, Scanned for Check-out'
        });
      }
    } else {
      // Before 6 AM
      return NextResponse.json({ error: "Attendance starts after 6:00 AM" }, { status: 400 });
    }

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    console.error("Attendance Error:", error);
    return NextResponse.json({ error: "Failed to save attendance" }, { status: 500 });
  }
}
