import mongoose from 'mongoose';

const herbalGardenMaintenanceSchema = new mongoose.Schema({
  gardenId: { type: mongoose.Schema.Types.ObjectId, ref: 'HerbalGarden', required: true },
  monthYear: { type: Date, required: true },
  wateringFrequency: String,
  manureUsed: String,
  pesticidesUsed: String,
  weedingDone: { type: Boolean, default: false },
  soilMaintenance: String,
  saplingsReplaced: Number,
  cleanlinessStatus: String,
  issues: String,
  photos: [String],
  geoLocation: { lat: Number, lng: Number },
  harvestingDone: { type: Boolean, default: false },
  harvestDate: Date,
  harvestSpecies: String,
  harvestQuantity: Number,
  utilization: String,
  centerId: { type: String },               // ← Permanent fix
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.model('HerbalGardenMaintenance', herbalGardenMaintenanceSchema);