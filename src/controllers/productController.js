const productService = require('../services/productService');

async function list(req, res) {
  const result = await productService.list(req.query);
  res.json(result);
}

async function getOne(req, res) {
  const product = await productService.getById(req.params.id);
  res.json({ data: product });
}

async function create(req, res) {
  const product = await productService.create(req.body);
  res.status(201).json({ data: product });
}

async function update(req, res) {
  const product = await productService.update(req.params.id, req.body);
  res.json({ data: product });
}

async function remove(req, res) {
  await productService.remove(req.params.id);
  res.status(204).send();
}

module.exports = { list, getOne, create, update, remove };