import ProgrammeActivity from '../models/ProgrammeActivity.js';

export const getActivities = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'aam_center') filter.centerId = req.user.centerId;
    if (req.user.role === 'district') filter.district = req.user.district;
    const activities = await ProgrammeActivity.find(filter).populate('verifiedBy', 'name');
    res.json(activities);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createActivity = async (req, res) => {
  try {
    const activityData = req.body;
    
    // Permanent fix: store centerId for AAM users
    if (req.user.role === 'aam_center') {
      activityData.centerId = req.user.centerId;
    }
    
    const activity = new ProgrammeActivity({ ...activityData, verificationStatus: 'pending' });
    const saved = await activity.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateActivity = async (req, res) => {
  try {
    const activity = await ProgrammeActivity.findById(req.params.id);
    if (!activity) return res.status(404).json({ message: 'Activity not found' });
    if (activity.verificationStatus !== 'pending') return res.status(400).json({ message: 'Cannot edit after verification' });
    const updated = await ProgrammeActivity.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteActivity = async (req, res) => {
  try {
    const activity = await ProgrammeActivity.findById(req.params.id);
    if (!activity) return res.status(404).json({ message: 'Activity not found' });
    if (activity.verificationStatus !== 'pending') return res.status(400).json({ message: 'Cannot delete after verification' });
    await activity.deleteOne();
    res.json({ message: 'Activity removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const verifyActivity = async (req, res) => {
  try {
    const activity = await ProgrammeActivity.findById(req.params.id);
    if (!activity) return res.status(404).json({ message: 'Activity not found' });
    if (activity.verificationStatus !== 'pending') return res.status(400).json({ message: 'Already verified' });
    activity.verificationStatus = req.body.status;
    activity.verifiedBy = req.user._id;
    activity.verifiedAt = new Date();
    activity.rejectionReason = req.body.rejectionReason;
    await activity.save();
    res.json(activity);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getStats = async (req, res) => {
  try {
    const total = await ProgrammeActivity.countDocuments();
    const beneficiaries = await ProgrammeActivity.aggregate([
      { $group: { _id: null, total: { $sum: '$totalParticipants' } } }
    ]);
    res.json({ total, totalBeneficiaries: beneficiaries[0]?.total || 0 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};