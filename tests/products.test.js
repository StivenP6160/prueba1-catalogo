const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/db');
const { seedDatabase } = require('./helpers/database');

function newProduct(overrides = {}) {
  return {
    sku: 'cal-004',
    name: 'Medias deportivas',
    description: 'Pack x3',
    price: 24900,
    stock: 30,
    category_id: 3,
    ...overrides,
  };
}

beforeEach(async () => {
  await seedDatabase();
});

afterAll(async () => {
  await pool.end();
});

describe('GET /api/products (listado)', () => {
  test('devuelve los 10 productos del seed con su paginación', async () => {
    const res = await request(app).get('/api/products');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(10);
    expect(res.body.pagination).toEqual({ page: 1, limit: 10, total: 10, totalPages: 1 });
  });

  test('pagina los resultados', async () => {
    const res = await request(app).get('/api/products').query({ limit: 3, page: 4 });

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.pagination).toMatchObject({ page: 4, totalPages: 4 });
  });

  test('no permite pedir más de 100 por página', async () => {
    const res = await request(app).get('/api/products').query({ limit: 500 });

    expect(res.body.pagination.limit).toBe(100);
  });

  test('filtra por categoría', async () => {
    const res = await request(app).get('/api/products').query({ category: 3 });

    expect(res.body.data).toHaveLength(3);
    expect(res.body.data.every((p) => p.category_name === 'Calzado')).toBe(true);
  });

  test('filtra por rango de precio', async () => {
    const res = await request(app)
      .get('/api/products')
      .query({ minPrice: 50000, maxPrice: 150000 });

    expect(res.body.data).toHaveLength(5);
    for (const product of res.body.data) {
      expect(product.price).toBeGreaterThanOrEqual(50000);
      expect(product.price).toBeLessThanOrEqual(150000);
    }
  });

  test('busca por nombre sin importar tildes ni mayúsculas', async () => {
    const res = await request(app).get('/api/products').query({ search: 'BASICA' });

    expect(res.body.data).toHaveLength(2);
  });

  test('ordena por precio de mayor a menor', async () => {
    const res = await request(app).get('/api/products').query({ sort: 'price_desc' });

    expect(res.body.data[0].sku).toBe('CAL-002');
  });

  test('no es vulnerable a inyección SQL en la búsqueda', async () => {
    const res = await request(app).get('/api/products').query({ search: "' OR '1'='1" });

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });

  test('devuelve 400 si page no es válido', async () => {
    const res = await request(app).get('/api/products').query({ page: 0 });

    expect(res.status).toBe(400);
  });

  test('devuelve 400 si minPrice es mayor que maxPrice', async () => {
    const res = await request(app)
      .get('/api/products')
      .query({ minPrice: 100000, maxPrice: 50000 });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/products/:id', () => {
  test('devuelve el producto con el nombre de su categoría', async () => {
    const res = await request(app).get('/api/products/1');

    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ sku: 'CAM-001', category_name: 'Camisetas' });
  });

  test('devuelve 404 si no existe', async () => {
    const res = await request(app).get('/api/products/999');

    expect(res.status).toBe(404);
  });
});

describe('POST /api/products', () => {
  test('crea un producto y guarda el sku en mayúsculas', async () => {
    const res = await request(app).post('/api/products').send(newProduct());

    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({ id: 11, sku: 'CAL-004', stock: 30 });
  });

  test('pone el stock en 0 si no se envía', async () => {
    const { stock, ...withoutStock } = newProduct();

    const res = await request(app).post('/api/products').send(withoutStock);

    expect(res.status).toBe(201);
    expect(res.body.data.stock).toBe(0);
  });

  test('devuelve 409 si el sku ya existe', async () => {
    const res = await request(app).post('/api/products').send(newProduct({ sku: 'CAM-001' }));

    expect(res.status).toBe(409);
  });

  test('devuelve 400 con un error por cada campo inválido', async () => {
    const res = await request(app).post('/api/products').send({
      sku: '',
      name: 'A',
      price: -100,
      stock: 2.5,
      category_id: 'tres',
    });

    expect(res.status).toBe(400);
    const fields = res.body.error.details.map((d) => d.field);
    expect(fields).toEqual(expect.arrayContaining(['sku', 'name', 'price', 'stock', 'category_id']));
  });

  test('devuelve 400 si la categoría no existe', async () => {
    const res = await request(app).post('/api/products').send(newProduct({ category_id: 999 }));

    expect(res.status).toBe(400);
    expect(res.body.error.message).toBe('La categoría indicada no existe');
  });

  test('rechaza campos que no están permitidos', async () => {
    const res = await request(app).post('/api/products').send(newProduct({ is_active: false }));

    expect(res.status).toBe(400);
  });
});

describe('PATCH /api/products/:id', () => {
  test('actualiza solo el precio sin tocar el stock', async () => {
    const res = await request(app).patch('/api/products/1').send({ price: 35900 });

    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ price: 35900, stock: 50 });
  });

  test('devuelve 400 si no se envía ningún campo', async () => {
    const res = await request(app).patch('/api/products/1').send({});

    expect(res.status).toBe(400);
  });

  test('devuelve 404 si el producto no existe', async () => {
    const res = await request(app).patch('/api/products/999').send({ price: 1000 });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/products/:id', () => {
  test('hace borrado lógico: deja de aparecer pero no se elimina la fila', async () => {
    const res = await request(app).delete('/api/products/1');
    expect(res.status).toBe(204);

    const detail = await request(app).get('/api/products/1');
    expect(detail.status).toBe(404);

    const list = await request(app).get('/api/products');
    expect(list.body.pagination.total).toBe(9);

    const [rows] = await pool.query('SELECT is_active FROM products WHERE id = 1');
    expect(rows[0].is_active).toBe(0);
  });

  test('devuelve 404 si ya estaba borrado', async () => {
    await request(app).delete('/api/products/1');

    const res = await request(app).delete('/api/products/1');

    expect(res.status).toBe(404);
  });
});