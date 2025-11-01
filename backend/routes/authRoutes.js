import express from 'express';
import { signup, login, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Frontend: src/services/authService.js
router.post('/signup', signup);
router.post('/login', login);
router.get('/me', protect, getMe);

export default router;
