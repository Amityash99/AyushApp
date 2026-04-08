import mongoose from 'mongoose';

const yogaInstructorAttendanceSchema = new mongoose.Schema({
  instructorId: { type: mongoose.Schema.Types.ObjectId, ref: 'YogaInstructor', required: true },
  date: { type: Date, required: true },
  present: { type: Boolean, default: false },
  reasonForAbsence: String,
  sessionsConducted: { type: Number, default: 0 },
  overtime: { type: Number, default: 0 }, // minutes
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.model('YogaInstructorAttendance', yogaInstructorAttendanceSchema);