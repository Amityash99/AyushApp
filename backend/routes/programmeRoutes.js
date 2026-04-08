import express from 'express';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import {
  getActivities, createActivity, updateActivity, deleteActivity, verifyActivity, getStats
} from '../controllers/programmeController.js';

const router = express.Router();

router.route('/')
  .get(protect, getActivities)
  .post(protect, restrictTo('aam_center'), createActivity);

router.route('/:id')
  .put(protect, restrictTo('aam_center'), updateActivity)
  .delete(protect, restrictTo('aam_center'), deleteActivity);

router.put('/:id/verify', protect, restrictTo('district'), verifyActivity);
router.get('/stats', protect, getStats);

export default router;