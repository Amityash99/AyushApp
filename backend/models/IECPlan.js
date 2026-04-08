import mongoose from 'mongoose';

const iecPlanSchema = new mongoose.Schema({
  title: String,
  campaignName: String,
  themes: [String],
  brandingGuidelines: String,
  templates: [String],
  startDate: Date,
  endDate: Date,
  frequency: { type: String, enum: ['Daily', 'Weekly', 'Monthly', 'Event-based'] },
  assignedTo: { type: String, enum: ['All AAM Centers', 'Selected Districts', 'Specific Centers'] },
  assignedDistricts: [String],
  assignedCenters: [String],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['Active', 'Completed', 'Cancelled'], default: 'Active' }
}, { timestamps: true });

export default mongoose.model('IECPlan', iecPlanSchema);