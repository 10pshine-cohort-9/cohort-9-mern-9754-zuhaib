const jwt = require('jsonwebtoken');
const env = require('../config/env');
const logger = require('../config/logger');
const AppError = require('../utils/AppError');

/**
 * Validates a Bearer JWT and attaches the authenticated user to `req.user`.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Authentication required.', 401, 'UNAUTHORIZED'));
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    return next(new AppError('Authentication required.', 401, 'UNAUTHORIZED'));
  }

  try {
    const payload = jwt.verify(token, env.jwt.secret);
    const userId = Number(payload.sub);

    if (!Number.isInteger(userId) || userId <= 0) {
      return next(new AppError('Invalid token.', 401, 'INVALID_TOKEN'));
    }

    req.user = {
      id: userId,
      email: payload.email,
    };
    return next();
  } catch (error) {
    const log = req.log || logger;
    if (error.name === 'TokenExpiredError') {
      log.warn({ requestId: req.id }, 'Expired JWT rejected');
      return next(new AppError('Token has expired.', 401, 'TOKEN_EXPIRED'));
    }
    log.warn({ requestId: req.id }, 'Invalid JWT rejected');
    return next(new AppError('Invalid token.', 401, 'INVALID_TOKEN'));
  }
}

module.exports = {
  authenticate,
};
