import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Teacher from "@/models/teacher";

export async function GET() {
  try {
    await connectDB();
    // Use .lean() to get raw objects and avoid schema stripping
    const teachers = await Teacher.find({}).sort({ createdAt: -1 }).lean();
    console.log("API Debug: First teacher faceDescriptor check:", !!teachers[0]?.faceDescriptor);
    return NextResponse.json(teachers);
  } catch (error) {
    console.error("Error fetching teachers:", error);
    return NextResponse.json(
      { error: "Failed to fetch teachers" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    
    if (!body.name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    const teacherData = {
      name: body.name,
      phone: body.phone || "",
      designation: body.designation || "",
      joiningDate: body.joiningDate ? new Date(body.joiningDate) : new Date(),
      salary: Number(body.salary) || 0,
      isActive: body.isActive !== undefined ? body.isActive : true,
    };

    const newTeacher = await Teacher.create(teacherData);
    return NextResponse.json(newTeacher, { status: 201 });
  } catch (error) {
    console.error("Error creating teacher:", error);
    return NextResponse.json(
      { error: "Failed to create teacher", message: error.message },
      { status: 500 }
    );
  }
}
