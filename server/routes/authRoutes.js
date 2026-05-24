const express = require('express');
const router = express.Router();

const {
  register,
  login,
  getMe,
  uploadAvatar,
  selectPlan,
} = require('../controllers/authController');

const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { registerSchema, loginSchema } = require('../validation/authValidation');
const upload = require('../middleware/upload');

/**
 * Auth routes — mounted at /api/auth in app.js.
 *
 * Middleware runs left to right. For example, on /register:
 *   validate(registerSchema)  →  checks the body is valid
 *   register                  →  runs only if validation passed
 */

// POST /api/auth/register — create a new account (public)
router.post('/register', validate(registerSchema), register);

// POST /api/auth/login — log in, returns a JWT (public)
router.post('/login', validate(loginSchema), login);

// GET /api/auth/me — get the current user (requires a valid token)
router.get('/me', protect, getMe);

// Upload the logged-in user's avatar.
router.patch('/me/avatar', protect, upload.single('avatar'), uploadAvatar);

// Member selects their membership plan.
router.patch('/me/plan', protect, selectPlan);

module.exports = router;
