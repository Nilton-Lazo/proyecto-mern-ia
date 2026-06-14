const originalFetch = global.fetch;

jest.mock('../../../src/backend/services/automation.service', () => ({
  createWorkflowLog: jest.fn().mockResolvedValue({ _id: 'log1' }),
}));

describe('n8n.service', () => {
  beforeEach(() => {
    jest.resetModules();
    global.fetch = jest.fn();
    process.env.N8N_INTERNAL_API_KEY = 'test-key';
    delete process.env.N8N_GENERATE_QUESTIONS_WEBHOOK_URL;
    delete process.env.N8N_DETECT_BIASES_WEBHOOK_URL;
    delete process.env.N8N_ACTIVITY_ASSIGNED_WEBHOOK_URL;
    delete process.env.N8N_READING_REMINDER_WEBHOOK_URL;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  test('triggerActivityAssigned retorna error si URL no configurada', async () => {
    delete process.env.N8N_ACTIVITY_ASSIGNED_WEBHOOK_URL;
    jest.resetModules();

    const n8nService = require('../../../src/backend/services/n8n.service');
    const result = await n8nService.triggerActivityAssigned({ activityId: 'a1', students: [] });

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/N8N_ACTIVITY_ASSIGNED_WEBHOOK_URL/);
  });

  test('triggerActivityAssigned llama webhook correctamente', async () => {
    process.env.N8N_ACTIVITY_ASSIGNED_WEBHOOK_URL = 'http://n8n.test/webhook-test/activity-assigned';
    jest.resetModules();

    global.fetch.mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ ok: true }),
    });

    const n8nService = require('../../../src/backend/services/n8n.service');
    const result = await n8nService.triggerActivityAssigned({
      activityId: 'a1',
      title: 'Test',
      area: 'Comunicación',
      students: [{ id: 's1', name: 'Alumno', email: 'a@test.com' }],
    });

    expect(result.success).toBe(true);
    expect(result.workflow).toBe('activity-assigned-notification');
    expect(global.fetch).toHaveBeenCalledWith(
      'http://n8n.test/webhook-test/activity-assigned',
      expect.objectContaining({ method: 'POST' })
    );
  });

  test('triggerActivityAssigned maneja error de conexión', async () => {
    process.env.N8N_ACTIVITY_ASSIGNED_WEBHOOK_URL = 'http://n8n.test/webhook-test/activity-assigned';
    jest.resetModules();

    global.fetch.mockRejectedValue(new Error('ECONNREFUSED'));

    const n8nService = require('../../../src/backend/services/n8n.service');
    const result = await n8nService.triggerActivityAssigned({
      activityId: 'a1',
      title: 'Test',
      students: [{ id: 's1', name: 'Alumno', email: 'a@test.com' }],
    });

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/ECONNREFUSED/);
  });

  test('triggerGenerateQuestions llama webhook correcto', async () => {
    process.env.N8N_GENERATE_QUESTIONS_WEBHOOK_URL = 'http://n8n.test/webhook/generate';
    jest.resetModules();

    global.fetch.mockResolvedValue({
      ok: true,
      text: async () =>
        JSON.stringify({
          questions: [
            { text: 'Q1?', type: 'literal', skill: 'comprension_literal' },
            { text: 'Q2?', type: 'inferential' },
            { text: 'Q3?', type: 'critical' },
            { text: 'Q4?', type: 'vocabulary' },
            { text: 'Q5?', type: 'main_idea' },
          ],
        }),
    });

    const n8nService = require('../../../src/backend/services/n8n.service');
    const result = await n8nService.triggerGenerateQuestions({ text: 'Hola', activityId: 'a1' });

    expect(global.fetch).toHaveBeenCalledWith(
      'http://n8n.test/webhook/generate',
      expect.objectContaining({ method: 'POST' })
    );
    expect(result.ok).toBe(true);
    expect(result.questions).toHaveLength(5);
  });

  test('triggerGenerateQuestions maneja error de conexión', async () => {
    process.env.N8N_GENERATE_QUESTIONS_WEBHOOK_URL = 'http://n8n.test/webhook/generate';
    jest.resetModules();

    global.fetch.mockRejectedValue(new Error('ECONNREFUSED'));

    const n8nService = require('../../../src/backend/services/n8n.service');
    const result = await n8nService.triggerGenerateQuestions({ text: 'Hola' });

    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/ECONNREFUSED/);
  });

  test('generateQuestionsWithFallback usa backend si n8n no configurado', async () => {
    jest.doMock('../../../src/backend/services/aiService', () => ({
      generateTypedQuestions: jest.fn().mockResolvedValue([
        { questionText: 'P1?', type: 'literal', order: 1 },
        { questionText: 'P2?', type: 'inferential', order: 2 },
        { questionText: 'P3?', type: 'critical', order: 3 },
        { questionText: 'P4?', type: 'vocabulary', order: 4 },
        { questionText: 'P5?', type: 'main_idea', order: 5 },
      ]),
    }));
    jest.resetModules();

    const n8nService = require('../../../src/backend/services/n8n.service');
    const result = await n8nService.generateQuestionsWithFallback({ text: 'Texto de prueba' });

    expect(result.ok).toBe(true);
    expect(result.source).toBe('backend');
    expect(result.questions).toHaveLength(5);
  });

  test('testWebhookConnection reporta URLs configuradas', async () => {
    process.env.N8N_GENERATE_QUESTIONS_WEBHOOK_URL = 'http://n8n.test/q';
    jest.resetModules();

    const n8nService = require('../../../src/backend/services/n8n.service');
    const status = await n8nService.testWebhookConnection();

    expect(status.configured.generateQuestions).toBe(true);
    expect(status.configured.activityAssigned).toBe(false);
  });

  test('testN8nConnection retorna error si falta N8N_TEST_WEBHOOK_URL', async () => {
    delete process.env.N8N_TEST_WEBHOOK_URL;
    jest.resetModules();

    const n8nService = require('../../../src/backend/services/n8n.service');
    const result = await n8nService.testN8nConnection();

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/N8N_TEST_WEBHOOK_URL/);
  });

  test('testN8nConnection maneja error si n8n no responde', async () => {
    process.env.N8N_TEST_WEBHOOK_URL = 'http://n8n.test/webhook-test/test-n8n';
    jest.resetModules();

    global.fetch.mockRejectedValue(new Error('ECONNREFUSED'));

    const n8nService = require('../../../src/backend/services/n8n.service');
    const result = await n8nService.testN8nConnection();

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/ECONNREFUSED/);
  });

  test('testN8nConnection procesa respuesta 200', async () => {
    process.env.N8N_TEST_WEBHOOK_URL = 'http://n8n.test/webhook-test/test-n8n';
    jest.resetModules();

    global.fetch.mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ ok: true, received: true }),
    });

    const n8nService = require('../../../src/backend/services/n8n.service');
    const result = await n8nService.testN8nConnection();

    expect(result.success).toBe(true);
    expect(result.message).toMatch(/exitosa/i);
    expect(result.n8nResponse).toEqual({ ok: true, received: true });
  });
});
