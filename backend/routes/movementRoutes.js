import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getMovements, createMovement, updateMovement, deleteMovement
} from '../controllers/movementController.js';

const router = express.Router();

router.route('/')
  .get(protect, getMovements)
  .post(protect, createMovement);

router.route('/:id')
  .put(protect, updateMovement)
  .delete(protect, deleteMovement);

export default router;