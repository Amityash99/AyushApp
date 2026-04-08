import mongoose from 'mongoose';

const inspectionSchema = new mongoose.Schema({
  centerId: { type: String },               // ← Permanent fix (for AAM center if they self‑inspect)
  district: String,
  block: String,
  visitedBy: { type: String, required: true },
  ssoId: String,
  accompanyingOfficials: String,
  inspectionDate: { type: Date, required: true },
  infrastructure: {
    buildingCondition: { type: String, enum: ['Good', 'Average', 'Poor'] },
    waitingArea: { type: String, enum: ['Good', 'Average', 'Poor'] },
    opdIpdRooms: { type: String, enum: ['Good', 'Average', 'Poor'] },
    labFacility: { type: String, enum: ['Good', 'Average', 'Poor'] },
    medicineStore: { type: String, enum: ['Good', 'Average', 'Poor'] },
    toiletDrinkingWater: { type: String, enum: ['Good', 'Average', 'Poor'] },
    herbalGarden: { type: String, enum: ['Good', 'Average', 'Poor'] },
    remarks: String
  },
  humanResources: {
    sanctionedPosts: Number,
    filledPosts: Number,
    vacantPosts: Number,
    attendanceOnDay: Number,
    remarks: String
  },
  serviceDelivery: {
    opdServices: { type: Boolean },
    ipdServices: { type: Boolean },
    yogaWellness: { type: Boolean },
    ncdServices: { type: Boolean },
    referralCases: { type: Boolean },
    remarks: String
  },
  medicineLab: {
    stockRegisterMaintained: Boolean,
    expiredMedicinesFound: Boolean,
    labEquipmentFunctional: Boolean,
    shortages: String
  },
  compliance: {
    dailyServiceReporting: { type: String, enum: ['Maintained', 'Not Maintained'] },
    attendanceRegister: { type: String, enum: ['Verified', 'Not Verified'] },
    citizenInformationDisplay: { type: String, enum: ['Available', 'Not Available'] },
    onlinePortalWork: { type: String, enum: ['Available', 'Not Available'] }
  },
  grievances: {
    citizenNotes: String,
    issuesRaised: String,
    immediateAction: String
  },
  overallAssessment: {
    generalObservation: String,
    keyIssues: String,
    suggestions: String,
    followUpRequired: Boolean
  },
  inspector: {
    name: String,
    designation: String,
    digitalSignature: String,
    submissionDate: Date
  },
  verificationStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  verifiedAt: Date,
  rejectionReason: String
}, { timestamps: true });

export default mongoose.model('Inspection', inspectionSchema);