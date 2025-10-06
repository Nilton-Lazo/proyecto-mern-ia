/**
 * Test de integración completa - Tutor virtual de lectura crítica 
 * ------------------------------------------------------
 * Este test valida el flujo principal del sistema:
 *  1. Generación de preguntas
 *  2. Envío de respuesta y retroalimentación
 *  3. Generación de reporte final
 * 
 * Se usa Jest + Supertest + MongoMemoryServer
 * para ejecutar pruebas aisladas en memoria.
 */

const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const aiRouter = require('../../src/backend/routes/ia');

// === Mocks de dependencias externas ===
jest.mock('ollama', () => ({
  Ollama: jest.fn().mockImplementation(() => ({
    generate: jest.fn().mockImplementation(({ prompt }) =>
      // Diferencia entre prompt de preguntas y de feedback
      prompt.includes('Analiza el siguiente ejercicio')
        ? Promise.resolve({ response: 'CORRECTA' })
        : Promise.resolve({
            response:
              '¿Qué es la IA?\n¿Cómo razona una máquina?\n¿Dónde se usa la IA?\n¿Cuáles son sus riesgos?\n¿Puede reemplazar al humano?'
          })
    )
  }))
}));

jest.mock('../../src/backend/models/Question', () => ({
  create: jest.fn().mockResolvedValue({
    _id: 'q1',
    text: 'Texto prueba',
    questions: ['¿Qué es la IA?', '¿Cómo razona una máquina?']
  })
}));

jest.mock('../../src/backend/models/Answer', () => ({
  create: jest.fn().mockResolvedValue({
    _id: 'a1',
    text: 'Texto prueba',
    question: '¿Qué es la IA?',
    answer: 'Una máquina',
    feedback: 'CORRECTA'
  }),
  find: jest.fn().mockReturnValue({
    lean: jest.fn().mockResolvedValue([
      { feedback: 'CORRECTA', createdAt: new Date() },
      { feedback: 'INCORRECTA', createdAt: new Date() },
      { feedback: 'PARCIAL', createdAt: new Date() }
    ])
  })
}));

// === Configuración del entorno de pruebas ===
let app;
let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, { dbName: 'testdb' });

  app = express();
  app.use(express.json());
  app.use('/api/ai', aiRouter);
});

afterAll(async () => {
  try {
    if (mongoose.connection && mongoose.connection.readyState !== 0) {
      const close = mongoose.connection.close || mongoose.disconnect;
      if (typeof close === 'function') {
        await close.call(mongoose.connection);
      }
    }
    if (mongoServer) await mongoServer.stop();
    await new Promise((r) => setTimeout(r, 50));
  } catch {
  }
});

// === Prueba de integración principal ===
describe('🔗 Flujo completo Tutor Virtual', () => {
  test('Generar preguntas → responder → obtener feedback → reporte final', async () => {
    // Generar preguntas
    const qRes = await request(app)
      .post('/api/ai/questions')
      .send({ text: 'La inteligencia artificial busca simular el razonamiento humano.' });

    expect(qRes.status).toBe(200);
    expect(qRes.body.data).toBeDefined();
    expect(Array.isArray(qRes.body.data.questions)).toBe(true);
    expect(qRes.body.data.questions.length).toBeGreaterThan(0);

    // Enviar respuesta y obtener feedback
    const firstQuestion = qRes.body.data.questions[0];
    const fbRes = await request(app)
      .post('/api/ai/feedback')
      .send({
        text: 'Texto prueba',
        question: firstQuestion,
        answer: 'Una máquina'
      });

    expect(fbRes.status).toBe(200);
    expect(fbRes.body.feedback).toBe('CORRECTA');

    // Consultar reporte final
    const report = await request(app).get('/api/ai/reports');
    expect(report.status).toBe(200);
    expect(report.body).toHaveProperty('total');
    expect(report.body).toHaveProperty('correctas');
    expect(report.body).toHaveProperty('incorrectas');
  });

  test('Debe retornar error 400 si falta el texto en la solicitud de preguntas', async () => {
    const res = await request(app).post('/api/ai/questions').send({});
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });  

  test('Debe retornar error 400 si falta el texto o respuesta en /feedback', async () => {
    const res = await request(app)
      .post('/api/ai/feedback')
      .send({ question: '¿Qué es la IA?' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
  
  test('Debe generar un informe PDF simulado en modo test', async () => {
    const res = await request(app).get('/api/ai/informe');
  
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('application/pdf');
    expect(res.text || res.body).toBeDefined();
  });

  test('Debe manejar error al generar preguntas (simulación)', async () => {
    jest.resetModules(); 
    jest.spyOn(console, 'error').mockImplementation(() => {});

    jest.doMock('ollama', () => ({
      Ollama: jest.fn().mockImplementation(() => ({
        generate: jest.fn().mockRejectedValue(new Error('Falla simulada')),
      })),
    }));

    const brokenRouter = require('../../src/backend/routes/ia');
    const brokenApp = express();
    brokenApp.use(express.json());
    brokenApp.use('/api/ai', brokenRouter);
  
    const res = await request(brokenApp)
      .post('/api/ai/questions')
      .send({ text: 'Texto para fallo' });
  
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
  
    jest.restoreAllMocks();
  });
  
});
