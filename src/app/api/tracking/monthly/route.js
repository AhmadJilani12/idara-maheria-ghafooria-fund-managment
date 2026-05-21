import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Donor from "@/models/donor";
import Donation from "@/models/donation";

export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const monthName = searchParams.get('month');
    const year = searchParams.get('year');

    if (!monthName || !year) {
      return NextResponse.json(
        { error: "Month and year are required" },
        { status: 400 }
      );
    }

    const targetMonthString = `${monthName} ${year}`;

    // 1. Get all monthly donors (Filter by active status for the initial list)
    const monthlyDonors = await Donor.find({ 
      type: "monthly"
    });

    // 2. Get all monthly donations for this specific month
    const monthlyDonations = await Donation.find({
      month: targetMonthString,
      type: "monthly"
    });

    // 3. Create a map of paid donor IDs for quick lookup
    const paidDonorIds = new Set(
      monthlyDonations
        .filter(d => d.donorId)
        .map(d => d.donorId.toString())
    );

    // 4. Process donors into paid and pending lists
    const paidList = [];
    const pendingList = [];
    let totalCollected = 0;
    let totalExpected = 0;

    monthlyDonors.forEach(donor => {
      const isPaid = paidDonorIds.has(donor._id.toString());
      
      // LOGIC: 
      // - If PAID: Always show in paid list (even if now inactive)
      // - If NOT PAID: Only show in pending list if donor IS ACTIVE
      
      if (isPaid) {
        const donation = monthlyDonations.find(d => d.donorId?.toString() === donor._id.toString());
        paidList.push({
          _id: donor._id,
          name: donor.name,
          phone: donor.phone,
          paidDate: donation?.date,
          receiptId: donation?.receiptId,
          amountPaid: donation?.amount
        });
        totalCollected += donation?.amount || 0;
        totalExpected += donor.monthlyAmount || 0; // Add to expected because they actually paid
      } else if (donor.isActive) {
        // Only add to pending if the donor is currently active
        pendingList.push({
          _id: donor._id,
          name: donor.name,
          phone: donor.phone,
          monthlyAmount: donor.monthlyAmount,
        });
        totalExpected += donor.monthlyAmount || 0;
      }
    });

    return NextResponse.json({
      month: targetMonthString,
      stats: {
        totalDonors: monthlyDonors.length,
        paidCount: paidList.length,
        pendingCount: pendingList.length,
        totalExpected,
        totalCollected,
        remaining: totalExpected - totalCollected
      },
      paidList,
      pendingList
    });

  } catch (error) {
    console.error("Tracking API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tracking data", message: error.message },
      { status: 500 }
    );
  }
}
