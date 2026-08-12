const { pool } = require('../config/db');

const SAFE_USER_COLUMNS = 'id, name, email, created_at, updated_at';

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
