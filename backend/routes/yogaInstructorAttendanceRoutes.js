import express from 'express';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import {
  getAttendance, markAttendance, updateAttendance, deleteAttendance
} from '../controllers/yogaInstructorAttendanceController.js';

const router = express.Router();

router.route('/')
  .get(protect, restrictTo('yoga_instructor', 'aam_center'), getAttendance)
  .post(protect, restrictTo('yoga_instructor'), markAttendance);

router.route('/:id')
  .put(protect, restrictTo('yoga_instructor'), updateAttendance)
  .delete(protect, restrictTo('yoga_instructor'), deleteAttendance);

export default router;