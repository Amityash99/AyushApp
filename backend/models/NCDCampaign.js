import mongoose from 'mongoose';

const ncdCampaignSchema = new mongoose.Schema({
  name: String,
  description: String,
  startDate: Date,
  endDate: Date,
  targetAgeGroups: [String],
  targetGender: [String],
  targetLocations: [String],
  screeningGuidelines: String,
  reportingFrequency: String,
  assignedTo: [String], // districts or centers
  status: { type: String, enum: ['Active', 'Completed'], default: 'Active' }
}, { timestamps: true });

export default mongoose.model('NCDCampaign', ncdCampaignSchema);