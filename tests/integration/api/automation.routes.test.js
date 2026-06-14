const request = require('supertest');
const express = require('express');

const mockCreate = jest.fn().mockResolvedValue({ _id: 'log1' });
const mockFind = jest.fn().mockReturnValue({
  sort: jest.fn().mockReturnValue({
    limit: jest.fn().mockReturnValue({
      lean: jest.fn().mockResolvedValue([]),
    }),
  }),
});

jest.mock('../../../src/backend/models/WorkflowLog', () => ({
  create: (...args) => mockCreate(...args),
  find: (...args) => mockFind(...args),
}));

jest.mock('../../../src/backend/models/Submission', () => ({
  find: jest.fn().mockReturnValue({
    populate: jest.fn().mockReturnThis(),
    lean: jest.fn().mockResolvedValue([]),
  }),
}));

jest.mock('../../../src/backend/models/Activity', () => ({
  find: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue([]) }),
  distinct: jest.fn().mockResolvedValue([]),
}));

jest.mock('../../../src/backend/models/User', () => ({
  findById: jest.fn().mockReturnValue({
    select: jest.fn().mockReturnValue({
      lean: jest.fn().mockResolvedValue(null),
    }),
  }),
}));

jest.mock('../../../src/backend/services/n8n.service', () => ({
  testN8nConnection: jest.fn(),
  testActivityAssignedConnection: jest.fn(),
  testWebhookConnection: jest.fn().mockResolvedValue({
    ok: true,
    configured: {},
    apiKeySet: true,
  }),
  triggerActivityAssigned: jest.fn(),
}));

const n8nService = require('../../../src/backend/services/n8n.service');
const automationRouter = require('../../../src/backend/routes/automation.routes');

const app = express();
app.use(express.json());
app.use('/api/automation', automationRouter);

describe('Rutas /api/automation', () => {
  const originalKey = process.env.N8N_INTERNAL_API_KEY;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.N8N_INTERNAL_API_KEY = 'test-automation-key';
  });

  afterAll(() => {
    process.env.N8N_INTERNAL_API_KEY = originalKey;
  });

  test('rechaza petición sin API key', async () => {
    const res = await request(app).get('/api/automation/pending-activities');
    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/API key/i);
  });

  test('rechaza API key inválida', async () => {
    const res = await request(app)
      .get('/api/automation/pending-activities')
      .set('x-n8n-api-key', 'wrong-key');
    expect(res.status).toBe(401);
  });

  test('GET /pending-activities responde con lista', async () => {
    const res = await request(app)
      .get('/api/automation/pending-activities')
      .set('x-n8n-api-key', 'test-automation-key');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(expect.objectContaining({ ok: true, activities: expect.any(Array) }));
  });

  test('POST /workflow-log guarda log', async () => {
    const res = await request(app)
      .post('/api/automation/workflow-log')
      .set('x-n8n-api-key', 'test-automation-key')
      .send({
        workflowName: 'reading-reminder-workflow',
        eventType: 'reading_reminder',
        status: 'success',
        payload: { message: 'Test' },
      });

    expect(res.status).toBe(201);
    expect(res.body.ok).toBe(true);
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ workflowName: 'reading-reminder-workflow', status: 'success' })
    );
  });

  test('POST /workflow-log requiere workflowName', async () => {
    const res = await request(app)
      .post('/api/automation/workflow-log')
      .set('x-n8n-api-key', 'test-automation-key')
      .send({ status: 'success' });

    expect(res.status).toBe(400);
  });

  test('GET /test-n8n responde sin API key', async () => {
    n8nService.testN8nConnection.mockResolvedValue({
      success: true,
      message: 'Conexión con n8n exitosa',
      webhookUrl: 'http://localhost:5678/webhook-test/test-n8n',
      n8nResponse: { ok: true },
    });

    const res = await request(app).get('/api/automation/test-n8n');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/Backend conectado/i);
    expect(res.body.data.event).toBe('test_connection');
  });

  test('GET /test-n8n responde error controlado si n8n falla', async () => {
    n8nService.testN8nConnection.mockResolvedValue({
      success: false,
      error: 'ECONNREFUSED',
    });

    const res = await request(app).get('/api/automation/test-n8n');

    expect(res.status).toBe(503);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('ECONNREFUSED');
  });

  test('GET /test-activity-assigned responde sin API key', async () => {
    n8nService.testActivityAssignedConnection.mockResolvedValue({
      success: true,
      message: 'Evento enviado correctamente a n8n',
      workflow: 'activity-assigned-notification',
      webhookUrl: 'http://localhost:5678/webhook-test/activity-assigned',
    });

    const res = await request(app).get('/api/automation/test-activity-assigned');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/Prueba enviada/i);
  });

  test('GET /test-activity-assigned responde error controlado si n8n falla', async () => {
    n8nService.testActivityAssignedConnection.mockResolvedValue({
      success: false,
      error: 'ECONNREFUSED',
    });

    const res = await request(app).get('/api/automation/test-activity-assigned');

    expect(res.status).toBe(503);
    expect(res.body.success).toBe(false);
  });

  test('POST /test-webhook responde estado de configuración', async () => {
    const res = await request(app)
      .post('/api/automation/test-webhook')
      .set('x-n8n-api-key', 'test-automation-key');

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.configured).toBeDefined();
  });
});
