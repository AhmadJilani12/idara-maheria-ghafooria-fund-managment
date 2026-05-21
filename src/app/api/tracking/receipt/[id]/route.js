import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Donation from "@/models/donation";
import Donor from "@/models/donor";

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "Receipt ID is required" },
        { status: 400 }
      );
    }

    // Find the donation by receiptId
    const donation = await Donation.findOne({ receiptId: id }).populate('donorId');

    if (!donation) {
      return NextResponse.json(
        { error: "Receipt not found. Please check the ID and try again." },
        { status: 404 }
      );
    }

    return NextResponse.json(donation);
  } catch (error) {
    console.error("Verify Receipt API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
