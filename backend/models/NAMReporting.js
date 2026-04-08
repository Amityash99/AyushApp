import mongoose from 'mongoose';

const namReportingSchema = new mongoose.Schema({
  formName: { type: String, required: true },
  centerId: { type: String, required: true }, // ← Required for filtering
  district: { type: String },
  data: { type: Object, required: true }, // dynamic form data
  status: { type: String, enum: ['draft', 'pending', 'approved', 'rejected'], default: 'pending' },
  deadline: Date,
  submittedAt: Date,
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  verifiedAt: Date,
  rejectionReason: String
}, { timestamps: true });

export default mongoose.model('NAMReporting', namReportingSchema);