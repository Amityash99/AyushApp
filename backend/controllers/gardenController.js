import HerbalGarden from '../models/HerbalGarden.js';

// Get gardens with role‑based filtering
export const getGardens = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'aam_center') filter.centerId = req.user.centerId;
    if (req.user.role === 'district') filter.district = req.user.district;
    // directorate/state see all
    const gardens = await HerbalGarden.find(filter).populate('verifiedBy', 'name');
    res.json(gardens);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create garden (AAM center or district)
export const createGarden = async (req, res) => {
  try {
    let gardenData = req.body.data ? JSON.parse(req.body.data) : req.body;
    
    // Handle file uploads
    if (req.files) {
      if (req.files.layoutPhoto) gardenData.layoutPhoto = `/uploads/${req.files.layoutPhoto[0].filename}`;
      if (req.files.registrationPhoto) gardenData.registrationPhoto = `/uploads/${req.files.registrationPhoto[0].filename}`;
    }
    
    // Assign centerId or district based on role
    if (req.user.role === 'aam_center') {
      gardenData.centerId = req.user.centerId;
    }
    if (req.user.role === 'district') {
      gardenData.district = req.user.district;
    }
    
    const garden = new HerbalGarden({ ...gardenData, verificationStatus: 'pending' });
    const saved = await garden.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error('Create garden error:', err);
    res.status(400).json({ message: err.message });
  }
};

// Update garden (only if pending)
export const updateGarden = async (req, res) => {
  try {
    const garden = await HerbalGarden.findById(req.params.id);
    if (!garden) return res.status(404).json({ message: 'Garden not found' });
    if (garden.verificationStatus !== 'pending') {
      return res.status(400).json({ message: 'Cannot edit after verification' });
    }
    const updated = await HerbalGarden.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete garden (only if pending)
export const deleteGarden = async (req, res) => {
  try {
    const garden = await HerbalGarden.findById(req.params.id);
    if (!garden) return res.status(404).json({ message: 'Garden not found' });
    if (garden.verificationStatus !== 'pending') {
      return res.status(400).json({ message: 'Cannot delete after verification' });
    }
    await garden.deleteOne();
    res.json({ message: 'Garden removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Verify garden (district only)
export const verifyGarden = async (req, res) => {
  try {
    const garden = await HerbalGarden.findById(req.params.id);
    if (!garden) return res.status(404).json({ message: 'Garden not found' });
    if (garden.verificationStatus !== 'pending') {
      return res.status(400).json({ message: 'Already verified' });
    }
    garden.verificationStatus = req.body.status;
    garden.verifiedBy = req.user._id;
    garden.verifiedAt = new Date();
    garden.rejectionReason = req.body.rejectionReason;
    await garden.save();
    res.json(garden);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Dashboard stats
export const getStats = async (req, res) => {
  try {
    const total = await HerbalGarden.countDocuments();
    const active = await HerbalGarden.countDocuments({ verificationStatus: 'approved' });
    const inactive = total - active;
    const plantCount = await HerbalGarden.aggregate([
      { $unwind: '$species' },
      { $group: { _id: null, total: { $sum: '$species.count' } } }
    ]);
    res.json({ total, active, inactive, totalPlantSpecies: plantCount[0]?.total || 0 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};