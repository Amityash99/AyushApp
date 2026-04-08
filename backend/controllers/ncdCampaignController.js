import NCDCampaign from '../models/NCDCampaign.js';

export const getCampaigns = async (req, res) => {
  try {
    const campaigns = await NCDCampaign.find();
    res.json(campaigns);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createCampaign = async (req, res) => {
  try {
    const campaign = new NCDCampaign(req.body);
    const saved = await campaign.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateCampaign = async (req, res) => {
  try {
    const updated = await NCDCampaign.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteCampaign = async (req, res) => {
  try {
    await NCDCampaign.findByIdAndDelete(req.params.id);
    res.json({ message: 'Campaign removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};