const Joi = require('joi');

/**
 * JOI validation schemas for authentication requests.
 *
 * JOI checks the shape of incoming request bodies BEFORE they reach
 * the controller. This is our first line of defense against bad data
 * (the Mongoose schema is the second line).
 */

/**
 * Rules for POST /api/auth/register.
 * The request body must contain a valid name, email, and password.
 */
const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    'string.empty': 'Name is required',
    'string.min': 'Name must be at least 2 characters',
    'any.required': 'Name is required',
  }),

  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'string.empty': 'Email is required',
    'any.required': 'Email is required',
  }),

  password: Joi.string().min(6).max(100).required().messages({
    'string.min': 'Password must be at least 6 characters',
    'string.empty': 'Password is required',
    'any.required': 'Password is required',
  }),
});

/**
 * Rules for POST /api/auth/login.
 * Only email and password are needed to log in.
 */
const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),

  password: Joi.string().required().messages({
    'any.required': 'Password is required',
  }),
});

module.exports = { registerSchema, loginSchema };
