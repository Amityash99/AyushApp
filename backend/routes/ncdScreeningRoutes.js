import express from 'express';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import {
  getScreenings, createScreening, updateScreening, deleteScreening, verifyScreening, getStats
} from '../controllers/ncdScreeningController.js';

const router = express.Router();

router.route('/')
  .get(protect, getScreenings)
  .post(protect, restrictTo('aam_center'), createScreening);

router.route('/:id')
  .put(protect, restrictTo('aam_center'), updateScreening)
  .delete(protect, restrictTo('aam_center'), deleteScreening);

router.put('/:id/verify', protect, restrictTo('district'), verifyScreening);
router.get('/stats', protect, getStats);

export default router;