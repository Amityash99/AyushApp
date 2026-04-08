import IECPlan from '../models/IECPlan.js';

export const getPlans = async (req, res) => {
  try {
    const plans = await IECPlan.find().populate('createdBy', 'name');
    res.json(plans);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createPlan = async (req, res) => {
  try {
    const plan = new IECPlan({ ...req.body, createdBy: req.user._id });
    const saved = await plan.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updatePlan = async (req, res) => {
  try {
    const updated = await IECPlan.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deletePlan = async (req, res) => {
  try {
    await IECPlan.findByIdAndDelete(req.params.id);
    res.json({ message: 'Plan deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};