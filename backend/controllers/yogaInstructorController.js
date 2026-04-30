
import YogaInstructor from '../models/YogaInstructor.js';
import YogaInstructorAttendance from '../models/YogaInstructorAttendance.js';
import YogaSession from '../models/YogaSession.js';
import User from '../models/User.js';

export const getInstructors = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'aam_center') filter.centerId = req.user.centerId;
    if (req.user.role === 'district') filter.district = req.user.district;
    if (req.user.role === 'yoga_instructor') filter._id = req.user.instructorId;
    const instructors = await YogaInstructor.find(filter).populate('verifiedBy', 'name');
    res.json(instructors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const getMyProfile = async (req, res) => {
  try {
    if (req.user.role !== 'yoga_instructor') {
      return res.status(403).json({ message: 'Access denied' });
    }
    let instructor = null;
    // First try by instructorId
    if (req.user.instructorId) {
      instructor = await YogaInstructor.findById(req.user.instructorId);
    }
    // Fallback: find by email
    if (!instructor && req.user.email) {
      instructor = await YogaInstructor.findOne({ email: req.user.email });
    }
    if (!instructor) {
      return res.status(404).json({ message: 'Instructor profile not found' });
    }
    res.json(instructor);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
// export const createInstructor = async (req, res) => {
//   try {
//     const instructorData = req.body;
//     if (req.user.role === 'aam_center') instructorData.centerId = req.user.centerId;
//     if (req.user.role === 'district') instructorData.district = req.user.district;
//     const instructor = new YogaInstructor({ ...instructorData, verificationStatus: 'pending' });
//     await instructor.save();
//     // Optionally create a user account for this instructor
//     res.status(201).json(instructor);
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// };


export const createInstructor = async (req, res) => {
  try {
    const instructorData = req.body;
    
    if (req.user.role === 'aam_center') {
      instructorData.centerId = req.user.centerId;
      // ✅ Also set the district from the user (if available)
      if (req.user.district) instructorData.district = req.user.district;
    }
    
    if (req.user.role === 'district') {
      if (req.user.district) instructorData.district = req.user.district;
    }
    
    const instructor = new YogaInstructor({ ...instructorData, verificationStatus: 'pending' });
    await instructor.save();
    
    // Optionally create a user account for this instructor
    res.status(201).json(instructor);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateInstructor = async (req, res) => {
  try {
    const instructor = await YogaInstructor.findById(req.params.id);
    if (!instructor) return res.status(404).json({ message: 'Instructor not found' });
    if (instructor.verificationStatus !== 'pending') {
      return res.status(400).json({ message: 'Cannot edit after verification' });
    }
    const updated = await YogaInstructor.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteInstructor = async (req, res) => {
  try {
    const instructor = await YogaInstructor.findById(req.params.id);
    if (!instructor) return res.status(404).json({ message: 'Instructor not found' });
    if (instructor.verificationStatus !== 'pending') {
      return res.status(400).json({ message: 'Cannot delete after verification' });
    }
    await instructor.deleteOne();
    res.json({ message: 'Instructor removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const verifyInstructor = async (req, res) => {
  try {
    const instructor = await YogaInstructor.findById(req.params.id);
    if (!instructor) return res.status(404).json({ message: 'Instructor not found' });
    if (instructor.verificationStatus !== 'pending') {
      return res.status(400).json({ message: 'Already verified' });
    }
    instructor.verificationStatus = req.body.status;
    instructor.verifiedBy = req.user._id;
    instructor.verifiedAt = new Date();
    instructor.rejectionReason = req.body.rejectionReason;
    await instructor.save();
    res.json(instructor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const transferInstructor = async (req, res) => {
  try {
    const instructor = await YogaInstructor.findById(req.params.id);
    if (!instructor) return res.status(404).json({ message: 'Instructor not found' });
    instructor.assignedCenter = req.body.newCenter;
    await instructor.save();
    res.json(instructor);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getAttendance = async (req, res) => {
  try {
    const attendance = await YogaInstructorAttendance.find({ instructorId: req.params.id }).populate('reportedBy', 'name');
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const markAttendance = async (req, res) => {
  try {
    const { instructorId, date, present, reasonForAbsence, sessionsConducted, overtime } = req.body;
    const attendance = new YogaInstructorAttendance({
      instructorId,
      date,
      present,
      reasonForAbsence,
      sessionsConducted,
      overtime,
      reportedBy: req.user._id
    });
    const saved = await attendance.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// export const getPerformance = async (req, res) => {
//   try {
//     const instructorId = req.params.id;
//     const sessions = await YogaSession.countDocuments({ instructorId, verificationStatus: 'approved' });
//     const participantsAgg = await YogaSession.aggregate([
//       { $match: { instructorId, verificationStatus: 'approved' } },
//       { $group: { _id: null, total: { $sum: { $add: ['$participants.male', '$participants.female', '$participants.children', '$participants.other'] } } } }
//     ]);
//     const totalParticipants = participantsAgg[0]?.total || 0;
//     const avgAttendance = sessions ? totalParticipants / sessions : 0;
//     const attendanceDays = await YogaInstructorAttendance.countDocuments({ instructorId, present: true });
//     const alerts = [];
//     if (sessions === 0) alerts.push('No sessions conducted');
//     if (attendanceDays < 5 && new Date().getDate() > 10) alerts.push('Low attendance this month');
//     res.json({ sessions, totalParticipants, avgAttendance, attendanceDays, alerts });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

export const getPerformance = async (req, res) => {
  try {
    const instructorId = req.params.id;
    const sessions = await YogaSession.countDocuments({ instructorId, verificationStatus: 'approved' });
    const participantsAgg = await YogaSession.aggregate([
      { $match: { instructorId, verificationStatus: 'approved' } },
      { $group: { _id: null, total: { $sum: { $add: ['$participants.male', '$participants.female', '$participants.children', '$participants.other'] } } } }
    ]);
    const totalParticipants = participantsAgg[0]?.total || 0;
    const avgAttendance = sessions ? totalParticipants / sessions : 0;
    const attendanceDays = await YogaInstructorAttendance.countDocuments({ instructorId, present: true });
    const alerts = [];
    if (sessions === 0) alerts.push('No sessions conducted');
    if (attendanceDays < 5 && new Date().getDate() > 10) alerts.push('Low attendance this month');
    res.json({ sessions, totalParticipants, avgAttendance, attendanceDays, alerts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getStats = async (req, res) => {
  try {
    const total = await YogaInstructor.countDocuments();
    const active = await YogaInstructor.countDocuments({ workingStatus: 'Full-time', verificationStatus: 'approved' });
    res.json({ total, active });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};