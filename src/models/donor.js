import mongoose from "mongoose";

const donorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
    },

    phone: {
      type: String,
      trim: true,
      unique: true,
    },

    address: {
      type: String,
      trim: true,
      default: "",
    },

    type: {
      type: String,
      enum: ["monthly", "occasional", "onetime"],
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

// 🧠 Force clear model from cache to resolve potential caching issues
if (mongoose.models.Donor) {
  delete mongoose.models.Donor;
}

export default mongoose.model("Donor", donorSchema);