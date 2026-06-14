const request = require('supertest');
const express = require('express');

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
    req.user = {
      _id: 't1',
      role: 'teacher',
      nombres: 'Luis',
      apellidos: 'Mateo',
      email: 'luis@test.com',
    };
    next();
  })
);

jest.mock('../../../src/backend/middlewares/roles', () =>
  jest.fn(() => (_req, _res, next) => next())
);

jest.mock('../../../src/backend/models/Submission', () => ({ find: jest.fn() }));
jest.mock('../../../src/backend/models/Activity', () => ({ find: jest.fn() }));
jest.mock('../../../src/backend/models/User', () => ({ find: jest.fn() }));

const Submission = require('../../../src/backend/models/Submission');
const Activity = require('../../../src/backend/models/Activity');
const User = require('../../../src/backend/models/User');
const teacherReportsRouter = require('../../../src/backend/routes/teacherReports');

const app = express();
app.use(express.json());
app.use((req, _res, next) => {
  req.user = {
    _id: 't1',
    role: 'teacher',
    nombres: 'Luis',
    apellidos: 'Mateo',
    email: 'luis@test.com',
  };
  next();
});
app.use('/api/teacher/reports', teacherReportsRouter);

const sampleSub = {
  _id: 'sub1',
  student: { _id: 's1', nombres: 'Ana', apellidos: 'García', email: 'ana@test.com' },
  status: 'submitted',
  score: 80,
  progressPercent: 100,
  updatedAt: new Date().toISOString(),
  skillScores: { literal: 85, inferential: 55, critical: 70, vocabulary: 60, main_idea: 75 },
  questions: [{ questionText: '¿Quién?', type: 'literal' }],
  questionAnswers: [{ questionIndex: 0, answer: 'Juan', feedback: 'Correcta', isCorrect: 'correcta' }],
  activity: {
    _id: 'a1',
    title: 'Lectura grupal',
    area: 'Comunicación',
    topic: 'Argumentación',
    dueAt: null,
    assignees: ['s1'],
  },
};

describe('Rutas /api/teacher/reports', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Activity.find.mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue([
        {
          _id: 'a1',
          title: 'Lectura grupal',
          area: 'Comunicación',
          topic: 'Argumentación',
          assignees: ['s1'],
          dueAt: null,
          createdBy: 't1',
        },
      ]),
    });
    User.find.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue([
        { _id: 's1', nombres: 'Ana', apellidos: 'García', email: 'ana@test.com', role: 'student' },
      ]),
    });
    Submission.find.mockReturnValue(chainLean([sampleSub]));
  });

  test('GET /summary devuelve resumen del grupo', async () => {
    const res = await request(app).get('/api/teacher/reports/summary');
    expect(res.status).toBe(200);
    expect(res.body.summary).toEqual(expect.objectContaining({ totalStudents: 1, hasData: true }));
  });

  test('GET /skills devuelve habilidades del grupo', async () => {
    const res = await request(app).get('/api/teacher/reports/skills');
    expect(res.status).toBe(200);
    expect(res.body.skills).toEqual(expect.any(Array));
  });

  test('GET /students devuelve ranking con estado educativo', async () => {
    const res = await request(app).get('/api/teacher/reports/students');
    expect(res.status).toBe(200);
    expect(res.body.students[0]).toHaveProperty('statusLabel');
  });

  test('GET /alerts devuelve alertas pedagógicas', async () => {
    const res = await request(app).get('/api/teacher/reports/alerts');
    expect(res.status).toBe(200);
    expect(res.body.alerts).toEqual(expect.any(Array));
  });

  test('GET /activities-difficulty lista actividades difíciles', async () => {
    const res = await request(app).get('/api/teacher/reports/activities-difficulty');
    expect(res.status).toBe(200);
    expect(res.body.activities).toEqual(expect.any(Array));
  });
});
