const pool = require('../db');

async function findAll() {
  const [rows] = await pool.query(
    'SELECT id, name, created_at FROM categories ORDER BY name'
  );
  return rows;
}

async function findById(id) {
  const [rows] = await pool.execute(
    'SELECT id, name, created_at FROM categories WHERE id = ?',
    [id]
  );
  return rows[0];
}

async function create(name) {
  const [result] = await pool.execute(
    'INSERT INTO categories (name) VALUES (?)',
    [name]
  );
  return result.insertId;
}

async function update(id, name) {
  const [result] = await pool.execute(
    'UPDATE categories SET name = ? WHERE id = ?',
    [name, id]
  );
  return result.affectedRows;
}

async function remove(id) {
  const [result] = await pool.execute(
    'DELETE FROM categories WHERE id = ?',
    [id]
  );
  return result.affectedRows;
}

module.exports = { findAll, findById, create, update, remove };