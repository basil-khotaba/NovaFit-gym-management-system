const rateLimit = require('express-rate-limit');

/**
 * Rate limiters protect the API from abuse by capping how many
 * requests a single IP address can make in a time window.
 */

/**
 * General limiter — applied to all /api routes.
 * Allows a generous number of normal requests.
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // up to 200 requests per IP per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please try again in a few minutes.',
  },
});

/**
 * Strict limiter — applied only to login/register.
 * A low limit here makes brute-force password guessing impractical.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // only 20 login/register attempts per IP per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again later.',
  },
});

module.exports = { apiLimiter, authLimiter };
