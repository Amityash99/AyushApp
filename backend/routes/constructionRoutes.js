import express from 'express';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import upload from '../middleware/upload.js';  // existing multer config
import {
  getWorks, createWork, updateWork, deleteWork, verifyWork, getStats
} from '../controllers/constructionController.js';

const router = express.Router();

router.route('/')
  .get(protect, getWorks)
  .post(protect, restrictTo('aam_center', 'pwd'), upload.fields([
    { name: 'designPhoto', maxCount: 1 },
    { name: 'gschedulePhoto', maxCount: 1 },
    { name: 'invoiceCopy', maxCount: 1 }
  ]), createWork);

router.route('/:id')
  .put(protect, restrictTo('aam_center', 'pwd'), upload.fields([
    { name: 'designPhoto', maxCount: 1 },
    { name: 'gschedulePhoto', maxCount: 1 },
    { name: 'invoiceCopy', maxCount: 1 }
  ]), updateWork)
  .delete(protect, restrictTo('aam_center', 'pwd'), deleteWork);

router.put('/:id/verify', protect, restrictTo('district', 'pwd'), verifyWork);
router.get('/stats', protect, getStats);

export default router;