const request = require('supertest');
const express = require('express');

const mockStudent = {
  _id: 's1',
  role: 'student',
  nombres: 'Ana',
  apellidos: 'García',
  email: 'ana@test.com',
};

function chainLean(data) {
  return {
    populate: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    lean: jest.fn().mockResolvedValue(data),
  };
}

jest.mock('../../../src/backend/middlewares/auth', () =>
  jest.fn((req, _res, next) => {
    req.user = mockStudent;
    next();
  })
);

jest.mock('../../../src/backend/middlewares/roles', () =>
  jest.fn(() => (_req, _res, next) => next())
);

jest.mock('../../../src/backend/models/Submission', () => ({
  find: jest.fn(),
}));

jest.mock('../../../src/backend/models/Activity', () => ({
  find: jest.fn(),
}));

jest.mock('../../../src/backend/models/User', () => ({
  find: jest.fn(),
}));

const Submission = require('../../../src/backend/models/Submission');
const studentRouter = require('../../../src/backend/routes/student');

const studentApp = express();
studentApp.use(express.json());
studentApp.use('/api/student', studentRouter);

const sampleSub = {
  _id: 'sub1',
  student: 's1',
  status: 'submitted',
  score: 80,
  progressPercent: 100,
  updatedAt: new Date().toISOString(),
  skillScores: { literal: 85, inferential: 55, critical: 70, vocabulary: 60, main_idea: 75 },
  questions: [
    { questionText: '¿Quién?', type: 'literal' },
    { questionText: '¿Por qué?', type: 'inferential' },
  ],
  questionAnswers: [
    { questionIndex: 0, answer: 'Juan', feedback: 'Correcta', isCorrect: 'correcta' },
    { questionIndex: 1, answer: 'Por el clima', feedback: 'Parcial', isCorrect: 'parcial' },
  ],
  activity: {
    _id: 'a1',
    title: 'Lectura 1',
    area: 'Comunicación',
    topic: 'Narrativa',
    dueAt: null,
    createdAt: new Date().toISOString(),
  },
};

describe('Rutas /api/student/reports', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    require('../../../src/backend/middlewares/auth').mockImplementation((req, _res, next) => {
      req.user = mockStudent;
      next();
    });
    Submission.find.mockReturnValue(chainLean([sampleSub]));
  });

  test('GET /summary devuelve resumen del estudiante', async () => {
    const res = await request(studentApp).get('/api/student/reports/summary');
    expect(res.status).toBe(200);
    expect(res.body.summary).toEqual(
      expect.objectContaining({
        assigned: 1,
        completed: 1,
        hasData: true,
      })
    );
  });

  test('GET /skills devuelve mapa de habilidades', async () => {
    const res = await request(studentApp).get('/api/student/reports/skills');
    expect(res.status).toBe(200);
    expect(res.body.skills).toEqual(expect.any(Array));
    expect(res.body.skills.length).toBeGreaterThan(0);
  });

  test('GET /areas devuelve desempeño por área', async () => {
    const res = await request(studentApp).get('/api/student/reports/areas');
    expect(res.status).toBe(200);
    expect(res.body.areas[0].area).toBe('Comunicación');
  });

  test('GET /timeline devuelve evolución', async () => {
    const res = await request(studentApp).get('/api/student/reports/timeline');
    expect(res.status).toBe(200);
    expect(res.body.timeline).toEqual(expect.any(Array));
  });

  test('GET /recent-feedback devuelve retroalimentación', async () => {
    const res = await request(studentApp).get('/api/student/reports/recent-feedback');
    expect(res.status).toBe(200);
    expect(res.body.feedback.length).toBeGreaterThan(0);
  });
});

