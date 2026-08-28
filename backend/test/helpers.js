const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../src/config/env');

/**
 * Builds a public-looking user row as returned from the database.
 * @param {Object} [overrides]
 * @returns {Object}
 */
function buildUser(overrides = {}) {
  return {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    password_hash: bcrypt.hashSync('password123', 4),
    created_at: new Date('2026-01-01T00:00:00.000Z'),
    updated_at: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  };
}

/**
 * Builds a note row as returned from the database.
 * @param {Object} [overrides]
 * @returns {Object}
 */
function buildNote(overrides = {}) {
  return {
    id: 10,
    user_id: 1,
    title: 'My note',
    content: '<p>Hello</p>',
    created_at: new Date('2026-01-02T00:00:00.000Z'),
    updated_at: new Date('2026-01-02T00:00:00.000Z'),
    ...overrides,
  };
}

/**
 * Signs a JWT for a user identity.
 * @param {{ id?: number, email?: string }} [user]
 * @param {import('jsonwebtoken').SignOptions} [options]
 * @returns {string}
 */
function signToken(user = {}, options = {}) {
  return jwt.sign(
    {
      sub: user.id || 1,
      email: user.email || 'test@example.com',
    },
    env.jwt.secret,
    { expiresIn: '1h', ...options }
  );
}

/**
 * Builds an Authorization Bearer header value.
 * @param {string} token
 * @returns {{ Authorization: string }}
 */
function authHeader(token) {
  return { Authorization: `Bearer ${token}` };
}

module.exports = {
  buildUser,
  buildNote,
  signToken,
  authHeader,
};
