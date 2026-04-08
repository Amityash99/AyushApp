import IECReport from '../models/IECReport.js';

export const getReports = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'aam_center') filter.centerId = req.user.centerId;
    if (req.user.role === 'district') filter.district = req.user.district;
    const reports = await IECReport.find(filter).populate('submittedBy', 'name');
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createReport = async (req, res) => {
  try {
    const report = new IECReport({ ...req.body, submittedBy: req.user._id, verificationStatus: 'pending' });
    const saved = await report.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateReport = async (req, res) => {
  try {
    const report = await IECReport.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });
    if (report.verificationStatus !== 'pending') return res.status(400).json({ message: 'Cannot edit after verification' });
    const updated = await IECReport.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteReport = async (req, res) => {
  try {
    const report = await IECReport.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });
    if (report.verificationStatus !== 'pending') return res.status(400).json({ message: 'Cannot delete after verification' });
    await report.deleteOne();
    res.json({ message: 'Report removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const verifyReport = async (req, res) => {
  try {
    const report = await IECReport.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });
    if (report.verificationStatus !== 'pending') return res.status(400).json({ message: 'Already verified' });
    report.verificationStatus = req.body.status;
    report.verifiedBy = req.user._id;
    report.verifiedAt = new Date();
    report.rejectionReason = req.body.rejectionReason;
    await report.save();
    res.json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};