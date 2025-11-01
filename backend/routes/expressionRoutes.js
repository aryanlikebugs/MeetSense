import express from 'express';
import { analyzeExpression } from '../controllers/expressionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Frontend: src/services/analyticsService.js (AI Expression)
router.post('/analyze', protect, analyzeExpression);

export default router;
