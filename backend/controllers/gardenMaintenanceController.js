import HerbalGardenMaintenance from '../models/HerbalGardenMaintenance.js';

export const getMaintenances = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'aam_center') filter.centerId = req.user.centerId;
    if (req.user.role === 'district') filter.district = req.user.district;
    const maintenances = await HerbalGardenMaintenance.find(filter)
      .populate('gardenId', 'facilityName')
      .populate('reportedBy', 'name');
    res.json(maintenances);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// export const getMaintenances = async (req, res) => {
//   try {
//     let filter = {};
//     if (req.user.role === 'aam_center') filter.centerId = req.user.centerId;
//     if (req.user.role === 'district') filter.district = req.user.district;
//     const maintenances = await HerbalGardenMaintenance.find(filter)
//       .populate('gardenId', 'facilityName')
//       .populate('reportedBy', 'name');
//     res.json(maintenances);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// export const createMaintenance = async (req, res) => {
//   try {
//     let maintenanceData = req.body.data ? JSON.parse(req.body.data) : req.body;
//     if (req.files) {
//       maintenanceData.photos = req.files.map(file => `/uploads/${file.filename}`);
//     }
//     const maintenance = new HerbalGardenMaintenance({ ...maintenanceData, reportedBy: req.user._id });
//     const saved = await maintenance.save();
//     res.status(201).json(saved);
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// };

export const createMaintenance = async (req, res) => {
  try {
    let maintenanceData = req.body.data ? JSON.parse(req.body.data) : req.body;
    if (req.files) {
      maintenanceData.photos = req.files.map(file => `/uploads/${file.filename}`);
    }
    
    // Permanent fix: store centerId for AAM users
    if (req.user.role === 'aam_center') {
      maintenanceData.centerId = req.user.centerId;
    }
    
    const maintenance = new HerbalGardenMaintenance({ ...maintenanceData, reportedBy: req.user._id });
    const saved = await maintenance.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateMaintenance = async (req, res) => {
  try {
    const updated = await HerbalGardenMaintenance.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteMaintenance = async (req, res) => {
  try {
    await HerbalGardenMaintenance.findByIdAndDelete(req.params.id);
    res.json({ message: 'Maintenance record removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};