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

    // 2.1 Get all other donations for this specific month (for history view)
    const otherDonations = await Donation.find({
      month: targetMonthString,
      type: { $ne: "monthly" }
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
    let monthlyCollected = 0;
    let otherCollected = 0;
    let monthlyExpected = 0;

    monthlyDonors.forEach(donor => {
      const isPaid = paidDonorIds.has(donor._id.toString());
      
      if (isPaid) {
        const donation = monthlyDonations.find(d => d.donorId?.toString() === donor._id.toString());
        paidList.push({
          _id: donor._id,
          name: donor.name,
          phone: donor.phone,
          paidDate: donation?.date,
          receiptId: donation?.receiptId,
          amountPaid: donation?.amount,
          type: "monthly"
        });
        monthlyCollected += donation?.amount || 0;
        monthlyExpected += donor.monthlyAmount || 0;
      } else if (donor.isActive) {
        pendingList.push({
          _id: donor._id,
          name: donor.name,
          phone: donor.phone,
          monthlyAmount: donor.monthlyAmount,
        });
        monthlyExpected += donor.monthlyAmount || 0;
      }
    });

    // Add other donations to paidList
    otherDonations.forEach(donation => {
      paidList.push({
        _id: donation._id,
        name: donation.donorName,
        phone: donation.phone,
        paidDate: donation.date,
        receiptId: donation.receiptId,
        amountPaid: donation.amount,
        type: donation.type || "other"
      });
      otherCollected += donation.amount || 0;
    });

    return NextResponse.json({
      month: targetMonthString,
      stats: {
        totalDonors: monthlyDonors.length,
        paidCount: paidList.filter(p => p.type === 'monthly').length,
        otherCount: otherDonations.length,
        pendingCount: pendingList.length,
        monthlyExpected,
        monthlyCollected,
        monthlyPending: monthlyExpected - monthlyCollected,
        otherCollected,
        grandTotal: monthlyCollected + otherCollected
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
