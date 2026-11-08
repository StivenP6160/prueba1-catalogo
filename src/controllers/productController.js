const productService = require('../services/productService');

async function list(req, res) {
  const result = await productService.list(req.query);
  res.json(result);
}

async function getOne(req, res) {
  const product = await productService.getById(req.params.id);
  res.json({ data: product });
}

module.exports = { list, getOne };