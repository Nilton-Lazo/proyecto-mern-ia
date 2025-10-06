const request = require('supertest');
const express = require('express');

// === MOCKS ===
jest.mock('ollama', () => ({
  Ollama: jest.fn().mockImplementation(() => ({
    generate: jest.fn(({ prompt }) =>
      Promise.resolve({ response: `Respuesta generada para: ${prompt.slice(0, 15)}...` })
    )
  }))
}),{ virtual: true });

jest.mock('../../src/backend/models/Question', () => ({
  create: jest.fn().mockResolvedValue({
    _id: 'q1',
    text: 'Texto demo',
    questions: ['¿Qué es IA?', '¿Cómo funciona?']
  })
}));

jest.mock('../../src/backend/models/Answer', () => ({
  create: jest.fn().mockResolvedValue({
    _id: 'a1',
    text: 'Texto demo',
    question: '¿Qué es IA?',
    answer: 'Una máquina',
    feedback: 'CORRECTA',
    createdAt: new Date()
  }),
  find: jest.fn().mockReturnValue({
    lean: jest.fn().mockResolvedValue([
      { feedback: 'CORRECTA', createdAt: new Date() },
      { feedback: 'INCORRECTA', createdAt: new Date() },
      { feedback: 'PARCIAL', createdAt: new Date() }
    ])
  })
}));

jest.mock('pdfkit', () => jest.fn().mockImplementation(() => ({
    pipe: jest.fn(),
    text: jest.fn().mockReturnThis(),
    fillColor: jest.fn().mockReturnThis(),
    fontSize: jest.fn().mockReturnThis(),
    list: jest.fn().mockReturnThis(),
    moveDown: jest.fn().mockReturnThis(),
    moveTo: jest.fn().mockReturnThis(),
    lineTo: jest.fn().mockReturnThis(),
    strokeColor: jest.fn().mockReturnThis(),
    stroke: jest.fn().mockReturnThis(),
    end: jest.fn()
})));

// === APP ===
const aiRouter = require('../../src/backend/routes/ia');
const app = express();
app.use(express.json());
app.use('/api/ai', aiRouter);

describe('API /api/ai', () => {
  test('POST /chat responde con texto generado', async () => {
    const res = await request(app).post('/api/ai/chat').send({ prompt: 'Hola IA' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('ok', true);
    expect(res.body).toHaveProperty('answer');
  });

  test('POST /chat sin prompt -> 400', async () => {
    const res = await request(app).post('/api/ai/chat').send({});
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('POST /questions guarda texto y devuelve data', async () => {
    const res = await request(app).post('/api/ai/questions').send({ text: 'Texto de prueba' });
    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(res.body.message).toMatch(/guardados/);
  });

  test('POST /feedback genera retroalimentación', async () => {
    const res = await request(app)
      .post('/api/ai/feedback')
      .send({
        text: 'Texto',
        question: '¿Qué es IA?',
        answer: 'Una máquina'
      });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('feedback');
  });

  test('GET /reports devuelve resumen', async () => {
    const res = await request(app).get('/api/ai/reports');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('total');
    expect(res.body).toHaveProperty('correctas');
  });

    test('GET /informe devuelve PDF', async () => {
        await request(app)
        .get('/api/ai/informe')
        .expect(200)
        .expect('content-type', /pdf/);
    });

});