
import NAMReporting from '../models/NAMReporting.js';

export const getReports = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'aam_center') filter.centerId = req.user.centerId;
    if (req.user.role === 'district') filter.district = req.user.district;
    const reports = await NAMReporting.find(filter).populate('submittedBy', 'name');
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createReport = async (req, res) => {
  try {
    const reportData = req.body;
    // Permanent fix: store centerId for AAM users
    if (req.user.role === 'aam_center') {
      reportData.centerId = req.user.centerId;
    }
    const report = new NAMReporting({ ...reportData, submittedBy: req.user._id, submittedAt: new Date() });
    const saved = await report.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateReport = async (req, res) => {
  try {
    const report = await NAMReporting.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });
    if (report.status !== 'pending') return res.status(400).json({ message: 'Cannot edit after verification' });
    const updated = await NAMReporting.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteReport = async (req, res) => {
  try {
    const report = await NAMReporting.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });
    if (report.status !== 'pending') return res.status(400).json({ message: 'Cannot delete after verification' });
    await report.deleteOne();
    res.json({ message: 'Report removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getStats = async (req, res) => {
  try {
    const pending = await NAMReporting.countDocuments({ status: 'pending' });
    const approved = await NAMReporting.countDocuments({ status: 'approved' });
    const rejected = await NAMReporting.countDocuments({ status: 'rejected' });
    res.json({ pending, approved, rejected });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};