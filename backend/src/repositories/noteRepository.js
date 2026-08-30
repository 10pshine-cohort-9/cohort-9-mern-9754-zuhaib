const { pool } = require('../config/db');

const NOTE_COLUMNS = 'id, user_id, title, content, created_at, updated_at';

/**
 * Lists notes owned by a user with optional search and sort.
 * @param {number} userId
 * @param {{ search?: string, sort?: string }} [options]
 * @returns {Promise<Object[]>}
 */
async function findAllByUserId(userId, { search = '', sort = 'newest' } = {}) {
  const conditions = ['user_id = :userId'];
  const params = { userId };

  if (search) {
    conditions.push('(title LIKE :search OR content LIKE :search)');
    params.search = `%${search}%`;
  }

  let orderBy = 'updated_at DESC, id DESC';
  if (sort === 'oldest') {
    orderBy = 'updated_at ASC, id ASC';
  } else if (sort === 'title') {
    orderBy = 'title ASC, id ASC';
  }

  const [rows] = await pool.execute(
    `SELECT ${NOTE_COLUMNS}
     FROM notes
     WHERE ${conditions.join(' AND ')}
     ORDER BY ${orderBy}`,
    params
  );
  return rows;
}

/**
 * Finds a single note by id.
 * @param {number} id
 * @returns {Promise<Object|null>}
 */
async function findById(id) {
  const [rows] = await pool.execute(
    `SELECT ${NOTE_COLUMNS}
     FROM notes
     WHERE id = :id
     LIMIT 1`,
    { id }
  );
  return rows[0] || null;
}

/**
 * Inserts a note and returns the created row.
 * @param {{ userId: number, title: string, content: string }} params
 * @returns {Promise<Object>}
 */
async function createNote({ userId, title, content }) {
  const [result] = await pool.execute(
    `INSERT INTO notes (user_id, title, content)
     VALUES (:userId, :title, :content)`,
    { userId, title, content }
  );
  return findById(result.insertId);
}

/**
 * Updates a note owned by the given user.
 * @param {{ id: number, userId: number, title: string, content: string }} params
 * @returns {Promise<Object|null>}
 */
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
  return findById(id);
}

/**
 * Deletes a note owned by the given user.
 * @param {number} id
 * @param {number} userId
 * @returns {Promise<boolean>} True when a row was deleted.
 */
async function deleteNote(id, userId) {
  const [result] = await pool.execute(
    `DELETE FROM notes
     WHERE id = :id AND user_id = :userId`,
    { id, userId }
  );
  return result.affectedRows > 0;
}

module.exports = {
  findAllByUserId,
  findById,
  createNote,
  updateNote,
  deleteNote,
};
