/**
 * A custom error type that carries an HTTP status code.
 *
 * Normal JavaScript errors only have a message. By adding a
 * statusCode, our global error handler can respond with the
 * correct HTTP status (404, 401, etc.) instead of always 500.
 *
 * Example:
 *   throw new AppError('Class not found', 404);
 */
class AppError extends Error {
  /**
   * @param {string} message - human-readable error message
   * @param {number} statusCode - HTTP status code (e.g. 400, 404)
   */
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    // Marks errors we created on purpose (vs. unexpected crashes).
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
