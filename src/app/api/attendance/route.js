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
    
    // Force Asia/Karachi (Pakistan) Timezone for consistent calculations
    const formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Karachi',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: 'numeric',
      hour12: false
    });

    const parts = formatter.formatToParts(now);
    const getPart = (type) => parts.find(p => p.type === type).value;
    
    const pkYear = getPart('year');
    const pkMonth = getPart('month');
    const pkDay = getPart('day');
    const pkHour = parseInt(getPart('hour'));
    
    // If bodyDate is provided, use it, otherwise use Pakistan local date
    const dateStr = bodyDate || `${pkYear}-${pkMonth}-${pkDay}`;
    const today = new Date(dateStr + 'T00:00:00');
    
    console.log(`Attendance Scan (PK Time): Teacher=${teacherId}, Hour=${pkHour}, Date=${dateStr}`);

    // Find existing record for today
    let record = await Attendance.findOne({ teacherId, date: today });

    if (pkHour >= 5 && pkHour < 12) {
      // CHECK-IN WINDOW (5 AM - 12 PM PKT)
      if (!record) {
        record = await Attendance.create({
          teacherId,
          date: today,
          checkIn: now,
          status: 'Present',
          note: 'Face Scan Check-in (PKT)'
        });
        console.log("Check-in created:", record._id);
      } else {
        return NextResponse.json({ message: "Already checked in.", data: record }, { status: 200 });
      }
    } else if (pkHour >= 12 && pkHour < 23) {
      // CHECK-OUT WINDOW (12 PM - 11 PM PKT)
      if (record) {
        record.checkOut = now;
        record.note = (record.note || '') + (record.note?.includes('Check-out') ? '' : ' | Face Scan Check-out (PKT)');
        await record.save();
        console.log("Check-out updated:", record._id);
      } else {
        record = await Attendance.create({
          teacherId,
          date: today,
          checkIn: null, 
          checkOut: now,
          status: 'Present',
          note: 'Missed Check-in, Scanned for Check-out (PKT)'
        });
        console.log("Check-out created (missed check-in):", record._id);
      }
    } else {
      const msg = pkHour < 5 ? `Too early! It's currently ${pkHour}:00 AM. Attendance starts after 5:00 AM.` : "Attendance window closed for today.";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    console.error("Attendance POST Error:", error);
    return NextResponse.json({ error: "Failed to save attendance: " + error.message }, { status: 500 });
  }
}
