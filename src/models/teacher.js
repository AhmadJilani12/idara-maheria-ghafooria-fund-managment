import mongoose from 'mongoose';

// Clear the model from mongoose to force a re-definition in development
if (mongoose.models.Teacher) {
  delete mongoose.models.Teacher;
}

const teacherSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String },
  designation: { type: String },
  joiningDate: { type: Date, default: Date.now },
  salary: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  faceDescriptor: { type: [Number], default: undefined },
}, { timestamps: true, strict: false }); // strict: false to ensure all data is returned

export default mongoose.model('Teacher', teacherSchema);
