const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const userRepository = require('../repositories/userRepository');
const AppError = require('../utils/AppError');

const SALT_ROUNDS = 10;

/**
 * Removes sensitive fields from a database user row.
 * @param {Object} user - Raw user row from the database.
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
 * @param {{ id: number, email: string }} user - User identity.
 * @returns {string} Signed JWT.
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
 * @param {{ name?: string, email?: string, password?: string }} input - Request body.
 * @returns {string[]} Validation error messages.
 */
function validateRegisterInput({ name, email, password }) {
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push('Name must be at least 2 characters.');
  }

  if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.push('A valid email is required.');
  }

  if (!password || typeof password !== 'string' || password.length < 8) {
    errors.push('Password must be at least 8 characters.');
  }

  return errors;
}

/**
 * Validates login payload fields.
 * @param {{ email?: string, password?: string }} input - Request body.
 * @returns {string[]} Validation error messages.
 */
function validateLoginInput({ email, password }) {
  const errors = [];

  if (!email || typeof email !== 'string' || !email.trim()) {
    errors.push('Email is required.');
  }

  if (!password || typeof password !== 'string') {
    errors.push('Password is required.');
  }

  return errors;
}

/**
 * Registers a new user account.
 * @param {{ name: string, email: string, password: string }} params - Registration data.
 * @returns {Promise<{ user: Object, token: string }>} Public user and JWT.
 */
async function register({ name, email, password }) {
  const errors = validateRegisterInput({ name, email, password });
  if (errors.length > 0) {
    throw new AppError(errors.join(' '), 400);
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existing = await userRepository.findByEmail(normalizedEmail);
  if (existing) {
    throw new AppError('An account with this email already exists.', 409);
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await userRepository.createUser({
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
  });

  const token = signToken(user);

  return {
    user: toPublicUser(user),
    token,
  };
}

/**
 * Authenticates a user with email and password.
 * @param {{ email: string, password: string }} params - Login credentials.
 * @returns {Promise<{ user: Object, token: string }>} Public user and JWT.
 */
async function login({ email, password }) {
  const errors = validateLoginInput({ email, password });
  if (errors.length > 0) {
    throw new AppError(errors.join(' '), 400);
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await userRepository.findByEmail(normalizedEmail);

  if (!user) {
    throw new AppError('Invalid email or password.', 401);
  }

  const passwordMatches = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatches) {
    throw new AppError('Invalid email or password.', 401);
  }

  const token = signToken(user);

  return {
    user: toPublicUser(user),
    token,
  };
}

/**
 * Returns the public profile for an authenticated user.
 * @param {number} userId - Authenticated user id.
 * @returns {Promise<Object>} Public user profile.
 */
async function getMe(userId) {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new AppError('User not found.', 404);
  }
  return toPublicUser(user);
}

module.exports = {
  register,
  login,
  getMe,
  toPublicUser,
};
