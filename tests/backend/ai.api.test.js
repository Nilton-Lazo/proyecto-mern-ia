// tests/backend/ai.api.test.js
const request = require('supertest');
const express = require('express');

// === MOCK OLLAMA ===
jest.mock('ollama', () => ({
  Ollama: jest.fn().mockImplementation(() => ({
    generate: jest.fn(async ({ prompt }) => ({
      response: `MOCK_RESPONSE for: ${String(prompt).slice(0, 20)}`
    })),
  })),
}), { virtual: true });

// === MOCK PDFKIT ===
jest.mock('pdfkit', () => {
  return jest.fn().mockImplementation(() => {
    const api = {
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
      addPage: jest.fn().mockReturnThis(),
      end: jest.fn(),
    };
    return api;
  });
}, { virtual: true });

// === MOCKS MONGOOSE-LIKE PARA Question y Answer ===
const savedQuestions = [];
const savedAnswers = [];

// constructor tipo modelo para Question
const mockQuestionModel = function (data) {
  Object.assign(this, data);
};
mockQuestionModel.prototype.save = jest.fn(async function () {
  this._id = 'q_' + (savedQuestions.length + 1);
  savedQuestions.push(this);
  return this;
});

// constructor tipo modelo para Answer
const mockAnswerModel = function (data) {
  Object.assign(this, data);
};
mockAnswerModel.prototype.save = jest.fn(async function () {
  this._id = 'a_' + (savedAnswers.length + 1);
  this.createdAt = this.createdAt || new Date();
  savedAnswers.push(this);
  return this;
});
mockAnswerModel.find = jest.fn(async () => savedAnswers);

// registrar mocks de modelos
jest.mock('../../src/backend/models/Question', () => mockQuestionModel, { virtual: true });
jest.mock('../../src/backend/models/Answer', () => mockAnswerModel, { virtual: true });

// === APP EXPRESS CON RUTA REAL ===
const aiRouter = require('../../src/backend/routes/ai');
const app = express();
app.use(express.json());
app.use('/api/ai', aiRouter);

describe('API /api/ai', () => {
  beforeEach(() => {
    savedQuestions.length = 0;
    savedAnswers.length = 0;
  });

  test('POST /chat responde con texto generado', async () => {
    const res = await request(app)
      .post('/api/ai/chat')
      .send({ prompt: 'Hola IA' });

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(typeof res.body.answer).toBe('string');
  });

  test('POST /chat sin prompt -> 400', async () => {
    const res = await request(app)
      .post('/api/ai/chat')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('POST /questions guarda texto y devuelve data', async () => {
    const res = await request(app)
      .post('/api/ai/questions')
      .send({ text: 'Texto de prueba' });

    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.text).toBe('Texto de prueba');
    expect(Array.isArray(res.body.data.questions)).toBe(true);
    expect(savedQuestions.length).toBe(1);
  });

  test('POST /feedback genera retroalimentación y guarda Answer', async () => {
    const res = await request(app)
      .post('/api/ai/feedback')
      .send({
        text: 'Texto',
        question: '¿Qué es IA?',
        answer: 'Una máquina'
      });

    expect(res.status).toBe(200);
    expect(typeof res.body.feedback).toBe('string');
    expect(savedAnswers.length).toBe(1);
  });

  test('GET /reports devuelve resumen', async () => {
    // metemos un par de respuestas “preexistentes”
    savedAnswers.push(
      { feedback: 'CORRECTA', createdAt: new Date(), question: 'Q1', answer: 'A1' },
      { feedback: 'INCORRECTA', createdAt: new Date(), question: 'Q2', answer: 'A2' },
      { feedback: 'PARCIAL', createdAt: new Date(), question: 'Q3', answer: 'A3' }
    );

    const res = await request(app).get('/api/ai/reports');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('total', 3);
    expect(res.body).toHaveProperty('correctas');
    expect(res.body).toHaveProperty('incorrectas');
    expect(res.body).toHaveProperty('parciales');
  });
});