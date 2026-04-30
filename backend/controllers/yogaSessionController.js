import YogaSession from '../models/YogaSession.js';
import YogaInstructor from '../models/YogaInstructor.js';

export const getSessions = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'aam_center') {
      filter.centerId = req.user.centerId;
    } else if (req.user.role === 'district') {
      filter.district = req.user.district;
      console.log('District user filter:', filter); // ✅ debug
    } else if (req.user.role === 'yoga_instructor') {
      const instructor = await YogaInstructor.findById(req.user.instructorId);
      if (instructor) filter.instructorId = instructor._id;
    }
    const sessions = await YogaSession.find(filter).populate('instructorId', 'name');
    console.log('Sessions found:', sessions.length); // ✅ debug
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// Create session (supports file uploads)
export const createSession = async (req, res) => {
  try {
    let sessionData = req.body.data ? JSON.parse(req.body.data) : req.body;
    // Handle uploaded photos
    if (req.files && req.files.length) {
      const photoUrls = req.files.map(file => `/uploads/${file.filename}`);
      sessionData.photos = photoUrls;
    }
    // Set role‑based fields
    if (req.user.role === 'aam_center') {
      sessionData.centerId = req.user.centerId;
      // ✅ Assign district from user (required for district-level verification)
      if (req.user.district) sessionData.district = req.user.district;
    } else if (req.user.role === 'district') {
      sessionData.district = req.user.district;
    } else if (req.user.role === 'yoga_instructor') {
      const instructor = await YogaInstructor.findById(req.user.instructorId);
      if (instructor) {
        sessionData.instructorId = instructor._id;
        sessionData.centerId = instructor.centerId;
        // ✅ Assign district from user
        if (req.user.district) sessionData.district = req.user.district;
      }
    }
    const session = new YogaSession({ ...sessionData, verificationStatus: 'pending' });
    const saved = await session.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
};

// Update session
export const updateSession = async (req, res) => {
  try {
    const session = await YogaSession.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });
    if (session.verificationStatus !== 'pending') {
      return res.status(400).json({ message: 'Cannot edit after verification' });
    }
    let sessionData = req.body.data ? JSON.parse(req.body.data) : req.body;
    if (req.files && req.files.length) {
      const newPhotos = req.files.map(file => `/uploads/${file.filename}`);
      sessionData.photos = [...(session.photos || []), ...newPhotos];
    }
    const updated = await YogaSession.findByIdAndUpdate(req.params.id, sessionData, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete session (only if pending)
export const deleteSession = async (req, res) => {
  try {
    const session = await YogaSession.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });
    if (session.verificationStatus !== 'pending') {
      return res.status(400).json({ message: 'Cannot delete after verification' });
    }
    await session.deleteOne();
    res.json({ message: 'Session removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Verify session (district only)
export const verifySession = async (req, res) => {
  try {
    const session = await YogaSession.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });

    // Ensure the session belongs to the district user's district
    if (req.user.role === 'district' && session.district !== req.user.district) {
      return res.status(403).json({ message: 'You can only verify sessions from your district' });
    }

    if (session.verificationStatus !== 'pending') {
      return res.status(400).json({ message: 'Session already verified' });
    }

    session.verificationStatus = req.body.status; // 'approved' or 'rejected'
    session.verifiedBy = req.user._id;
    session.verifiedAt = new Date();
    session.rejectionReason = req.body.rejectionReason || '';
    await session.save();

    res.json(session);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Get statistics (used by dashboard)
export const getStats = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'aam_center') {
      filter.centerId = req.user.centerId;
    } else if (req.user.role === 'district') {
      filter.district = req.user.district;
    } else if (req.user.role === 'yoga_instructor') {
      const instructor = await YogaInstructor.findById(req.user.instructorId);
      if (instructor) filter.instructorId = instructor._id;
    }
    const totalSessions = await YogaSession.countDocuments(filter);
    const participantsAgg = await YogaSession.aggregate([
      { $match: filter },
      { $group: { _id: null, total: { $sum: { $add: ['$participants.male', '$participants.female', '$participants.children', '$participants.other'] } } } }
    ]);
    const totalParticipants = participantsAgg[0]?.total || 0;
    res.json({ totalSessions, totalParticipants });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};