import express from 'express';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import {
  getReports, createReport, updateReport, deleteReport, verifyReport
} from '../controllers/iecReportController.js';

const router = express.Router();

router.route('/')
  .get(protect, getReports)
  .post(protect, restrictTo('aam_center'), createReport);

router.route('/:id')
  .put(protect, restrictTo('aam_center'), updateReport)
  .delete(protect, restrictTo('aam_center'), deleteReport);

router.put('/:id/verify', protect, restrictTo('district'), verifyReport);

export default router;