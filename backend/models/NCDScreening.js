import mongoose from 'mongoose';

const ncdScreeningSchema = new mongoose.Schema({
  campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'NCDCampaign' },
  beneficiary: {
    name: String,
    gender: String,
    age: Number,
    address: String,
    mobile: String,
    abhaId: String,
    aadhaar: String,
    incomeGroup: String
  },
  vitals: {
    height: Number,
    weight: Number,
    bmi: Number,
    bpSystolic: Number,
    bpDiastolic: Number,
    pulse: Number,
    bloodSugar: Number,
    waistCircumference: Number
  },
  riskFactors: {
    hypertension: String,
    diabetes: String,
    obesity: String,
    copd: String,
    mentalHealth: String,
    oralHealth: String,
    breastCancer: String,
    cervicalCancer: String
  },
  lifestyle: {
    tobacco: Boolean,
    alcohol: Boolean,
    physicalActivity: String,
    dietScore: Number,
    stressLevel: String
  },
  riskStratification: { type: String, enum: ['Low', 'Moderate', 'High'] },
  referral: {
    referred: Boolean,
    reason: String,
    to: String,
    date: Date,
    slipUrl: String
  },
  followUp: {
    visitDate: Date,
    outcome: String,
    medicationStarted: Boolean,
    finalStatus: String
  },
  centerId: { type: String },               // ← Permanent fix
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  verificationStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  verifiedAt: Date,
  rejectionReason: String
}, { timestamps: true });

export default mongoose.model('NCDScreening', ncdScreeningSchema);