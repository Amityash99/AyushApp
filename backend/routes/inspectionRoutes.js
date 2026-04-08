import express from 'express';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import {
  getInspections, createInspection, updateInspection, deleteInspection, verifyInspection, getStats
} from '../controllers/inspectionController.js';

const router = express.Router();

router.route('/')
  .get(protect, getInspections)
  .post(protect, restrictTo('district'), createInspection); // only district can create inspections

router.route('/:id')
  .put(protect, restrictTo('district'), updateInspection)
  .delete(protect, restrictTo('district'), deleteInspection);

router.put('/:id/verify', protect, restrictTo('directorate'), verifyInspection); // directorate verifies
router.get('/stats', protect, getStats);

export default router;