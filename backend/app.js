import express from 'express';
import cors from 'cors';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';
import './config/env.js';
import aiNotesRouter from './routes/aiNotes.js';
import importNotesRouter from './routes/importNotes.js';

// Import emotion detection routes
import detectRoutes from './routes/detect.js';
import emotionAnalyticsRoutes from './analytics.js';

import authRoutes from './routes/authRoutes.js';
import meetingRoutes from './routes/meetingRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import expressionRoutes from './routes/expressionRoutes.js';
import userRoutes from './routes/userRoutes.js';
import testRoute from './routes/testRoute.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: process.env.CLIENT_URL || process.env.FRONTEND_URL,
  credentials: true
}));

// Frontend: src/services/authService.js
app.use('/api/auth', authRoutes);
// Frontend: src/services/meetingService.js
app.use('/api/meetings', meetingRoutes);
// Frontend: src/services/analyticsService.js
app.use('/api/analytics', analyticsRoutes);
app.use('/api/expression', expressionRoutes);
// Frontend: src/services/authService.js (profile)
app.use('/api/users', userRoutes);

// Test route base
app.use('/api', testRoute);

// AI Notes routes
app.use('/api', aiNotesRouter);
app.use('/api', importNotesRouter);

// Emotion detection routes
app.use('/api/detect', detectRoutes);
app.use('/api/emotion-analytics', emotionAnalyticsRoutes);


app.use(notFound);
app.use(errorHandler);

export default app;
