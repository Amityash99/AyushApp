import BrandingWork from '../models/BrandingWork.js';

export const getWorks = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'aam_center') filter.centerId = req.user.centerId;
    if (req.user.role === 'district') filter.district = req.user.district;
    const works = await BrandingWork.find(filter).populate('reportedBy', 'name');
    res.json(works);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createWork = async (req, res) => {
  try {
    const work = new BrandingWork({ ...req.body, reportedBy: req.user._id, verificationStatus: 'pending' });
    const saved = await work.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateWork = async (req, res) => {
  try {
    const work = await BrandingWork.findById(req.params.id);
    if (!work) return res.status(404).json({ message: 'Work not found' });
    if (work.verificationStatus !== 'pending') return res.status(400).json({ message: 'Cannot edit after verification' });
    const updated = await BrandingWork.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteWork = async (req, res) => {
  try {
    const work = await BrandingWork.findById(req.params.id);
    if (!work) return res.status(404).json({ message: 'Work not found' });
    if (work.verificationStatus !== 'pending') return res.status(400).json({ message: 'Cannot delete after verification' });
    await work.deleteOne();
    res.json({ message: 'Work removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const verifyWork = async (req, res) => {
  try {
    const work = await BrandingWork.findById(req.params.id);
    if (!work) return res.status(404).json({ message: 'Work not found' });
    if (work.verificationStatus !== 'pending') return res.status(400).json({ message: 'Already verified' });
    work.verificationStatus = req.body.status;
    work.verifiedBy = req.user._id;
    work.verifiedAt = new Date();
    work.rejectionReason = req.body.rejectionReason;
    await work.save();
    res.json(work);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getStats = async (req, res) => {
  try {
    const completed = await BrandingWork.countDocuments({ status: 'Completed', verificationStatus: 'approved' });
    const pending = await BrandingWork.countDocuments({ status: 'Pending', verificationStatus: 'approved' });
    const avgCompliance = await BrandingWork.aggregate([
      { $match: { verificationStatus: 'approved' } },
      { $group: { _id: null, avg: { $avg: '$completionPercentage' } } }
    ]);
    res.json({ completed, pending, avgCompliance: avgCompliance[0]?.avg || 0 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};