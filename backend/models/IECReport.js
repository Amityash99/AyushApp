import mongoose from 'mongoose';

const iecReportSchema = new mongoose.Schema({
  planId: { type: mongoose.Schema.Types.ObjectId, ref: 'IECPlan' },
  centerId: String,
  district: String,
  activityDate: Date,
  location: String,
  activityType: { type: String, enum: ['Posters displayed', 'Wall painting', 'Hoarding installation', 'Community event', 'School awareness activity', 'Health camp IEC'] },
  materialUsed: [String],
  quantityUsed: Number,
  materialReceived: Number,
  photos: [String],
  geoLocation: { lat: Number, lng: Number },
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  verificationStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  verifiedAt: Date,
  rejectionReason: String
}, { timestamps: true });

export default mongoose.model('IECReport', iecReportSchema);