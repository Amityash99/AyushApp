import express from 'express';
import { registerUser as register, loginUser as login } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

export default router;

