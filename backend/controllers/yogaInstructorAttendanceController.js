import YogaInstructorAttendance from '../models/YogaInstructorAttendance.js';

export const getAttendance = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'yoga_instructor') {
      filter.instructorId = req.user.instructorId;
    } else if (req.user.role === 'aam_center') {
      // get all instructors of this center first? for simplicity, allow all
    }
    const attendance = await YogaInstructorAttendance.find(filter).populate('reportedBy', 'name');
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const markAttendance = async (req, res) => {
  try {
    const { date, present, reasonForAbsence, sessionsConducted, overtime } = req.body;
    const instructorId = req.user.instructorId;
    if (!instructorId) return res.status(400).json({ message: 'No instructor profile linked' });
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

export const updateAttendance = async (req, res) => {
  try {
    const attendance = await YogaInstructorAttendance.findById(req.params.id);
    if (!attendance) return res.status(404).json({ message: 'Attendance not found' });
    // ensure the instructor owns this record
    if (attendance.instructorId.toString() !== req.user.instructorId?.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    const updated = await YogaInstructorAttendance.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteAttendance = async (req, res) => {
  try {
    await YogaInstructorAttendance.findByIdAndDelete(req.params.id);
    res.json({ message: 'Attendance record removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};