import express from 'express';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import {
  getCampaigns, createCampaign, updateCampaign, deleteCampaign
} from '../controllers/ncdCampaignController.js';

const router = express.Router();

router.route('/')
  .get(protect, getCampaigns)
  .post(protect, restrictTo('state'), createCampaign);

router.route('/:id')
  .put(protect, restrictTo('state'), updateCampaign)
  .delete(protect, restrictTo('state'), deleteCampaign);

export default router;