const env = require('../config/env');
const logger = require('../config/logger');
const AppError = require('../utils/AppError');

/**
 * Converts unknown routes into a 404 operational error.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function notFoundHandler(req, res, next) {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404, 'NOT_FOUND'));
}

/**
 * Builds a consistent JSON error body. Stack traces stay out of production.
 * @param {Error & { statusCode?: number, isOperational?: boolean, code?: string, type?: string }} err
 * @returns {{ message: string, code: string }}
 */
function toClientError(err) {
  const isProduction = env.nodeEnv === 'production';
  const isOperational = err.isOperational === true || err instanceof AppError;
  const statusCode = err.statusCode || 500;

  if (isOperational && statusCode < 500) {
    return {
      message: err.message || 'Request failed.',
      code: err.code || 'APP_ERROR',
    };
  }

  return {
    message: isProduction ? 'Internal server error.' : err.message || 'Internal server error.',
    code: 'INTERNAL_ERROR',
  };
}

/**
 * Central error handler for operational and unexpected failures.
 * @param {Error & { statusCode?: number, isOperational?: boolean, code?: string, type?: string }} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} _next
 */
function errorHandler(err, req, res, _next) {
  const log = req.log || logger;

  if (err && err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      message: 'An account with this email already exists.',
      code: 'EMAIL_EXISTS',
    });
  }

  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    log.warn({ requestId: req.id }, 'Malformed JSON body');
    return res.status(400).json({
      message: 'Malformed JSON body.',
      code: 'INVALID_JSON',
    });
  }

  const statusCode = err.statusCode || 500;
  const isOperational = err.isOperational === true || err instanceof AppError;

  if (!isOperational || statusCode >= 500) {
    log.error({ err, requestId: req.id }, 'Unexpected exception');
  } else if (statusCode >= 400) {
    log.warn(
      { requestId: req.id, statusCode, code: err.code },
      err.message || 'Request failed'
    );
  }

  return res.status(statusCode).json(toClientError(err));
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
