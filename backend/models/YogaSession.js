import mongoose from 'mongoose';

const yogaSessionSchema = new mongoose.Schema({
  instructorId: { type: mongoose.Schema.Types.ObjectId, ref: 'YogaInstructor' },
  sessionDate: { type: Date, required: true },
  sessionTime: { type: String, required: true },
  sessionType: { type: String, enum: ['General', 'NCD', 'Pregnancy', 'Children', 'Elderly'] },
  expectedParticipants: Number,
  venue: { type: String, enum: ['Indoor', 'Outdoor'] },
  durationMinutes: Number,
  participants: {
    male: { type: Number, default: 0 },
    female: { type: Number, default: 0 },
    children: { type: Number, default: 0 },
    other: { type: Number, default: 0 }
  },
  instructorPresent: { type: Boolean, default: false },
  activities: [{
    type: String,
    enum: ['Pranayama', 'Asanas', 'Surya Namaskar', 'Meditation', 'Health talk']
  }],
  photos: [{ type: String }],
  geoLocation: { lat: Number, lng: Number },
  comments: String,
  centerId: { type: String },               // ← Permanent fix
  verificationStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  verifiedAt: Date,
  rejectionReason: String
}, { timestamps: true });

export default mongoose.model('YogaSession', yogaSessionSchema);