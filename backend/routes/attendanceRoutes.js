import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getAttendances, createAttendance, updateAttendance, deleteAttendance, getStats
} from '../controllers/attendanceController.js';

const router = express.Router();

router.route('/')
  .get(protect, getAttendances)
  .post(protect, createAttendance);

router.route('/:id')
  .put(protect, updateAttendance)
  .delete(protect, deleteAttendance);

router.get('/stats', protect, getStats);

export default router;