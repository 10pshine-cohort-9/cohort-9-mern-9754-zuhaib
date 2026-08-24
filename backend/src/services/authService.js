const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const logger = require('../config/logger');
const userRepository = require('../repositories/userRepository');
const AppError = require('../utils/AppError');

const SALT_ROUNDS = 10;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Ensures the request body is a plain object.
 * @param {unknown} body
 * @throws {AppError}
 */
function requireObjectBody(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new AppError('Request body must be a JSON object.', 400, 'INVALID_BODY');
  }
}

/**
 * Removes sensitive fields from a database user row.
 * @param {Object} user
 * @returns {{ id: number, name: string, email: string, createdAt: Date, updatedAt: Date }}
 */
function toPublicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  };
}

/**
 * Signs a JWT for an authenticated user.
 * @param {{ id: number, email: string }} user
 * @returns {string}
 */
function signToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email },
    env.jwt.secret,
    { expiresIn: env.jwt.expiresIn }
  );
}

/**
 * Validates registration payload fields.
 * @param {{ name?: string, email?: string, password?: string }} input
 * @returns {string[]}
 */
function validateRegisterInput({ name, email, password }) {
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push('Name must be at least 2 characters.');
  }

  if (!email || typeof email !== 'string' || !EMAIL_PATTERN.test(email.trim())) {
    errors.push('A valid email is required.');
  }

  if (!password || typeof password !== 'string' || password.length < 8) {
    errors.push('Password must be at least 8 characters.');
  }

  return errors;
}

/**
 * Validates login payload fields.
 * @param {{ email?: string, password?: string }} input
 * @returns {string[]}
 */
function validateLoginInput({ email, password }) {
  const errors = [];

  if (!email || typeof email !== 'string' || !email.trim()) {
    errors.push('Email is required.');
  } else if (!EMAIL_PATTERN.test(email.trim())) {
    errors.push('A valid email is required.');
  }

  if (!password || typeof password !== 'string' || password.length === 0) {
    errors.push('Password is required.');
  }

  return errors;
}

/**
 * Registers a new user account.
 * @param {{ name: string, email: string, password: string }} params
 * @returns {Promise<{ user: Object, token: string }>}
 */
async function register(params) {
  requireObjectBody(params);
  const errors = validateRegisterInput(params);
  if (errors.length > 0) {
    throw new AppError(errors.join(' '), 400, 'VALIDATION_ERROR');
  }

  const normalizedEmail = params.email.trim().toLowerCase();
  const existing = await userRepository.findByEmail(normalizedEmail);
  if (existing) {
    logger.warn({ email: normalizedEmail }, 'Registration rejected: duplicate email');
    throw new AppError('An account with this email already exists.', 409, 'EMAIL_EXISTS');
  }

  const passwordHash = await bcrypt.hash(params.password, SALT_ROUNDS);
  const user = await userRepository.createUser({
    name: params.name.trim(),
    email: normalizedEmail,
    passwordHash,
  });

  const token = signToken(user);
  logger.info({ userId: user.id }, 'User registered');

  return {
    user: toPublicUser(user),
    token,
  };
}

/**
 * Authenticates a user with email and password.
 * @param {{ email: string, password: string }} params
 * @returns {Promise<{ user: Object, token: string }>}
 */
async function login(params) {
  requireObjectBody(params);
  const errors = validateLoginInput(params);
  if (errors.length > 0) {
    throw new AppError(errors.join(' '), 400, 'VALIDATION_ERROR');
  }

  const normalizedEmail = params.email.trim().toLowerCase();
  const user = await userRepository.findByEmail(normalizedEmail);

  if (!user) {
    logger.warn({ email: normalizedEmail }, 'Authentication failed');
    throw new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
  }

  const passwordMatches = await bcrypt.compare(params.password, user.password_hash);
  if (!passwordMatches) {
    logger.warn({ userId: user.id }, 'Authentication failed');
    throw new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
  }

  const token = signToken(user);
  logger.info({ userId: user.id }, 'User authenticated');

  return {
    user: toPublicUser(user),
    token,
  };
}

/**
 * Returns the public profile for an authenticated user.
 * @param {number} userId
 * @returns {Promise<Object>}
 */
async function getMe(userId) {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new AppError('User not found.', 404, 'USER_NOT_FOUND');
  }
  return toPublicUser(user);
}

module.exports = {
  register,
  login,
  getMe,
  toPublicUser,
};
