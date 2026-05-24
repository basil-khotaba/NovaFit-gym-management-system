/**
 * Request logger middleware.
 *
 * Runs on every incoming request and prints the timestamp,
 * HTTP method, and URL to the console. Useful for debugging
 * and for seeing traffic during the demo.
 *
 * Must call next() to pass control to the next middleware.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const logger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
};

module.exports = logger;
