import mongoose from "mongoose";

const donationSchema = new mongoose.Schema(
  {
    // 🔗 optional donor link
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Donor",
      default: null,
    },

    // 👤 fallback (for guest/unknown)
    donorName: {
      type: String,
      default: "Unknown",
    },

    phone: {
      type: String,
      default: "",
    },

    // 💵 amount
    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    // 📌 donation type
    type: {
      type: String,
      enum: ["monthly", "extra", "guest", "internal"],
      required: true,
    },

    // 📅 month grouping
    month: {
      type: String, // 
      required: true,
    },

    // 🧾 UNIQUE RECEIPT ID (human readable)
    receiptId: {
      type: String,
      unique: true,
      required: true,
    },

    // 🆔 internal tracking ID (Mongo style reference)
    trackingId: {
      type: String,
      unique: true,
      required: true,
    },

    // 📅 actual date
    date: {
      type: Date,
      default: Date.now,
    },

    // 📝 extra note
    note: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// 🧠 auto-generate receipt + tracking ID before save
// Cache buster: v2
donationSchema.pre("validate", async function () {
  try {
    if (!this.receiptId) {
      this.receiptId = `RCP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    }

    if (!this.trackingId) {
      this.trackingId = `TRK-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    }
  } catch (err) {
    console.error("Error in donation pre-validate hook:", err);
    throw err;
  }
});

// 🧠 Force clear model from cache to resolve "next is not a function" issue
if (mongoose.models.Donation) {
  delete mongoose.models.Donation;
}

export default mongoose.model("Donation", donationSchema);