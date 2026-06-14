const request = require('supertest');
const express = require('express');

const mockInsertMany = jest.fn();
const mockFindOne = jest.fn();
const mockFind = jest.fn();
const mockCountDocuments = jest.fn();
const mockFindOneAndUpdate = jest.fn();

jest.mock('../../../src/backend/models/Notification', () => ({
  insertMany: (...args) => mockInsertMany(...args),
  findOne: (...args) => mockFindOne(...args),
  find: (...args) => mockFind(...args),
  countDocuments: (...args) => mockCountDocuments(...args),
  findOneAndUpdate: (...args) => mockFindOneAndUpdate(...args),
}));

jest.mock('../../../src/backend/middlewares/auth', () => {
  return jest.fn((req, _res, next) => {
    req.user = { _id: 'student-001', role: 'student' };
    next();
  });
});

const notificationsRouter = require('../../../src/backend/routes/notifications.routes');

const app = express();
app.use(express.json());
app.use('/api/notifications', notificationsRouter);

describe('Rutas /api/notifications', () => {
  const originalKey = process.env.N8N_INTERNAL_API_KEY;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.N8N_INTERNAL_API_KEY = 'test-n8n-key';
    mockFindOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });
  });

  afterAll(() => {
    process.env.N8N_INTERNAL_API_KEY = originalKey;
  });

  describe('POST /bulk', () => {
    const validPayload = {
      event: 'activity_assigned',
      activityId: '674000000000000000000001',
      title: 'Nueva actividad asignada: Prueba',
      message: 'Área: Comunicación | Fecha límite: 2026-06-20',
      students: [
        { id: '674000000000000000000002', name: 'Ana', email: 'ana@test.com' },
      ],
    };

    test('rechaza petición sin API key', async () => {
      const res = await request(app).post('/api/notifications/bulk').send(validPayload);
      expect(res.status).toBe(401);
      expect(res.body.error).toMatch(/API key/i);
    });

    test('rechaza API key inválida', async () => {
      const res = await request(app)
        .post('/api/notifications/bulk')
        .set('x-n8n-api-key', 'wrong')
        .send(validPayload);
      expect(res.status).toBe(401);
    });

    test('crea notificaciones bulk con API key válida', async () => {
      mockInsertMany.mockResolvedValue([
        {
          _id: 'notif-1',
          userId: validPayload.students[0].id,
          title: validPayload.title,
          type: 'activity_assigned',
          activityId: validPayload.activityId,
        },
      ]);

      const res = await request(app)
        .post('/api/notifications/bulk')
        .set('x-n8n-api-key', 'test-n8n-key')
        .send(validPayload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.created).toBe(1);
      expect(mockInsertMany).toHaveBeenCalled();
    });

    test('valida students vacío', async () => {
      const res = await request(app)
        .post('/api/notifications/bulk')
        .set('x-n8n-api-key', 'test-n8n-key')
        .send({ ...validPayload, students: [] });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /me', () => {
    test('retorna notificaciones del usuario autenticado', async () => {
      mockFind.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue([
              { _id: 'n1', title: 'Test', read: false, type: 'activity_assigned' },
            ]),
          }),
        }),
      });
      mockCountDocuments.mockResolvedValue(1);

      const res = await request(app).get('/api/notifications/me');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.unreadCount).toBe(1);
      expect(res.body.notifications).toHaveLength(1);
    });
  });

  describe('PATCH /:id/read', () => {
    test('marca notificación como leída', async () => {
      mockFindOneAndUpdate.mockReturnValue({
        lean: jest.fn().mockResolvedValue({ _id: 'n1', read: true }),
      });

      const res = await request(app).patch('/api/notifications/n1/read');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.notification.read).toBe(true);
    });
  });
});
