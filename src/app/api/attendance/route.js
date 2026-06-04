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
    console.log("DEBUG: POST Body:", body);
    const { teacherId, date: bodyDate } = body;

    if (!teacherId) {
      return NextResponse.json({ error: "Teacher ID is required" }, { status: 400 });
    }

    const now = new Date();
    console.log("DEBUG: Current Date:", now);
    
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
    // Ensure consistent date normalization to midnight
    const queryDate = new Date(dateStr + 'T00:00:00.000Z');
    
    console.log("DEBUG: Querying with Teacher:", teacherId, "Date:", queryDate);
    
    let record = await Attendance.findOne({ 
      teacherId, 
      date: queryDate 
    });
    
    console.log("DEBUG: Found record:", record ? record._id : "None");

    if (pkHour >= 5 && pkHour < 12) {
      // CHECK-IN WINDOW
      if (!record) {
        try {
            console.log("DEBUG: Attempting to create check-in...");
            record = await Attendance.create({
                teacherId,
                date: queryDate,
                checkIn: now,
                status: 'Present',
                note: 'Face Scan Check-in (PKT)'
            });
            console.log("Check-in created:", record._id);
        } catch (e) {
            // If creation fails due to duplicate, try to find again
            console.error("DEBUG: Create failed, retrying find:", e.message);
            record = await Attendance.findOne({ teacherId, date: queryDate });
            if (record) return NextResponse.json({ message: "Already checked in.", data: record }, { status: 200 });
            else throw e;
        }
      } else {
        return NextResponse.json({ message: "Already checked in.", data: record }, { status: 200 });
      }
    } else if (pkHour >= 12 && pkHour < 23) {
      // CHECK-OUT WINDOW
      if (!record) {
        console.log("DEBUG: Creating check-out record (missed check-in)...");
        try {
            record = await Attendance.create({
                teacherId,
                date: queryDate,
                checkIn: null, 
                checkOut: now,
                status: 'Present',
                note: 'Missed Check-in, Scanned for Check-out (PKT)'
            });
            console.log("Check-out created (missed check-in):", record._id);
        } catch (e) {
            console.error("DEBUG: Create failed, retrying find:", e.message);
            record = await Attendance.findOne({ teacherId, date: queryDate });
            if (record) {
                // proceed to update existing record
            } else throw e;
        }
      }
      
      if (record) {
        console.log("DEBUG: Updating check-out record...");
        record.checkOut = now;
        const existingNote = record.note || '';
        if (!existingNote.includes('Check-out')) {
          record.note = existingNote + ' | Face Scan Check-out (PKT)';
        }
        await record.save();
        console.log("Check-out updated:", record._id);
      }
    } else {
        const msg = pkHour < 5 ? `Too early! It's currently ${pkHour}:00 AM. Attendance starts after 5:00 AM.` : "Attendance window closed for today.";
        return NextResponse.json({ error: msg }, { status: 400 });
    }
    
    console.log("DEBUG: Record updated/created:", record._id);

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    console.error("Attendance POST Critical Error:", error);
    return NextResponse.json({ error: "Failed to save attendance: " + error.message }, { status: 500 });
  }
}
