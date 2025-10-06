const request = require('supertest');
const express = require('express');
const questionRouter = require('../../src/backend/routes/questionRoutes');

const app = express();
app.use(express.json());
app.use('/api/questions', questionRouter);

describe('API /api/questions', () => {
  test('POST /generate devuelve texto recibido', async () => {
    const res = await request(app)
      .post('/api/questions/generate')
      .send({ text: 'Texto de ejemplo' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual(
      expect.objectContaining({
        message: expect.any(String),
        text: 'Texto de ejemplo'
      })
    );
  });

  test('POST /generate sin texto -> 400', async () => {
    const res = await request(app).post('/api/questions/generate').send({});
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});