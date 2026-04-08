import ConstructionWork from '../models/ConstructionWork.js';
export const getWorks = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'aam_center') filter.centerId = req.user.centerId;
    if (req.user.role === 'district') filter.district = req.user.district;
    const works = await ConstructionWork.find(filter).populate('verifiedBy', 'name');
    res.json(works);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createWork = async (req, res) => {
  try {
    const workData = req.body;
    
    // Permanent fix: store centerId for AAM users
    if (req.user.role === 'aam_center') {
      workData.centerId = req.user.centerId;
    }
    
    const work = new ConstructionWork({ ...workData, verificationStatus: 'pending' });
    const saved = await work.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update work (only if pending)
export const updateWork = async (req, res) => {
  try {
    const work = await ConstructionWork.findById(req.params.id);
    if (!work) return res.status(404).json({ message: 'Work not found' });
    if (work.verificationStatus !== 'pending') return res.status(400).json({ message: 'Cannot edit after verification' });
    const updated = await ConstructionWork.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete work (only if pending)
export const deleteWork = async (req, res) => {
  try {
    const work = await ConstructionWork.findById(req.params.id);
    if (!work) return res.status(404).json({ message: 'Work not found' });
    if (work.verificationStatus !== 'pending') return res.status(400).json({ message: 'Cannot delete after verification' });
    await work.deleteOne();
    res.json({ message: 'Work removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Verify work (district only)
export const verifyWork = async (req, res) => {
  try {
    const work = await ConstructionWork.findById(req.params.id);
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

// Dashboard stats
export const getStats = async (req, res) => {
  try {
    const planned = await ConstructionWork.countDocuments({ status: 'Planned' });
    const ongoing = await ConstructionWork.countDocuments({ status: 'Ongoing' });
    const completed = await ConstructionWork.countDocuments({ status: 'Completed' });
    const totalWorks = planned + ongoing + completed;
    res.json({ planned, ongoing, completed, totalWorks });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};