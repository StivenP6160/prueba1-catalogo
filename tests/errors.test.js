const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/db');

afterAll(async () => {
  await pool.end();
});

describe('Manejo de errores generales', () => {
  test('devuelve 404 en JSON si la ruta no existe', async () => {
    const res = await request(app).get('/api/categorias');

    expect(res.status).toBe(404);
    expect(res.body.error.message).toContain('Ruta no encontrada');
  });

  test('devuelve 400 si el JSON está mal escrito', async () => {
    const res = await request(app)
      .post('/api/categories')
      .set('Content-Type', 'application/json')
      .send('{ "name": ');

    expect(res.status).toBe(400);
    expect(res.body.error.message).toBe('El JSON enviado no es válido');
  });

  test('devuelve 500 sin mostrar detalles técnicos si la base falla', async () => {
    const querySpy = jest.spyOn(pool, 'query').mockRejectedValueOnce(new Error('Conexión perdida'));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const res = await request(app).get('/health');

    expect(res.status).toBe(500);
    expect(res.body.error.message).toBe('Error interno del servidor');
    expect(JSON.stringify(res.body)).not.toContain('Conexión perdida');

    querySpy.mockRestore();
    consoleSpy.mockRestore();
  });
});