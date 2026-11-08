const express = require('express');
const pool = require('./db');

const app = express();

app.use(express.json());

app.get('/health', async (req, res) => {
  await pool.query('SELECT 1');
  res.json({ status: 'ok', database: 'connected' });
});

module.exports = app;