import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Donor from "@/models/donor";

export async function GET() {
  try {
    await connectDB();
    const donors = await Donor.find({}).sort({ createdAt: -1 });
    return NextResponse.json(donors);
  } catch (error) {
    console.error("Error fetching donors:", error);
    return NextResponse.json(
      { error: "Failed to fetch donors" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    
    // 1. Basic validation
    if (!body.name || !body.phone) {
      return NextResponse.json(
        { error: "Name and Phone Number are required" },
        { status: 400 }
      );
    }

    // 2. MANUAL CHECK: Check if phone already exists (more reliable than just waiting for error)
    const existingDonor = await Donor.findOne({ phone: body.phone });
    if (existingDonor) {
      return NextResponse.json(
        { error: `Phone number ${body.phone} is already registered to ${existingDonor.name}.` },
        { status: 400 }
      );
    }

    // 3. Prepare data
    const donorData = {
      name: body.name,
      email: body.email || "",
      phone: body.phone,
      address: body.address || "",
      type: body.type || "monthly",
      monthlyAmount: Number(body.monthlyAmount) || 0,
      isActive: body.status === "active",
    };

    const newDonor = await Donor.create(donorData);
    return NextResponse.json(newDonor, { status: 201 });
  } catch (error) {
    console.error("Detailed error creating donor:", error);
    return NextResponse.json(
      { error: "Failed to create donor", message: error.message },
      { status: 500 }
    );
  }
}
