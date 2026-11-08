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

async function create(product) {
  const [result] = await pool.execute(
    `INSERT INTO products (sku, name, description, price, stock, category_id)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      product.sku,
      product.name,
      product.description ?? null,
      product.price,
      product.stock ?? 0,
      product.category_id,
    ]
  );
  return result.insertId;
}

const UPDATABLE_FIELDS = ['sku', 'name', 'description', 'price', 'stock', 'category_id'];

async function update(id, changes) {
  const fields = UPDATABLE_FIELDS.filter((field) => changes[field] !== undefined);
  const setClause = fields.map((field) => `${field} = ?`).join(', ');
  const values = fields.map((field) => changes[field]);

  await pool.execute(
    `UPDATE products SET ${setClause} WHERE id = ? AND is_active = TRUE`,
    [...values, id]
  );
}

async function softDelete(id) {
  const [result] = await pool.execute(
    'UPDATE products SET is_active = FALSE WHERE id = ? AND is_active = TRUE',
    [id]
  );
  return result.affectedRows;
}

module.exports = { findAll, count, findById, create, update, softDelete };
