import express from 'express';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import upload from '../middleware/upload.js';
import {
  getSessions,
  createSession,
  updateSession,
  deleteSession,
  verifySession,
  getStats
} from '../controllers/yogaSessionController.js';

const router = express.Router();

// Allow both aam_center and yoga_instructor to create sessions
router.route('/')
  .get(protect, getSessions)
  .post(protect, restrictTo('aam_center', 'yoga_instructor'), upload.array('photos', 4), createSession);

router.route('/:id')
  .put(protect, restrictTo('aam_center', 'yoga_instructor'), upload.array('photos', 4), updateSession)
  .delete(protect, restrictTo('aam_center', 'yoga_instructor'), deleteSession);

// Only district can verify
router.put('/:id/verify', protect, restrictTo('district'), verifySession);
router.get('/stats', protect, getStats);

export default router;