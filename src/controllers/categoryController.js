const categoryService = require('../services/categoryService');

async function list(req, res) {
  const categories = await categoryService.getAll();
  res.json({ data: categories });
}

async function getOne(req, res) {
  const category = await categoryService.getById(req.params.id);
  res.json({ data: category });
}

async function create(req, res) {
  const category = await categoryService.create(req.body?.name);
  res.status(201).json({ data: category });
}

async function update(req, res) {
  const category = await categoryService.update(req.params.id, req.body?.name);
  res.json({ data: category });
}

async function remove(req, res) {
  await categoryService.remove(req.params.id);
  res.status(204).send();
}

module.exports = { list, getOne, create, update, remove };