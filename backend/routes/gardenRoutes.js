import express from 'express';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import upload from '../middleware/upload.js';
import {
  getGardens,
  createGarden,
  updateGarden,
  deleteGarden,
  verifyGarden,
  getStats
} from '../controllers/gardenController.js';

const router = express.Router();

router.route('/')
  .get(protect, getGardens)
  .post(protect, restrictTo('aam_center', 'district'), upload.fields([
    { name: 'layoutPhoto', maxCount: 1 },
    { name: 'registrationPhoto', maxCount: 1 }
  ]), createGarden);

router.route('/:id')
  .put(protect, restrictTo('aam_center', 'district'), updateGarden)
  .delete(protect, restrictTo('aam_center', 'district'), deleteGarden);

router.put('/:id/verify', protect, restrictTo('district'), verifyGarden);
router.get('/stats', protect, getStats);

export default router;