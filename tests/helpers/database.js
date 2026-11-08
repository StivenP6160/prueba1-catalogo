const fs = require('node:fs');
const path = require('node:path');
const mysql = require('mysql2/promise');

const schemaSql = fs.readFileSync(path.join(__dirname, '../../database/01_schema.sql'), 'utf8');
const seedSql = fs.readFileSync(path.join(__dirname, '../../database/02_seed.sql'), 'utf8');

function getTestDbName() {
  const dbName = process.env.DB_NAME;
  if (!dbName || !dbName.endsWith('_test')) {
    throw new Error(`Por seguridad, los tests solo corren en una base que termine en _test. Recibí: ${dbName}`);
  }
  return dbName;
}

function connect(database) {
  return mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database,
    multipleStatements: true,
  });
}

async function resetDatabase() {
  const dbName = getTestDbName();
  const connection = await connect();
  try {
    await connection.query(`DROP DATABASE IF EXISTS \`${dbName}\`; CREATE DATABASE \`${dbName}\`;`);
    await connection.changeUser({ database: dbName });
    await connection.query(schemaSql);
  } finally {
    await connection.end();
  }
}

async function seedDatabase() {
  const connection = await connect(getTestDbName());
  try {
    await connection.query(`
      SET FOREIGN_KEY_CHECKS = 0;
      TRUNCATE TABLE products;
      TRUNCATE TABLE categories;
      SET FOREIGN_KEY_CHECKS = 1;
      ${seedSql}
    `);
  } finally {
    await connection.end();
  }
}

module.exports = { resetDatabase, seedDatabase };