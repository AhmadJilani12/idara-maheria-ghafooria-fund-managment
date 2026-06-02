import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  category: { type: String, required: true }, // e.g., Utilities, Maintenance, Salary, Stationery
  amount: { type: Number, required: true },
  description: { type: String },
  paymentMethod: { type: String, default: 'Cash' },
  recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.models.Expense || mongoose.model('Expense', expenseSchema);
