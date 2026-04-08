import express from 'express';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import {
  getPlans, createPlan, updatePlan, deletePlan
} from '../controllers/iecPlanController.js';

const router = express.Router();

router.route('/')
  .get(protect, getPlans)
  .post(protect, restrictTo('state'), createPlan);

router.route('/:id')
  .put(protect, restrictTo('state'), updatePlan)
  .delete(protect, restrictTo('state'), deletePlan);

export default router;