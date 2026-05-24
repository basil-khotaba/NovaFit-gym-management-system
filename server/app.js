require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

const logger = require('./middleware/logger');
const globalErrorHandler = require('./middleware/errorHandler');
const AppError = require('./utils/AppError');
const { apiLimiter, authLimiter } = require('./middleware/rateLimiter');

// Route files
const authRoutes = require('./routes/authRoutes');
const trainerRoutes = require('./routes/trainerRoutes');
const classRoutes = require('./routes/classRoutes');
const planRoutes = require('./routes/planRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

const app = express();

/* ------------------------------------------------------------------ *
 * Global middleware
 * ------------------------------------------------------------------ */

// Security HTTP headers (XSS, clickjacking, MIME sniffing protection).
app.use(helmet());

// Allow the React frontend to call this API.
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

// Parse JSON request bodies into req.body.
app.use(express.json());

// Log every request to the console.
app.use(logger);

// Serve uploaded images as static files (e.g. /uploads/12345.jpg).
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Apply the general rate limiter to every /api route.
app.use('/api', apiLimiter);

/* ------------------------------------------------------------------ *
 * Routes
 * ------------------------------------------------------------------ */

// Simple health-check route - confirms the server is alive.
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'NovaFit API is running' });
});

// The strict authLimiter is applied to login/register to slow brute-force.
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Feature routes
app.use('/api/auth', authRoutes);
app.use('/api/trainers', trainerRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);

// More feature routes are mounted here as we build them:
// app.use('/api/memberships', membershipRoutes);

/* ------------------------------------------------------------------ *
 * 404 handler - any route not matched above
 * ------------------------------------------------------------------ */
app.use((req, res, next) => {
  next(new AppError(`Route not found: ${req.originalUrl}`, 404));
});

// Global error handler - MUST be the last middleware registered.
app.use(globalErrorHandler);

module.exports = app;