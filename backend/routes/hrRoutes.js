import express from 'express';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import {
  getStaff, createStaff, updateStaff, deleteStaff, verifyStaff, getStats
} from '../controllers/hrController.js';

const router = express.Router();

router.route('/')
  .get(protect, getStaff)
  .post(protect, restrictTo('aam_center'), createStaff);

router.route('/:id')
  .put(protect, restrictTo('aam_center'), updateStaff)
  .delete(protect, restrictTo('aam_center'), deleteStaff);

router.put('/:id/verify', protect, restrictTo('district'), verifyStaff);
router.get('/stats', protect, getStats);

export default router;