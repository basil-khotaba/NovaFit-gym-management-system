const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const AppError = require('../utils/AppError');

/**
 * Auth controller.
 *
 * Holds the logic for registering, logging in, and fetching the
 * currently logged-in user. Routes stay thin; the logic lives here.
 */

/**
 * Register a new user.
 *
 * Route:  POST /api/auth/register
 * Access: Public
 *
 * The password is hashed automatically by the User model's pre-save
 * hook, so we never hash it here.
 */
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Reject if the email is already taken.
    const existing = await User.findOne({ email });
    if (existing) {
      return next(new AppError('That email is already registered', 409));
    }

    // Create the user. New users are always 'member' (the schema
    // default) — there is no way to register directly as admin.
    const user = await User.create({ name, email, password });

    // Issue a token so the user is logged in immediately after
    // registering — no need to log in again as a separate step.
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Log a user in.
 *
 * Route:  POST /api/auth/login
 * Access: Public
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // The password field has select:false in the schema, so we must
    // explicitly ask for it back here using .select('+password').
    const user = await User.findOne({ email }).select('+password');

    // IMPORTANT: return the SAME message whether the email is wrong
    // or the password is wrong. This stops attackers from discovering
    // which emails are registered (user enumeration).
    if (!user) {
      return next(new AppError('Invalid email or password', 401));
    }

    // comparePassword is the instance method defined on the User model.
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return next(new AppError('Invalid email or password', 401));
    }

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get the currently logged-in user.
 *
 * Route:  GET /api/auth/me
 * Access: Protected (requires a valid token)
 *
 * The frontend calls this on every page load to restore the user's
 * session from a stored token. req.user is set by the protect
 * middleware before this function runs.
 */
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        membership: user.membership,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    next(error);
  }
};


/**
 * Upload (or replace) the logged-in user's profile image.
 * Route:  PATCH /api/auth/me/avatar
 * Access: Protected (any logged-in user)
 */
exports.uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError('Please upload an image file', 400));
    }

    // req.user is set by the protect middleware — the user updates
    // their OWN avatar, identified by their token (not a URL id).
    const user = await User.findById(req.user._id);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    user.profileImage = `/uploads/${req.file.filename}`;
    await user.save();

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Select / change the logged-in user's membership plan.
 * Route:  PATCH /api/auth/me/plan
 * Access: Protected
 *
 * Creates a Membership document linking the user to the chosen plan,
 * and points the user's "membership" field at it.
 */
exports.selectPlan = async (req, res, next) => {
  try {
    const Plan = require('../models/Plan');
    const Membership = require('../models/Membership');

    const plan = await Plan.findById(req.body.plan);
    if (!plan) {
      return next(new AppError('No plan found with that id', 404));
    }

    // Membership runs for 30 days from today.
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);

    const membership = await Membership.create({
      user: req.user._id,
      plan: plan._id,
      startDate,
      endDate,
      isActive: true,
    });

    // Link the membership onto the user.
    const user = await User.findById(req.user._id);
    user.membership = membership._id;
    await user.save();

    res.status(200).json({ success: true, data: membership });
  } catch (error) {
    next(error);
  }
};