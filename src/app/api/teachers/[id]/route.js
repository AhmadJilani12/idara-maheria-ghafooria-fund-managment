import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Teacher from "@/models/teacher";

export async function GET(request, { params }) {
  try {
    await connectDB();
    const teacher = await Teacher.findById(params.id);
    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }
    return NextResponse.json(teacher);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch teacher" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    await connectDB();
    const body = await request.json();
    const updatedTeacher = await Teacher.findByIdAndUpdate(params.id, body, { new: true });
    if (!updatedTeacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }
    return NextResponse.json(updatedTeacher);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update teacher" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const deletedTeacher = await Teacher.findByIdAndDelete(params.id);
    if (!deletedTeacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Teacher deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete teacher" }, { status: 500 });
  }
}
