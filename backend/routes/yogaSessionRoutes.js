import express from 'express';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import upload from '../middleware/upload.js';
import {
  getSessions, createSession, updateSession, deleteSession, verifySession, getStats,
  createSessionWithPhotos, updateSessionWithPhotos
} from '../controllers/yogaSessionController.js';

const router = express.Router();

router.route('/')
  .get(protect, getSessions)
  .post(protect, restrictTo('aam_center'), upload.array('photos', 4), createSessionWithPhotos);


router.route('/:id')
  .put(protect, restrictTo('aam_center'), upload.array('photos', 4), updateSessionWithPhotos)
  .delete(protect, restrictTo('aam_center'), deleteSession);

router.put('/:id/verify', protect, restrictTo('district'), verifySession);
router.get('/stats', protect, getStats);

export default router;