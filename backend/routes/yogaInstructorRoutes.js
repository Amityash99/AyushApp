import express from 'express';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import {
  getInstructors, createInstructor, updateInstructor, deleteInstructor, verifyInstructor, getStats,
  transferInstructor, getAttendance, markAttendance, getPerformance
} from '../controllers/yogaInstructorController.js';

const router = express.Router();

router.route('/')
  .get(protect, getInstructors)
  .post(protect, restrictTo('aam_center'), createInstructor);

router.route('/:id')
  .put(protect, restrictTo('aam_center'), updateInstructor)
  .delete(protect, restrictTo('aam_center'), deleteInstructor);

router.put('/:id/verify', protect, restrictTo('district'), verifyInstructor);
router.put('/:id/transfer', protect, restrictTo('aam_center'), transferInstructor);
router.get('/:id/attendance', protect, getAttendance);
router.post('/attendance', protect, markAttendance);
router.get('/:id/performance', protect, getPerformance);
router.get('/stats', protect, getStats);

export default router;