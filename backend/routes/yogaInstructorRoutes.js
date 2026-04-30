import express from 'express';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import {
  getInstructors,
  getMyProfile,          // ensure this is imported
  createInstructor,
  updateInstructor,
  deleteInstructor,
  verifyInstructor,
  transferInstructor,
  getAttendance,
  markAttendance,
  getPerformance,
  getStats
} from '../controllers/yogaInstructorController.js';

const router = express.Router();

// ✅ /me must come before /:id
router.get('/me', protect, restrictTo('yoga_instructor'), getMyProfile);

router.route('/')
  .get(protect, getInstructors)
  .post(protect, restrictTo('aam_center', 'district'), createInstructor);

router.get('/stats', protect, getStats);
router.get('/:id/attendance', protect, getAttendance);
router.post('/attendance', protect, restrictTo('yoga_instructor'), markAttendance);
router.get('/:id/performance', protect, getPerformance);
router.put('/:id/transfer', protect, restrictTo('aam_center', 'district'), transferInstructor);
router.put('/:id/verify', protect, restrictTo('district'), verifyInstructor);
router.route('/:id')
  .put(protect, restrictTo('aam_center', 'district'), updateInstructor)
  .delete(protect, restrictTo('aam_center', 'district'), deleteInstructor);

export default router;