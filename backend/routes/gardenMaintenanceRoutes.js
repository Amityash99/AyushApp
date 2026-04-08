import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/upload.js';
import {
  getMaintenances,
  createMaintenance,
  updateMaintenance,
  deleteMaintenance
} from '../controllers/gardenMaintenanceController.js';

const router = express.Router();

router.route('/')
  .get(protect, getMaintenances)
  .post(protect, upload.array('photos', 5), createMaintenance);

router.route('/:id')
  .put(protect, updateMaintenance)
  .delete(protect, deleteMaintenance);

export default router;