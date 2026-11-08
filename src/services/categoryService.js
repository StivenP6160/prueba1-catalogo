const categoryRepository = require('../repositories/categoryRepository');
const AppError = require('../utils/AppError');
const { parseId } = require('../utils/validators');

function validateName(name) {
  if (typeof name !== 'string') {
    throw new AppError('El campo name es obligatorio y debe ser texto', 400);
  }
  const clean = name.trim();
  if (clean.length < 2 || clean.length > 100) {
    throw new AppError('El nombre debe tener entre 2 y 100 caracteres', 400);
  }
  return clean;
}

async function getAll() {
  return categoryRepository.findAll();
}

async function getById(id) {
  const category = await categoryRepository.findById(parseId(id));
  if (!category) {
    throw new AppError('Categoría no encontrada', 404);
  }
  return category;
}

async function create(name) {
  const cleanName = validateName(name);
  try {
    const newId = await categoryRepository.create(cleanName);
    return categoryRepository.findById(newId);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new AppError('Ya existe una categoría con ese nombre', 409);
    }
    throw error;
  }
}

async function update(id, name) {
  const category = await getById(id);
  const cleanName = validateName(name);
  try {
    await categoryRepository.update(category.id, cleanName);
    return categoryRepository.findById(category.id);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new AppError('Ya existe una categoría con ese nombre', 409);
    }
    throw error;
  }
}

async function remove(id) {
  const categoryId = parseId(id);
  try {
    const affected = await categoryRepository.remove(categoryId);
    if (affected === 0) {
      throw new AppError('Categoría no encontrada', 404);
    }
  } catch (error) {
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      throw new AppError('No se puede borrar: la categoría tiene productos', 409);
    }
    throw error;
  }
}

module.exports = { getAll, getById, create, update, remove };