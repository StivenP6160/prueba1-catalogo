const productRepository = require('../repositories/productRepository');
const AppError = require('../utils/AppError');
const { parseId, parsePositiveInt, parseOptionalNumber } = require('../utils/validators');

const MAX_LIMIT = 100;

async function list(query) {
  const page = parsePositiveInt(query.page, 1, 'page');
  const limit = Math.min(parsePositiveInt(query.limit, 10, 'limit'), MAX_LIMIT);

  const filters = {
    categoryId: query.category !== undefined ? parseId(query.category, 'category') : undefined,
    minPrice: parseOptionalNumber(query.minPrice, 'minPrice'),
    maxPrice: parseOptionalNumber(query.maxPrice, 'maxPrice'),
    search: typeof query.search === 'string' && query.search.trim() !== ''
      ? query.search.trim()
      : undefined,
  };

  if (
    filters.minPrice !== undefined &&
    filters.maxPrice !== undefined &&
    filters.minPrice > filters.maxPrice
  ) {
    throw new AppError('minPrice no puede ser mayor que maxPrice', 400);
  }

  const offset = (page - 1) * limit;

  const [data, total] = await Promise.all([
    productRepository.findAll(filters, { limit, offset, sort: query.sort }),
    productRepository.count(filters),
  ]);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

async function getById(id) {
  const product = await productRepository.findById(parseId(id));
  if (!product || !product.is_active) {
    throw new AppError('Producto no encontrado', 404);
  }
  return product;
}

module.exports = { list, getById };