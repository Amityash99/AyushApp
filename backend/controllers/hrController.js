import StaffHR from '../models/StaffHR.js';
export const getStaff = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'aam_center') filter.centerId = req.user.centerId;
    if (req.user.role === 'district') filter.district = req.user.district;
    const staff = await StaffHR.find(filter).populate('verifiedBy', 'name');
    res.json(staff);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createStaff = async (req, res) => {
  try {
    const staffData = req.body;
    
    // Permanent fix: store centerId for AAM users
    if (req.user.role === 'aam_center') {
      staffData.centerId = req.user.centerId;
    }
    
    const staff = new StaffHR({ ...staffData, verificationStatus: 'pending' });
    const saved = await staff.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateStaff = async (req, res) => {
  try {
    const staff = await StaffHR.findById(req.params.id);
    if (!staff) return res.status(404).json({ message: 'Staff not found' });
    if (staff.verificationStatus !== 'pending') return res.status(400).json({ message: 'Cannot edit after verification' });
    const updated = await StaffHR.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteStaff = async (req, res) => {
  try {
    const staff = await StaffHR.findById(req.params.id);
    if (!staff) return res.status(404).json({ message: 'Staff not found' });
    if (staff.verificationStatus !== 'pending') return res.status(400).json({ message: 'Cannot delete after verification' });
    await staff.deleteOne();
    res.json({ message: 'Staff removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const verifyStaff = async (req, res) => {
  try {
    const staff = await StaffHR.findById(req.params.id);
    if (!staff) return res.status(404).json({ message: 'Staff not found' });
    if (staff.verificationStatus !== 'pending') return res.status(400).json({ message: 'Already verified' });
    staff.verificationStatus = req.body.status;
    staff.verifiedBy = req.user._id;
    staff.verifiedAt = new Date();
    staff.rejectionReason = req.body.rejectionReason;
    await staff.save();
    res.json(staff);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getStats = async (req, res) => {
  try {
    const sanctioned = 100; // example – you can store in config or compute from some master table
    const filled = await StaffHR.countDocuments({ status: 'Active', verificationStatus: 'approved' });
    const vacant = sanctioned - filled;
    const byCategory = await StaffHR.aggregate([
      { $group: { _id: '$cadre', count: { $sum: 1 } } }
    ]);
    res.json({ sanctioned, filled, vacant, byCategory });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};