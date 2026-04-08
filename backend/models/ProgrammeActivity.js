import mongoose from 'mongoose';

const programmeActivitySchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, enum: ['Yoga', 'NCD', 'Awareness', 'Training', 'Camp'] },
  eventDate: Date,
  venue: String,
  organizingUnit: String,
  targetGroup: String,
  totalParticipants: Number,
  genderBreakdown: { male: Number, female: Number, children: Number, seniorCitizens: Number },
  staffInvolved: Number,
  externalAgencies: String,
  description: String,
  servicesProvided: [String],
  screeningsDone: [String],
  medicinesDistributed: Boolean,
  iecMaterialsUsed: { posters: Boolean, banners: Boolean, pamphlets: Boolean, digital: Boolean },
  photos: [String],
  centerId: { type: String },               // ← Permanent fix
  verificationStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  verifiedAt: Date,
  rejectionReason: String
}, { timestamps: true });

export default mongoose.model('ProgrammeActivity', programmeActivitySchema);