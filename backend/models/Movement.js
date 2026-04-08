import mongoose from 'mongoose';

const movementSchema = new mongoose.Schema({
  staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'StaffHR', required: true },
  dateTime: { type: Date, required: true },
  destination: String,
  reason: String,
  officialInvited: Boolean,
  remarks: String,
  centerId: { type: String },               // ← Permanent fix
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.model('Movement', movementSchema);