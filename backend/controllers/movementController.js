import Movement from '../models/Movement.js';
export const getMovements = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'aam_center') filter.centerId = req.user.centerId;
    if (req.user.role === 'district') filter.district = req.user.district;
    const movements = await Movement.find(filter).populate('staffId', 'name').populate('reportedBy', 'name');
    res.json(movements);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createMovement = async (req, res) => {
  try {
    const movementData = req.body;
    
    // Permanent fix: store centerId for AAM users
    if (req.user.role === 'aam_center') {
      movementData.centerId = req.user.centerId;
    }
    
    const movement = new Movement({ ...movementData, reportedBy: req.user._id });
    const saved = await movement.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateMovement = async (req, res) => {
  try {
    const movement = await Movement.findById(req.params.id);
    if (!movement) return res.status(404).json({ message: 'Movement not found' });
    const updated = await Movement.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteMovement = async (req, res) => {
  try {
    await Movement.findByIdAndDelete(req.params.id);
    res.json({ message: 'Movement removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};