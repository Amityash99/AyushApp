
import mongoose from 'mongoose';

const yogaInstructorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  fatherName: String,
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  age: Number,
  address: String,
  mobile: String,
  email: String,
  qualification: String,
  certificationBody: String,
  workingStatus: { type: String, enum: ['Full-time', 'Part-time', 'Outsourced', 'Honorarium'] },
  assignedCenter: { type: String, required: true },
  dateOfJoining: Date,
  contractValidity: Date,
  availabilityStatus: { type: String, enum: ['Available', 'On Leave', 'Expired'], default: 'Available' },
  documents: {
    idProof: String,
    qualificationCertificates: [String],
    contractAgreement: String
  },
  bankDetails: {
    accountNumber: String,
    ifscCode: String,
    bankName: String,
    accountHolderName: String
  },
  centerId: { type: String },
  district: { type: String },
  verificationStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  verifiedAt: Date,
  rejectionReason: String
}, { timestamps: true });

// Auto-disable when contract expires
yogaInstructorSchema.methods.checkExpiry = async function() {
  if (this.contractValidity && new Date() > this.contractValidity) {
    this.availabilityStatus = 'Expired';
    await this.save();
  }
};

export default mongoose.model('YogaInstructor', yogaInstructorSchema);