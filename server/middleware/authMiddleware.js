const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');

/**
 * Authentication & authorization middleware.
 *
 * protect    — answers "is this a logged-in user?" (authentication)
 * restrictTo — answers "is this user allowed to do this?" (authorization)
 */

/**
 * protect — verifies the JWT and attaches the user to the request.
 *
 * Put this on any route that requires the user to be logged in.
 * If the token is missing, invalid, or expired, the request is
 * rejected with 401 before it ever reaches the controller.
 */
exports.protect = async (req, res, next) => {
  try {
    let token;

    // The token is expected in the header: "Authorization: Bearer <token>"
    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('Not authorized — no token provided', 401));
    }

    // Verify the signature and expiry. Throws if the token is bad.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Load the user named in the token and attach it to the request
    // so downstream controllers can use req.user.
    const user = await User.findById(decoded.userId);
    if (!user) {
      return next(new AppError('The user for this token no longer exists', 401));
    }

    req.user = user;
    next();
  } catch (error) {
    // jwt.verify throws for invalid or expired tokens.
    return next(new AppError('Not authorized — token invalid or expired', 401));
  }
};

/**
 * restrictTo — allows only certain roles to continue.
 *
 * Use it AFTER protect. Example, admin-only route:
 *   router.delete('/:id', protect, restrictTo('admin'), deleteClass);
 *
 * @param {...string} roles - the roles permitted to access the route
 * @returns {Function} an Express middleware function
 */
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};
