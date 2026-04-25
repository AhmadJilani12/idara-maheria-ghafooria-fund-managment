import mongoose from "mongoose";

const donorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    type: {
      type: String,
      enum: ["monthly", "occasional", "internal"],
      default: "monthly",
    },

    monthlyAmount: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Donor || mongoose.model("Donor", donorSchema);