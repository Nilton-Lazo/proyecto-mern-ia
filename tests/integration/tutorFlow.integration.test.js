const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const aiRouter = require('../../src/backend/routes/ia');
const Question = require('../../src/backend/models/Question');
const Answer = require('../../src/backend/models/Answer');

let app;
let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  app = express();
  app.use(express.json());
  app.use('/api/ai', aiRouter);
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe('🔗 Flujo completo Tutor Virtual', () => {
  test('Generar preguntas → responder → obtener feedback → reporte final', async () => {
    const qRes = await request(app)
      .post('/api/ai/questions')
      .send({ text: 'La inteligencia artificial busca simular el razonamiento humano.' });
    expect(qRes.status).toBe(200);
    expect(qRes.body.data).toBeDefined();

    const firstQuestion = qRes.body.data.questions[0];

    const fbRes = await request(app)
      .post('/api/ai/feedback')
      .send({
        text: 'Texto prueba',
        question: firstQuestion,
        answer: 'Una máquina'
      });
    expect(fbRes.status).toBe(200);
    expect(fbRes.body.feedback).toBeDefined();

    const report = await request(app).get('/api/ai/reports');
    expect(report.status).toBe(200);
    expect(report.body).toHaveProperty('total');
  });
});
