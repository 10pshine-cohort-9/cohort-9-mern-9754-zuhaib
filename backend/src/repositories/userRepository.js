const { pool } = require('../config/db');

const SAFE_USER_COLUMNS = 'id, name, email, created_at, updated_at';

/**
 * Finds a user by email, including the password hash for auth checks.
 * @param {string} email - Normalized email address.
 * @returns {Promise<Object|null>} User row or null when not found.
 */
async function findByEmail(email) {
  const [rows] = await pool.execute(
    `SELECT id, name, email, password_hash, created_at, updated_at
     FROM users
     WHERE email = :email
     LIMIT 1`,
    { email }
  );
  return rows[0] || null;
}

/**
 * Finds a user by primary key without returning sensitive fields.
 * @param {number} id - User id.
 * @returns {Promise<Object|null>} Public user row or null when not found.
 */
async function findById(id) {
  const [rows] = await pool.execute(
    `SELECT ${SAFE_USER_COLUMNS}
     FROM users
     WHERE id = :id
     LIMIT 1`,
    { id }
  );
  return rows[0] || null;
}

/**
 * Persists a new user record.
 * @param {{ name: string, email: string, passwordHash: string }} params - User data.
 * @returns {Promise<Object>} Created user without the password hash.
 */
async function createUser({ name, email, passwordHash }) {
  const [result] = await pool.execute(
    `INSERT INTO users (name, email, password_hash)
     VALUES (:name, :email, :passwordHash)`,
    { name, email, passwordHash }
  );

  return findById(result.insertId);
}

module.exports = {
  findByEmail,
  findById,
  createUser,
};
