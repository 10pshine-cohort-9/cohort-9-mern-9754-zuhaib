const { pool } = require('../config/db');

const NOTE_COLUMNS = 'id, user_id, title, content, created_at, updated_at';

async function findAllByUserId(userId) {
  const [rows] = await pool.execute(
    `SELECT ${NOTE_COLUMNS}
     FROM notes
     WHERE user_id = :userId
     ORDER BY updated_at DESC, id DESC`,
    { userId }
  );
  return rows;
}

async function findByIdForUser(id, userId) {
  const [rows] = await pool.execute(
    `SELECT ${NOTE_COLUMNS}
     FROM notes
     WHERE id = :id AND user_id = :userId
     LIMIT 1`,
    { id, userId }
  );
  return rows[0] || null;
}

async function createNote({ userId, title, content }) {
  const [result] = await pool.execute(
    `INSERT INTO notes (user_id, title, content)
     VALUES (:userId, :title, :content)`,
    { userId, title, content }
  );

  return findByIdForUser(result.insertId, userId);
}

async function updateNote({ id, userId, title, content }) {
  const [result] = await pool.execute(
    `UPDATE notes
     SET title = :title, content = :content
     WHERE id = :id AND user_id = :userId`,
    { id, userId, title, content }
  );

  if (result.affectedRows === 0) {
    return null;
  }

  return findByIdForUser(id, userId);
}

async function deleteNote({ id, userId }) {
  const [result] = await pool.execute(
    `DELETE FROM notes
     WHERE id = :id AND user_id = :userId`,
    { id, userId }
  );

  return result.affectedRows > 0;
}

module.exports = {
  findAllByUserId,
  findByIdForUser,
  createNote,
  updateNote,
  deleteNote,
};
