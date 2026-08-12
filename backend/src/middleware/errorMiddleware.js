const env = require('../config/env');
const AppError = require('../utils/AppError');

function notFoundHandler(req, res, next) {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
}

function errorHandler(err, req, res, _next) {
  // Duplicate email from MySQL unique constraint (race condition safety net)
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
