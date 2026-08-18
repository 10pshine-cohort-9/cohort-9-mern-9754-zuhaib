const env = require('../config/env');
const AppError = require('../utils/AppError');

/**
 * Converts unknown routes into a 404 operational error.
 * @param {import('express').Request} req - Express request.
 * @param {import('express').Response} res - Express response.
 * @param {import('express').NextFunction} next - Express next function.
 */
function notFoundHandler(req, res, next) {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
}

/**
 * Central error handler that maps errors to JSON responses.
 * @param {Error & { statusCode?: number, isOperational?: boolean, code?: string }} err - Thrown error.
 * @param {import('express').Request} req - Express request.
 * @param {import('express').Response} res - Express response.
 * @param {import('express').NextFunction} _next - Express next function.
 */
function errorHandler(err, req, res, _next) {
  if (err && err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      message: 'An account with this email already exists.',
    });
  }

  const statusCode = err.statusCode || 500;
  const isOperational = err.isOperational === true;

  if (!isOperational || statusCode >= 500) {
    console.error(err);
  }

  const message =
    isOperational || env.nodeEnv !== 'production'
      ? err.message || 'Internal server error.'
      : 'Internal server error.';

  return res.status(statusCode).json({
    message,
  });
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
