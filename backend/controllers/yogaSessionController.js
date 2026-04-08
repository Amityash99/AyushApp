import YogaSession from '../models/YogaSession.js';
import path from 'path';

// ... existing CRUD ...

// Create session with photo upload

export const createSessionWithPhotos = async (req, res) => {
  try {
    let sessionData = req.body.data ? JSON.parse(req.body.data) : req.body;
    
    // Handle uploaded files
    if (req.files) {
      const photoUrls = req.files.map(file => `/uploads/${file.filename}`);
      sessionData.photos = photoUrls;
    }
    
    // Permanent fix: store centerId for AAM users
    if (req.user.role === 'aam_center') {
      sessionData.centerId = req.user.centerId;
    }
    
    const session = new YogaSession({ ...sessionData, verificationStatus: 'pending' });
    const saved = await session.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
};

// Update session (can also handle new photos)
export const updateSessionWithPhotos = async (req, res) => {
  try {
    const session = await YogaSession.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });
    const sessionData = JSON.parse(req.body.data);
    const newPhotoUrls = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];
    const allPhotos = [...session.photos, ...newPhotoUrls];
    const updated = await YogaSession.findByIdAndUpdate(
      req.params.id,
      { ...sessionData, photos: allPhotos },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getSessions = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'aam_center') filter.centerId = req.user.centerId;
    if (req.user.role === 'district') filter.district = req.user.district;
    const sessions = await YogaSession.find(filter).populate('instructorId', 'name');
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const createSession = async (req, res) => {
  try {
    const session = new YogaSession({ ...req.body, verificationStatus: 'pending' });
    const saved = await session.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateSession = async (req, res) => {
  try {
    const session = await YogaSession.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });
    if (session.verificationStatus !== 'pending') return res.status(400).json({ message: 'Cannot edit after verification' });
    const updated = await YogaSession.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteSession = async (req, res) => {
  try {
    const session = await YogaSession.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });
    if (session.verificationStatus !== 'pending') return res.status(400).json({ message: 'Cannot delete after verification' });
    await session.deleteOne();
    res.json({ message: 'Session removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const verifySession = async (req, res) => {
  try {
    const session = await YogaSession.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });
    if (session.verificationStatus !== 'pending') return res.status(400).json({ message: 'Already verified' });
    session.verificationStatus = req.body.status;
    session.verifiedBy = req.user._id;
    session.verifiedAt = new Date();
    session.rejectionReason = req.body.rejectionReason;
    await session.save();
    res.json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getStats = async (req, res) => {
  try {
    const totalSessions = await YogaSession.countDocuments();
    const totalParticipants = await YogaSession.aggregate([
      { $group: { _id: null, total: { $sum: { $add: ['$participants.male', '$participants.female', '$participants.children', '$participants.other'] } } } }
    ]);
    res.json({ totalSessions, totalParticipants: totalParticipants[0]?.total || 0 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

