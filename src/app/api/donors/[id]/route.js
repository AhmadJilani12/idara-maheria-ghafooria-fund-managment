import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Donor from "@/models/donor";

export async function GET(request, { params }) {
  try {
    await connectDB();
    const donor = await Donor.findById(params.id);
    if (!donor) {
      return NextResponse.json({ error: "Donor not found" }, { status: 404 });
    }
    return NextResponse.json(donor);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch donor" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const body = await request.json();
    await connectDB();
    
    // MANUAL CHECK: If phone is being changed, check if it's already used by someone else
    if (body.phone) {
      const duplicatePhone = await Donor.findOne({ 
        phone: body.phone, 
        _id: { $ne: params.id } // exclude current donor
      });
      
      if (duplicatePhone) {
        return NextResponse.json(
          { error: `Phone number ${body.phone} is already being used by ${duplicatePhone.name}.` },
          { status: 400 }
        );
      }
    }

    const updatedDonor = await Donor.findByIdAndUpdate(
      params.id,
      {
        name: body.name,
        email: body.email,
        phone: body.phone,
        address: body.address || "",
        type: body.type,
        monthlyAmount: body.monthlyAmount,
        isActive: body.status === 'active',
      },
      { new: true, runValidators: true }
    );

    if (!updatedDonor) {
      return NextResponse.json({ error: "Donor not found" }, { status: 404 });
    }

    return NextResponse.json(updatedDonor);
  } catch (error) {
    console.error("Error updating donor:", error);
    return NextResponse.json({ error: "Failed to update donor", message: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const deletedDonor = await Donor.findByIdAndDelete(params.id);
    if (!deletedDonor) {
      return NextResponse.json({ error: "Donor not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Donor deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete donor" }, { status: 500 });
  }
}
