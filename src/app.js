const express = require('express');
const pool = require('./db');
const categoryRoutes = require('./routes/categoryRoutes');
const { notFound, errorHandler } = require('./middlewares/errorHandler');
const productRoutes = require('./routes/productRoutes');

const app = express();

app.use(express.json());

app.get('/health', async (req, res) => {
  await pool.query('SELECT 1');
  res.json({ status: 'ok', database: 'connected' });
});

app.use('/api/categories', categoryRoutes);

app.use('/api/products', productRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;