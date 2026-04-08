import mongoose from 'mongoose';

const brandingWorkSchema = new mongoose.Schema({
  centerId: String,
  district: String,
  brandingType: { type: String, enum: ['AAM Signboards', 'Front-facade branding', 'Inner wall branding', 'Herbal-garden signage', 'Room-wise branding', 'Citizen charter display', 'Staff duty display', 'OPD/IPD directional boards'] },
  status: { type: String, enum: ['Completed', 'Pending'], default: 'Pending' },
  pendingReason: String,
  beforePhoto: String,
  afterPhoto: String,
  completionPercentage: Number,
  contractorName: String,
  sanctioningAuthority: String,
  startDate: Date,
  completionDate: Date,
  workProgress: String,
  invoiceCopy: String,
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  verificationStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  verifiedAt: Date,
  rejectionReason: String
}, { timestamps: true });

export default mongoose.model('BrandingWork', brandingWorkSchema);