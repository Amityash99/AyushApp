import Attendance from '../models/Attendance.js';
export const getAttendances = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'aam_center') filter.centerId = req.user.centerId;
    if (req.user.role === 'district') filter.district = req.user.district;
    const attendances = await Attendance.find(filter).populate('staffId', 'name').populate('reportedBy', 'name');
    res.json(attendances);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createAttendance = async (req, res) => {
  try {
    const attendanceData = req.body;
    
    // Permanent fix: store centerId for AAM users
    if (req.user.role === 'aam_center') {
      attendanceData.centerId = req.user.centerId;
    }
    
    const attendance = new Attendance({ ...attendanceData, reportedBy: req.user._id });
    const saved = await attendance.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id);
    if (!attendance) return res.status(404).json({ message: 'Attendance not found' });
    const updated = await Attendance.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteAttendance = async (req, res) => {
  try {
    await Attendance.findByIdAndDelete(req.params.id);
    res.json({ message: 'Attendance removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getStats = async (req, res) => {
  try {
    const totalStaff = await StaffHR.countDocuments();
    const presentToday = await Attendance.countDocuments({ date: new Date().toISOString().slice(0,10), present: true });
    const attendancePercentage = totalStaff ? (presentToday / totalStaff) * 100 : 0;
    res.json({ totalStaff, presentToday, attendancePercentage });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};