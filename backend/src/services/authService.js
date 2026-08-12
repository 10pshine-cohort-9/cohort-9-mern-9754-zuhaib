const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const userRepository = require('../repositories/userRepository');
const AppError = require('../utils/AppError');

const SALT_ROUNDS = 10;

function toPublicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  };
}

function signToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email },
    env.jwt.secret,
    { expiresIn: env.jwt.expiresIn }
  );
}

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

async function login({ email, password }) {
  const errors = validateLoginInput({ email, password });
  if (errors.length > 0) {
    throw new AppError(errors.join(' '), 400);
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await userRepository.findByEmail(normalizedEmail);

  // Same message for missing user and bad password to avoid account enumeration
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
