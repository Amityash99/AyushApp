
import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'StaffHR', required: true },
  date: { type: Date, required: true },
  present: { type: Boolean, default: false },
  onLeave: { type: Boolean, default: false },
  leaveType: { type: String, enum: ['EL', 'CL', 'ML', 'Other'] },
  remarks: String,
  centerId: { type: String },               // ← Permanent fix: store user's center ID
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.model('Attendance', attendanceSchema);