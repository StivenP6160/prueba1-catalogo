const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/db');
const { seedDatabase } = require('./helpers/database');

beforeEach(async () => {
  await seedDatabase();
});

afterAll(async () => {
  await pool.end();
});

describe('GET /health', () => {
  test('responde ok cuando la base está conectada', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('GET /api/categories', () => {
  test('devuelve las 3 categorías del seed', async () => {
    const res = await request(app).get('/api/categories');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(3);
  });

  test('devuelve 404 si la categoría no existe', async () => {
    const res = await request(app).get('/api/categories/999');

    expect(res.status).toBe(404);
    expect(res.body.error.message).toBe('Categoría no encontrada');
  });

  test('devuelve 400 si el id no es un número', async () => {
    const res = await request(app).get('/api/categories/abc');

    expect(res.status).toBe(400);
  });
});

describe('POST /api/categories', () => {
  test('crea una categoría válida', async () => {
    const res = await request(app)
      .post('/api/categories')
      .send({ name: 'Gorras' });

    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({ id: 4, name: 'Gorras' });
  });

  test('quita los espacios del nombre', async () => {
    const res = await request(app)
      .post('/api/categories')
      .send({ name: '   Gorras   ' });

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('Gorras');
  });

  test('devuelve 409 si el nombre ya existe', async () => {
    const res = await request(app)
      .post('/api/categories')
      .send({ name: 'Camisetas' });

    expect(res.status).toBe(409);
  });

  test('devuelve 400 si no se envía el nombre', async () => {
    const res = await request(app).post('/api/categories').send({});

    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/categories/:id', () => {
  test('devuelve 409 si la categoría tiene productos', async () => {
    const res = await request(app).delete('/api/categories/1');

    expect(res.status).toBe(409);
  });

  test('borra una categoría sin productos', async () => {
    const created = await request(app).post('/api/categories').send({ name: 'Gorras' });

    const res = await request(app).delete(`/api/categories/${created.body.data.id}`);

    expect(res.status).toBe(204);
  });
});

describe('PUT /api/categories/:id', () => {
  test('actualiza el nombre', async () => {
    const res = await request(app).put('/api/categories/1').send({ name: 'Camisetas y polos' });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Camisetas y polos');
  });

  test('devuelve 409 si el nombre ya lo tiene otra categoría', async () => {
    const res = await request(app).put('/api/categories/1').send({ name: 'Calzado' });

    expect(res.status).toBe(409);
  });

  test('devuelve 404 si la categoría no existe', async () => {
    const res = await request(app).put('/api/categories/999').send({ name: 'Lo que sea' });

    expect(res.status).toBe(404);
  });
});
