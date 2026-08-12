const jwt = require('jsonwebtoken');
const env = require('../config/env');
const AppError = require('../utils/AppError');

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Authentication required.', 401));
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    return next(new AppError('Authentication required.', 401));
  }

  try {
    const payload = jwt.verify(token, env.jwt.secret);
    req.user = {
      id: payload.sub,
      email: payload.email,
    };
    return next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Token has expired.', 401));
    }
    return next(new AppError('Invalid token.', 401));
  }
}

module.exports = {
  authenticate,
};
