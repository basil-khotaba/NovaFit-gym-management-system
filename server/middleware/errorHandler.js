/**
 * Global error-handling middleware.
 *
 * Express recognizes this as an error handler because it has
 * FOUR parameters (err, req, res, next). It catches every error
 * passed via next(error) from anywhere in the app and returns a
 * consistent JSON response: { success: false, message }.
 *
 * It also handles a few common Mongoose errors so the client
 * gets a clear 400/409 instead of a generic 500.
 *
 * @param {Error} err - the error passed to next()
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const globalErrorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Mongoose: invalid ObjectId (e.g. /api/classes/not-a-real-id)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // Mongoose: schema validation failed
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
  }

  // Mongoose: duplicate unique field (e.g. email already exists)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `That ${field} is already in use`;
  }

  // Log the full error on the server for debugging.
  console.error(`ERROR ${statusCode}: ${message}`);
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    message,
    // Only expose the stack trace during development.
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = globalErrorHandler;
