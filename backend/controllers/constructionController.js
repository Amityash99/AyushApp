import ConstructionWork from '../models/ConstructionWork.js';

// Get works with role‑based filtering
export const getWorks = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'aam_center') filter.centerId = req.user.centerId;
    else if (req.user.role === 'district' || req.user.role === 'pwd') {
      if (req.user.district) filter.district = req.user.district;
    }
    const works = await ConstructionWork.find(filter).populate('verifiedBy', 'name');
    res.json(works);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createWork = async (req, res) => {
  try {
    let workData = req.body.data ? JSON.parse(req.body.data) : req.body;
    if (req.files) {
      if (req.files.designPhoto) workData.designPhoto = `/uploads/${req.files.designPhoto[0].filename}`;
      if (req.files.gschedulePhoto) workData.gschedulePhoto = `/uploads/${req.files.gschedulePhoto[0].filename}`;
      if (req.files.invoiceCopy) workData.invoiceCopy = `/uploads/${req.files.invoiceCopy[0].filename}`;
    }
    if (req.user.role === 'aam_center') {
      workData.centerId = req.user.centerId;
      if (req.user.district) workData.district = req.user.district;   // ✅ key line
    } else if (req.user.role === 'pwd') {
      if (req.user.district) workData.district = req.user.district;
    }
    const work = new ConstructionWork({ ...workData, verificationStatus: 'pending' });
    const saved = await work.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
};

// Update work (supports file uploads; keep existing files if not replaced)
export const updateWork = async (req, res) => {
  try {
    const work = await ConstructionWork.findById(req.params.id);
    if (!work) return res.status(404).json({ message: 'Work not found' });
    if (work.verificationStatus !== 'pending') {
      return res.status(400).json({ message: 'Cannot edit after verification' });
    }

    let workData = req.body.data ? JSON.parse(req.body.data) : req.body;
    if (req.files) {
      if (req.files.designPhoto) workData.designPhoto = `/uploads/${req.files.designPhoto[0].filename}`;
      if (req.files.gschedulePhoto) workData.gschedulePhoto = `/uploads/${req.files.gschedulePhoto[0].filename}`;
      if (req.files.invoiceCopy) workData.invoiceCopy = `/uploads/${req.files.invoiceCopy[0].filename}`;
    }

    const updated = await ConstructionWork.findByIdAndUpdate(req.params.id, workData, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete work
export const deleteWork = async (req, res) => {
  try {
    const work = await ConstructionWork.findById(req.params.id);
    if (!work) return res.status(404).json({ message: 'Work not found' });
    if (work.verificationStatus !== 'pending') {
      return res.status(400).json({ message: 'Cannot delete after verification' });
    }
    await work.deleteOne();
    res.json({ message: 'Work removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Verify work (approve/reject)
export const verifyWork = async (req, res) => {
  try {
    const work = await ConstructionWork.findById(req.params.id);
    if (!work) return res.status(404).json({ message: 'Work not found' });
    if (work.verificationStatus !== 'pending') {
      return res.status(400).json({ message: 'Already verified' });
    }
    if ((req.user.role === 'district' || req.user.role === 'pwd') && req.user.district) {
      if (work.district && work.district !== req.user.district) {
        return res.status(403).json({ message: 'You can only verify works from your district' });
      }
    }
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