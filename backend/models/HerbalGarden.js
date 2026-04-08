import mongoose from 'mongoose';

const herbalGardenSchema = new mongoose.Schema({
  facilityName: { type: String, required: true },
  gardenType: { type: String, enum: ['Mini', 'Medium', 'Large'], required: true },
  location: { lat: Number, lng: Number },
  area: Number,
  yearOfEstablishment: Number,
  layoutPhoto: String,
  registrationPhoto: String,
  inchargeName: String,
  inchargeContact: String,
  centerId: { type: String },      // for AAM center users
  district: { type: String },      // for district users
  species: [{
    botanicalName: String,
    commonName: String,
    count: Number,
    plantationDate: Date,
    source: String,
    maturityPeriod: String,
    seasonalRequirements: String
  }],
  verificationStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  verifiedAt: Date,
  rejectionReason: String
}, { timestamps: true });

export default mongoose.model('HerbalGarden', herbalGardenSchema);