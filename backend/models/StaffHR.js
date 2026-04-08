import mongoose from 'mongoose';

const staffHRSchema = new mongoose.Schema({
  employeeId: { type: String, unique: true },
  name: { type: String, required: true },
  fatherName: String,
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  dateOfBirth: Date,
  contactNumber: String,
  email: String,
  address: String,
  designation: String,
  cadre: { type: String, enum: ['Ayurveda', 'Homoeopathy', 'Unani', 'Yoga', 'Naturopathy'] },
  currentPosting: String,
  postingType: { type: String, enum: ['Permanent', 'Temporary', 'Work-arrangement', 'On-deputation'] },
  recruitmentSource: String,
  dateOfJoiningService: Date,
  dateOfJoiningPresentOffice: Date,
  serviceStatus: { type: String, enum: ['Regular', 'Pay minus Scheme', 'Retired', 'Ex Serviceman'] },
  qualifications: [{ degree: String, institution: String, year: Number }],
  trainings: [{ name: String, date: Date }],
  documents: {
    photo: String,
    joiningLetter: String,
    transferOrder: String,
    trainingCertificates: [String]
  },
  centerId: { type: String },               // ← Permanent fix: store user's center ID
  verificationStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  verifiedAt: Date,
  rejectionReason: String
}, { timestamps: true });

export default mongoose.model('StaffHR', staffHRSchema);