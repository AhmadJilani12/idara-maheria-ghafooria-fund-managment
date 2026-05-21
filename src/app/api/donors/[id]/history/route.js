import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Donation from "@/models/donation";
import Donor from "@/models/donor";

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: "Donor ID is required" }, { status: 400 });
    }

    // 1. Get donor details
    const donor = await Donor.findById(id);
    if (!donor) {
      return NextResponse.json({ error: "Donor not found" }, { status: 404 });
    }

    // 2. Get all donations for this donor
    const history = await Donation.find({ donorId: id }).sort({ date: -1 });

    // 3. Calculate lifetime total
    const lifetimeTotal = history.reduce((sum, record) => sum + record.amount, 0);

    return NextResponse.json({
      donor,
      history,
      lifetimeTotal,
      transactionCount: history.length
    });

  } catch (error) {
    console.error("Donor History API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
