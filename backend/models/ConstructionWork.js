import mongoose from 'mongoose';

const constructionWorkSchema = new mongoose.Schema({
  name: { type: String, required: true },
  district: { type: String, required: true },
  facility: { type: String },
  typeOfSite: { type: String, enum: ['Dispensary', 'Hospital', 'AAM', 'Block Hospital', 'DH', 'College'] },
  landOwnership: { type: String, enum: ['Departmental', 'Donated', 'Rented'] },
  areaOfLand: Number,
  builtArea: Number,
  typeOfConstruction: { type: String, enum: ['New Building', 'Repairing', 'Extension work'] },
  designPhoto: String,
  workingAgency: { type: String, enum: ['PWD', 'NHM', 'RSAMB', 'Other'] },
  contractorDetails: Object,
  gschedulePhoto: String,
  workCompletionTimeline: Date,
  budget: Number,
  expenditure: Number,
  status: { type: String, enum: ['Planned', 'Ongoing', 'Completed'], default: 'Planned' },
  levelOfWork: { type: String, enum: ['Plinth', 'Lentil', 'Roof', 'Flooring', 'Complete'] },
  completionPercentage: { type: Number, min: 0, max: 100 },
  overallStatus: { type: String, enum: ['On Track', 'At Risk', 'Delayed'] },
  budgetPerformance: { planned: Number, actual: Number },
  challenges: String,
  decisionsNeeded: String,
  centerId: { type: String },               // ← Permanent fix: store user's center ID
  verificationStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  verifiedAt: Date,
  rejectionReason: String
}, { timestamps: true });

export default mongoose.model('ConstructionWork', constructionWorkSchema);