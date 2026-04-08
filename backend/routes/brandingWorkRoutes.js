import express from 'express';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import {
  getWorks, createWork, updateWork, deleteWork, verifyWork, getStats
} from '../controllers/brandingWorkController.js';

const router = express.Router();

router.route('/')
  .get(protect, getWorks)
  .post(protect, restrictTo('aam_center'), createWork);

router.route('/:id')
  .put(protect, restrictTo('aam_center'), updateWork)
  .delete(protect, restrictTo('aam_center'), deleteWork);

router.put('/:id/verify', protect, restrictTo('district'), verifyWork);
router.get('/stats', protect, getStats);

export default router;