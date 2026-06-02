import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ['Present', 'Absent', 'Leave'], default: 'Present' },
  note: { type: String },
}, { timestamps: true });

// Ensure one attendance record per teacher per day
attendanceSchema.index({ teacherId: 1, date: 1 }, { unique: true });

export default mongoose.models.Attendance || mongoose.model('Attendance', attendanceSchema);
