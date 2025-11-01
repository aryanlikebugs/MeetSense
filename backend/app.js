import express from 'express';
import cors from 'cors';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';
import './config/env.js';

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

// Placeholder: future integration for /ai Python microservice
// app.use('/ai', ...);

app.use(notFound);
app.use(errorHandler);

export default app;
