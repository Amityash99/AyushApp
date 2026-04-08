import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getReports, createReport, updateReport, deleteReport, getStats
} from '../controllers/reportingController.js';

const router = express.Router();

router.route('/')
  .get(protect, getReports)
  .post(protect, createReport);

router.route('/:id')
  .put(protect, updateReport)
  .delete(protect, deleteReport);

router.get('/stats', protect, getStats);

export default router;