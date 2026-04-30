import mongoose from 'mongoose';

const yogaSessionSchema = new mongoose.Schema({
  instructorId: { type: mongoose.Schema.Types.ObjectId, ref: 'YogaInstructor', required: true },
  sessionDate: { type: Date, required: true },
  sessionTime: { type: String, required: true, enum: ['Morning', 'Evening'] },
  sessionType: { type: String, enum: ['General', 'NCD', 'Pregnancy', 'Children', 'Elderly'] },
  expectedParticipants: Number,
  venue: { type: String, enum: ['Indoor', 'Outdoor'] },
  durationMinutes: Number,
  participants: {
    male: Number,
    female: Number,
    children: Number,
    other: Number
  },
  instructorPresent: { type: Boolean, default: false },
  activities: [{
    type: String,
    enum: ['Pranayama', 'Asanas', 'Surya Namaskar', 'Meditation', 'Health talk']
  }],
  photos: [String],
  geoLocation: { lat: Number, lng: Number },
  comments: String,
  centerId: { type: String },
  district: { type: String },
  verificationStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  verifiedAt: Date,
  rejectionReason: String
}, { timestamps: true });

export default mongoose.model('YogaSession', yogaSessionSchema);