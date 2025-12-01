// tests/backend/teacher.routes.test.js
const request = require('supertest');
const express = require('express');

// --- MOCKS DE MIDDLEWARES ---
jest.mock('../../src/backend/middlewares/auth', () =>
  jest.fn((req, res, next) => {
    // simulamos un docente autenticado
    req.user = {
      _id: 't1',
      role: 'teacher',
      email: 'profe@example.com',
      nombres: 'Joel',
      apellidos: 'Lazo',
    };
    next();
  })
);

jest.mock('../../src/backend/middlewares/roles', () =>
  // requireRole('teacher','admin') -> middleware que simplemente llama next()
  jest.fn(() => (req, res, next) => next())
);

// --- MOCKS DE MODELOS ---
jest.mock('../../src/backend/models/User', () => ({
  find: jest.fn(),
}));

jest.mock('../../src/backend/models/Activity', () => ({
  find: jest.fn(),
  create: jest.fn(),
}));

jest.mock('../../src/backend/models/Submission', () => ({
  insertMany: jest.fn(),
  aggregate: jest.fn(),
}));

// IMPORTS DESPUÉS DE LOS MOCKS
const teacherRouter = require('../../src/backend/routes/teacher');
const User = require('../../src/backend/models/User');
const Activity = require('../../src/backend/models/Activity');
const Submission = require('../../src/backend/models/Submission');

// App mínima para estas rutas
const app = express();
app.use(express.json());
app.use('/api/teacher', teacherRouter);

describe('Rutas /api/teacher', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('GET /students devuelve lista de estudiantes', async () => {
    // simulamos el chain: find().select().sort().lean()
    User.find.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue([
        {
          _id: 's1',
          nombres: 'Ana',
          apellidos: 'Pérez',
          email: 'ana@example.com',
        },
      ]),
    });

    const res = await request(app).get('/api/teacher/students');

    expect(res.status).toBe(200);
    expect(User.find).toHaveBeenCalledWith({ role: 'student' });
    expect(res.body.students).toHaveLength(1);
    expect(res.body.students[0]).toEqual(
      expect.objectContaining({ email: 'ana@example.com' })
    );
  });

  test('POST /activities responde 400 si faltan datos', async () => {
    const res = await request(app)
      .post('/api/teacher/activities')
      .send({
        title: 'Actividad sin datos',
        text: '',
        assignees: [], // vacío a propósito
      });

    expect(res.status).toBe(400);
    expect(Activity.create).not.toHaveBeenCalled();
  });

  test('POST /activities crea actividad y submissions', async () => {
    Activity.create.mockResolvedValue({
      _id: 'a1',
      title: 'Lectura 1',
      assignees: ['s1', 's2'],
    });
    Submission.insertMany.mockResolvedValue([]);

    const payload = {
      title: 'Lectura 1',
      instructions: 'Lee y responde',
      text: 'Texto de prueba',
      dueAt: null,
      assignees: ['s1', 's2'],
    };

    const res = await request(app)
      .post('/api/teacher/activities')
      .send(payload);

    expect(res.status).toBe(201);
    expect(Activity.create).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Lectura 1',
        text: 'Texto de prueba',
        assignees: ['s1', 's2'],
        createdBy: 't1', // viene del auth mock
      })
    );
    expect(Submission.insertMany).toHaveBeenCalled();
    expect(res.body).toEqual({ ok: true, activityId: 'a1' });
  });

  test('GET /activities/summary devuelve KPIs agregados', async () => {
    const fakeActs = [
      {
        _id: 'a1',
        title: 'Lectura 1',
        assignees: ['s1', 's2'],
        createdAt: new Date(),
      },
    ];

    Activity.find.mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(fakeActs),
    });

    Submission.aggregate.mockResolvedValue([
      {
        _id: 'a1',
        entregas: 1,
        avgProgress: 80,
        countSubs: 2,
      },
    ]);

    const res = await request(app).get('/api/teacher/activities/summary');

    expect(res.status).toBe(200);
    expect(Activity.find).toHaveBeenCalledWith({ createdBy: 't1' });
    expect(Submission.aggregate).toHaveBeenCalled();

    expect(res.body).toEqual(
      expect.objectContaining({
        countActivities: 1,
        countStudents: 2,
        avgProgress: 80,
        activities: expect.any(Array),
      })
    );
    expect(res.body.activities[0]).toEqual(
      expect.objectContaining({ titulo: 'Lectura 1' })
    );
  });
});