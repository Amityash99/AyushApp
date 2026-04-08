import YogaInstructor from '../models/YogaInstructor.js';
import YogaInstructorAttendance from '../models/YogaInstructorAttendance.js';
import YogaSession from '../models/YogaSession.js';

// ... existing CRUD methods ...
export const getInstructors = async (req, res) => {
  try {
    const instructors = await YogaInstructor.find();
    res.json(instructors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createInstructor = async (req, res) => {
  try {
    const instructor = new YogaInstructor(req.body);
    const saved = await instructor.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateInstructor = async (req, res) => {
  try {
    const updated = await YogaInstructor.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteInstructor = async (req, res) => {
  try {
    await YogaInstructor.findByIdAndDelete(req.params.id);
    res.json({ message: 'Instructor deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const verifyInstructor = async (req, res) => {
  try {
    const instructor = await YogaInstructor.findById(req.params.id);
    instructor.verified = true;
    await instructor.save();
    res.json(instructor);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getStats = async (req, res) => {
  try {
    const total = await YogaInstructor.countDocuments();
    res.json({ total });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// Transfer instructor between centers
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

// Get instructor attendance
export const getAttendance = async (req, res) => {
  try {
    const attendance = await YogaInstructorAttendance.find({ instructorId: req.params.id }).populate('reportedBy', 'name');
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Mark instructor attendance
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

// Performance indicators
export const getPerformance = async (req, res) => {
  try {
    const instructorId = req.params.id;
    // Total sessions conducted
    const sessions = await YogaSession.countDocuments({ instructorId, verificationStatus: 'approved' });
    // Total participants across sessions
    const participantsAgg = await YogaSession.aggregate([
      { $match: { instructorId, verificationStatus: 'approved' } },
      { $group: {
        _id: null,
        total: { $sum: { $add: ['$participants.male', '$participants.female', '$participants.children', '$participants.other'] } }
      } }
    ]);
    const totalParticipants = participantsAgg[0]?.total || 0;
    // Average attendance per session
    const avgAttendance = sessions ? totalParticipants / sessions : 0;
    // Attendance days
    const attendanceDays = await YogaInstructorAttendance.countDocuments({ instructorId, present: true });
    // Check for alerts
    const alerts = [];
    if (sessions === 0) alerts.push('No sessions conducted');
    if (attendanceDays < 5 && new Date().getDate() > 10) alerts.push('Low attendance this month');
    res.json({ sessions, totalParticipants, avgAttendance, attendanceDays, alerts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};