import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Donor from "@/models/donor";
import Donation from "@/models/donation";

export async function GET() {
  try {
    await connectDB();

    // 1. Get Donor counts
    const totalDonors = await Donor.countDocuments({ isActive: true });
    const monthlyDonors = await Donor.countDocuments({ type: "monthly", isActive: true });

    // 2. Get Lifetime Collection
    const allDonations = await Donation.find({});
    const lifetimeTotal = allDonations.reduce((sum, d) => sum + (d.amount || 0), 0);

    // 3. Get Current Month Stats (ALL Types: Monthly + One-time + Extra)
    const currentMonthName = new Date().toLocaleDateString('en-US', { month: 'long' });
    const currentYear = new Date().getFullYear();
    const currentMonthString = `${currentMonthName} ${currentYear}`;

    const currentMonthDonations = await Donation.find({
      month: currentMonthString
    });

    const currentMonthTotal = currentMonthDonations.reduce((sum, d) => sum + (d.amount || 0), 0);
    const currentMonthCount = currentMonthDonations.length;

    // 4. Get recent payments for the dashboard table (strictly last 5)
    const recentPayments = await Donation.find({})
      .sort({ date: -1 })
      .limit(5)
      .lean();

    return NextResponse.json({
      counts: {
        totalDonors,
        monthlyDonors,
      },
      currentMonth: {
        total: currentMonthTotal,
        count: currentMonthCount,
        label: currentMonthString
      },
      lifetimeTotal,
      recentPayments
    });

  } catch (error) {
    console.error("Dashboard Stats API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard statistics" },
      { status: 500 }
    );
  }
}
