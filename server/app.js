require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

const logger = require('./middleware/logger');
const globalErrorHandler = require('./middleware/errorHandler');
const AppError = require('./utils/AppError');
const { apiLimiter, authLimiter } = require('./middleware/rateLimiter');

// Pre-load all models so Mongoose populate() can find their schemas.
require('./models/User');
require('./models/Plan');
require('./models/Membership');
require('./models/Trainer');
require('./models/Class');
require('./models/Booking');
require('./models/Review');

// Route files
const authRoutes = require('./routes/authRoutes');
const trainerRoutes = require('./routes/trainerRoutes');
const classRoutes = require('./routes/classRoutes');
const planRoutes = require('./routes/planRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

const app = express();

// Render (like Heroku, Vercel, etc.) puts the app behind one reverse
// proxy hop, which sets X-Forwarded-For to the real client IP. Without
// this, Express's req.ip is the proxy's own IP for every request, and
// express-rate-limit refuses to run (it can't tell users apart by IP).
app.set('trust proxy', 1);

/* ------------------------------------------------------------------ *
 * Global middleware
 * ------------------------------------------------------------------ */

// Security HTTP headers (XSS, clickjacking, MIME sniffing protection).
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// Allow the React frontend to call this API.
// In development, accept any localhost port so Vite's auto-port works.
//
// CLIENT_URL is sanitized before use: it gets echoed back verbatim as
// the Access-Control-Allow-Origin header, so a stray invisible
// character from copy-pasting (zero-width space, a bidi mark, a
// trailing newline) makes Node throw "Invalid character in header
// content" on every single request.
const sanitizeUrl = (value) => {
  var invisiblePattern = String.fromCharCode(0x200B, 0x200C, 0x200D, 0x200E, 0x200F, 0x202A, 0x202B, 0x202C, 0x202D, 0x202E, 0xFEFF);
  var controlPattern = String.fromCharCode(13, 10, 9);
  var invisibleRegex = new RegExp("[" + invisiblePattern + "]", "g");
  var controlRegex = new RegExp("[" + controlPattern + "]", "g");
  return (value || "").replace(invisibleRegex, "").replace(controlRegex, "").trim();
};

const corsOrigin =
  process.env.NODE_ENV === 'development'
    ? /^http:\/\/localhost(:\d+)?$/
    : sanitizeUrl(process.env.CLIENT_URL);

app.use(
  cors({
    origin: corsOrigin,
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

// Root route - this is an API-only server with no homepage, so point
// visitors who land here directly (e.g. by opening the Render URL in
// a browser) at somewhere useful instead of a bare 404.
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'NovaFit API is running. See /api/health for a status check.',
  });
});

// Simple health-check route - confirms the server is alive.
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'NovaFit API is running' });
});

// Public stats - member count, trainer count, class count.
app.get('/api/stats', async (req, res) => {
  try {
    const User    = require('./models/User');
    const Trainer = require('./models/Trainer');
    const Class   = require('./models/Class');
    const [members, trainers, classes] = await Promise.all([
      User.countDocuments({ role: 'member' }),
      Trainer.countDocuments(),
      Class.countDocuments(),
    ]);
    res.json({ success: true, data: { members, trainers, classes } });
  } catch (e) {
    res.status(500).json({ success: false });
  }
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
