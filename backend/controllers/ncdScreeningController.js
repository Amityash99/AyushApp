import NCDScreening from '../models/NCDScreening.js';

export const getScreenings = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'aam_center') filter.centerId = req.user.centerId;
    if (req.user.role === 'district') filter.district = req.user.district;
    const screenings = await NCDScreening.find(filter).populate('reportedBy', 'name');
    res.json(screenings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createScreening = async (req, res) => {
  try {
    const screeningData = req.body;
    // Permanent fix: store centerId for AAM users
    if (req.user.role === 'aam_center') {
      screeningData.centerId = req.user.centerId;
    }
    const screening = new NCDScreening({ ...screeningData, reportedBy: req.user._id, verificationStatus: 'pending' });
    const saved = await screening.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateScreening = async (req, res) => {
  try {
    const screening = await NCDScreening.findById(req.params.id);
    if (!screening) return res.status(404).json({ message: 'Screening not found' });
    if (screening.verificationStatus !== 'pending') return res.status(400).json({ message: 'Cannot edit after verification' });
    const updated = await NCDScreening.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteScreening = async (req, res) => {
  try {
    const screening = await NCDScreening.findById(req.params.id);
    if (!screening) return res.status(404).json({ message: 'Screening not found' });
    if (screening.verificationStatus !== 'pending') return res.status(400).json({ message: 'Cannot delete after verification' });
    await screening.deleteOne();
    res.json({ message: 'Screening removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const verifyScreening = async (req, res) => {
  try {
    const screening = await NCDScreening.findById(req.params.id);
    if (!screening) return res.status(404).json({ message: 'Screening not found' });
    if (screening.verificationStatus !== 'pending') return res.status(400).json({ message: 'Already verified' });
    screening.verificationStatus = req.body.status;
    screening.verifiedBy = req.user._id;
    screening.verifiedAt = new Date();
    screening.rejectionReason = req.body.rejectionReason;
    await screening.save();
    res.json(screening);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getStats = async (req, res) => {
  try {
    const totalSurveys = await NCDScreening.countDocuments();
    const highRisk = await NCDScreening.countDocuments({ riskStratification: 'High', verificationStatus: 'approved' });
    const referrals = await NCDScreening.countDocuments({ 'referral.referred': true, verificationStatus: 'approved' });
    res.json({ totalSurveys, highRisk, referrals });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};