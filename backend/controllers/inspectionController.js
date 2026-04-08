import Inspection from '../models/Inspection.js';

export const getInspections = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'aam_center') filter.centerId = req.user.centerId;
    if (req.user.role === 'district') filter.district = req.user.district;
    const inspections = await Inspection.find(filter).populate('verifiedBy', 'name');
    res.json(inspections);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createInspection = async (req, res) => {
  try {
    const inspectionData = req.body;
    if (req.user.role === 'district') {
      inspectionData.district = req.user.district;
    }
    if (req.user.role === 'aam_center') {
      inspectionData.centerId = req.user.centerId;
    }
    const inspection = new Inspection({ ...inspectionData, verificationStatus: 'pending' });
    const saved = await inspection.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
export const updateInspection = async (req, res) => {
  try {
    const inspection = await Inspection.findById(req.params.id);
    if (!inspection) return res.status(404).json({ message: 'Inspection not found' });
    if (inspection.verificationStatus !== 'pending') {
      return res.status(400).json({ message: 'Cannot edit after verification' });
    }
    const updated = await Inspection.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteInspection = async (req, res) => {
  try {
    const inspection = await Inspection.findById(req.params.id);
    if (!inspection) return res.status(404).json({ message: 'Inspection not found' });
    if (inspection.verificationStatus !== 'pending') {
      return res.status(400).json({ message: 'Cannot delete after verification' });
    }
    await inspection.deleteOne();
    res.json({ message: 'Inspection removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const verifyInspection = async (req, res) => {
  try {
    const inspection = await Inspection.findById(req.params.id);
    if (!inspection) return res.status(404).json({ message: 'Inspection not found' });
    if (inspection.verificationStatus !== 'pending') {
      return res.status(400).json({ message: 'Already verified' });
    }
    inspection.verificationStatus = req.body.status;
    inspection.verifiedBy = req.user._id;
    inspection.verifiedAt = new Date();
    inspection.rejectionReason = req.body.rejectionReason;
    await inspection.save();
    res.json(inspection);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getStats = async (req, res) => {
  try {
    const total = await Inspection.countDocuments();
    const pending = await Inspection.countDocuments({ verificationStatus: 'pending' });
    const approved = await Inspection.countDocuments({ verificationStatus: 'approved' });
    res.json({ total, pending, approved });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};