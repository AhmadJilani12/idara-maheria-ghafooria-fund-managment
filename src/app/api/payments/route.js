import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Donation from "@/models/donation";
import Donor from "@/models/donor";

// Get recent payments
export async function GET() {
  try {
    await connectDB();
    const donations = await Donation.find({})
      .sort({ date: -1 })
      .limit(50)
      .populate('donorId', 'name type');
    
    return NextResponse.json(donations);
  } catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json(
      { error: "Failed to fetch payments" },
      { status: 500 }
    );
  }
}

// Record a new payment
export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    
    const { donorId, amount, type, month, note } = body;

    if (!amount || !type || !month) {
      return NextResponse.json(
        { error: "Amount, type, and month are required" },
        { status: 400 }
      );
    }

    let donorName = body.donorName || "Unknown";
    let phone = body.phone || "";

    // If donorId is provided, get the donor details
    if (donorId) {
      const donor = await Donor.findById(donorId);
      if (donor) {
        donorName = donor.name;
        phone = donor.phone;
      }
    }

    const newDonation = await Donation.create({
      donorId: donorId || null,
      donorName,
      phone,
      amount: Number(amount),
      type,
      month,
      note: note || "",
      date: body.date || new Date(),
    });

    return NextResponse.json(newDonation, { status: 201 });
  } catch (error) {
    console.error("Error creating payment:", error);
    return NextResponse.json(
      { error: "Failed to record payment", message: error.message },
      { status: 500 }
    );
  }
}
