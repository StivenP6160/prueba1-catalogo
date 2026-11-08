const pool = require('../db');

const SELECT_PRODUCT = `
  SELECT p.id, p.sku, p.name, p.description, p.price, p.stock, p.is_active,
         p.category_id, c.name AS category_name, p.created_at, p.updated_at
  FROM products p
  JOIN categories c ON c.id = p.category_id
`;

const SORT_OPTIONS = {
  newest: 'p.created_at DESC',
  price_asc: 'p.price ASC',
  price_desc: 'p.price DESC',
  name_asc: 'p.name ASC',
};

function buildFilters({ categoryId, minPrice, maxPrice, search }) {
  const conditions = ['p.is_active = TRUE'];
  const values = [];

  if (categoryId !== undefined) {
    conditions.push('p.category_id = ?');
    values.push(categoryId);
  }
  if (minPrice !== undefined) {
    conditions.push('p.price >= ?');
    values.push(minPrice);
  }
  if (maxPrice !== undefined) {
    conditions.push('p.price <= ?');
    values.push(maxPrice);
  }
  if (search !== undefined) {
    conditions.push('p.name LIKE ?');
    values.push(`%${search}%`);
  }

  return { where: `WHERE ${conditions.join(' AND ')}`, values };
}

async function findAll(filters, { limit, offset, sort }) {
  const { where, values } = buildFilters(filters);
  const orderBy = SORT_OPTIONS[sort] ?? SORT_OPTIONS.newest;

  const [rows] = await pool.query(
    `${SELECT_PRODUCT} ${where} ORDER BY ${orderBy}, p.id ASC LIMIT ? OFFSET ?`,
    [...values, limit, offset]
  );
  return rows;
}

async function count(filters) {
  const { where, values } = buildFilters(filters);
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS total FROM products p ${where}`,
    values
  );
  return rows[0].total;
}

async function findById(id) {
  const [rows] = await pool.execute(`${SELECT_PRODUCT} WHERE p.id = ?`, [id]);
  return rows[0];
}

module.exports = { findAll, count, findById };