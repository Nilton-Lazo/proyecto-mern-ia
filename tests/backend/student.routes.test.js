// tests/backend/student.routes.test.js
const request = require('supertest');
const express = require('express');

// --- MOCKS DE MIDDLEWARES ---
jest.mock('../../src/backend/middlewares/auth', () =>
  jest.fn((req, res, next) => {
    // simulamos un estudiante autenticado
    req.user = {
      _id: 's1',
      role: 'student',
      email: 'alumno@example.com',
      nombres: 'Steven',
      apellidos: 'Huaccho',
    };
    next();
  })
);

jest.mock('../../src/backend/middlewares/roles', () =>
  // requireRole('student','admin') -> middleware que solo pasa
  jest.fn(() => (req, res, next) => next())
);

// --- MOCKS DE MODELOS ---
jest.mock('../../src/backend/models/Activity', () => ({
  findById: jest.fn(),
}));

jest.mock('../../src/backend/models/Submission', () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  findOneAndUpdate: jest.fn(),
}));

// IMPORTS DESPUÉS DE LOS MOCKS
const studentRouter = require('../../src/backend/routes/student');
const Activity = require('../../src/backend/models/Activity');
const Submission = require('../../src/backend/models/Submission');

const app = express();
app.use(express.json());
app.use('/api/student', studentRouter);

describe('Rutas /api/student', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('GET /activities devuelve actividades asignadas al estudiante', async () => {
    Submission.find.mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue([
        {
          activity: {
            _id: 'a1',
            title: 'Lectura 1',
            dueAt: null,
            createdAt: new Date(),
          },
          progressPercent: 50,
          status: 'draft',
          updatedAt: new Date(),
        },
      ]),
    });

    const res = await request(app).get('/api/student/activities');

    expect(res.status).toBe(200);
    expect(Submission.find).toHaveBeenCalledWith({ student: 's1' });
    expect(res.body.activities).toHaveLength(1);
    expect(res.body.activities[0]).toEqual(
      expect.objectContaining({
        titulo: 'Lectura 1',
        progreso: expect.any(Number),
        status: 'draft',
        displayStatus: expect.any(String),
      })
    );
  });

  test('GET /activities/:id devuelve detalle cuando la actividad está asignada', async () => {
    const fakeActivity = {
      _id: 'a1',
      title: 'Lectura 1',
      instructions: 'Lee y responde',
      text: 'Texto de ejemplo',
      dueAt: null,
      assignees: ['s1'], // incluye al alumno
    };

    Activity.findById.mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(fakeActivity),
    });

    Submission.findOne.mockReturnValue({
      lean: jest.fn().mockResolvedValue({
        progressPercent: 60,
        status: 'draft',
        answer: 'Respuesta inicial',
      }),
    });

    const res = await request(app).get('/api/student/activities/a1');

    expect(res.status).toBe(200);
    expect(Activity.findById).toHaveBeenCalledWith('a1');
    expect(res.body).toEqual(
      expect.objectContaining({
        _id: 'a1',
        title: 'Lectura 1',
        progressPercent: expect.any(Number),
        status: 'draft',
        answer: 'Respuesta inicial',
        questions: expect.any(Array),
        displayStatus: expect.any(String),
      })
    );
  });

  test('GET /activities/:id responde 404 si la actividad no existe', async () => {
    Activity.findById.mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(null),
    });

    const res = await request(app).get('/api/student/activities/no-existe');

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  test('POST /progress guarda borrador de avance', async () => {
    const fakeActivity = {
      _id: 'a1',
      assignees: ['s1'], // asignada al alumno
    };

    Activity.findById.mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(fakeActivity),
    });

    Submission.findOneAndUpdate.mockResolvedValue({
      progressPercent: 75,
      status: 'draft',
    });

    const res = await request(app)
      .post('/api/student/progress')
      .send({
        activityId: 'a1',
        answer: 'Respuesta parcial',
        progressPercent: 75,
      });

    expect(res.status).toBe(200);
    expect(Activity.findById).toHaveBeenCalledWith('a1');
    expect(Submission.findOneAndUpdate).toHaveBeenCalled();
    expect(res.body).toEqual({ ok: true, progressPercent: 75 });
  });

  test('POST /activities/:id/autosave guarda borrador', async () => {
    const fakeActivity = { _id: 'a1', assignees: ['s1'] };
    Activity.findById.mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(fakeActivity),
    });

    const mockSub = {
      status: 'draft',
      questions: [{ questionText: 'Q1', type: 'literal' }],
      questionAnswers: [{ questionIndex: 0, answer: 'parcial' }],
      progressPercent: 0,
      save: jest.fn().mockResolvedValue(true),
    };
    Submission.findOne.mockResolvedValue(mockSub);

    const res = await request(app)
      .post('/api/student/activities/a1/autosave')
      .send({
        answers: [{ questionIndex: 0, answer: 'Mi respuesta' }],
        currentStep: 4,
      });

    expect(res.status).toBe(200);
    expect(res.body).toEqual(
      expect.objectContaining({ ok: true, progressPercent: expect.any(Number) })
    );
    expect(mockSub.save).toHaveBeenCalled();
  });

  test('GET /activities filtra por área', async () => {
    Submission.find.mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue([
        {
          activity: {
            _id: 'a1',
            title: 'Lectura Com',
            area: 'Comunicación',
            topic: 'Narrativo',
            dueAt: null,
            createdAt: new Date(),
            createdBy: { nombres: 'Luis', apellidos: 'P' },
          },
          progressPercent: 0,
          status: 'draft',
          updatedAt: new Date(),
        },
        {
          activity: {
            _id: 'a2',
            title: 'Lectura Mat',
            area: 'Matemática',
            topic: 'Fracciones',
            dueAt: null,
            createdAt: new Date(),
            createdBy: { nombres: 'Luis', apellidos: 'P' },
          },
          progressPercent: 50,
          status: 'draft',
          updatedAt: new Date(),
        },
      ]),
    });

    const res = await request(app).get('/api/student/activities?area=Matemática');

    expect(res.status).toBe(200);
    expect(res.body.activities).toHaveLength(1);
    expect(res.body.activities[0].area).toBe('Matemática');
    expect(res.body.groupedByArea).toBeDefined();
  });

  test('POST /submit cambia estado a submitted', async () => {
    const fakeActivity = {
      _id: 'a1',
      assignees: ['s1'],
    };

    Activity.findById.mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(fakeActivity),
    });

    Submission.findOneAndUpdate.mockResolvedValue({
      status: 'submitted',
      progressPercent: 100,
    });

    const res = await request(app)
      .post('/api/student/submit')
      .send({ activityId: 'a1' });

    expect(res.status).toBe(200);
    expect(Submission.findOneAndUpdate).toHaveBeenCalled();
    expect(res.body).toEqual({ ok: true, status: 'submitted' });
  });
});