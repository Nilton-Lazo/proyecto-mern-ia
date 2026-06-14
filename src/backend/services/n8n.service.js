const aiService = require('./aiService');
const { createWorkflowLog } = require('./automation.service');

const TIMEOUT_MS = Number(process.env.N8N_WEBHOOK_TIMEOUT_MS || 15000);

function isConfigured(url) {
  return typeof url === 'string' && url.trim().length > 0;
}

async function postWebhook(url, payload, workflowName) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    const text = await res.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = { raw: text };
    }

    if (!res.ok) {
      const err = new Error(data?.error || data?.message || `n8n respondió ${res.status}`);
      err.status = res.status;
      err.data = data;
      throw err;
    }

    await createWorkflowLog({
      workflowName,
      eventType: 'webhook_call',
      status: 'success',
      payload,
      response: data,
    }).catch(() => {});

    return { ok: true, data, source: 'n8n' };
  } catch (err) {
    await createWorkflowLog({
      workflowName,
      eventType: 'webhook_call',
      status: 'failed',
      payload,
      errorMessage: err.message,
    }).catch(() => {});

    return { ok: false, error: err.message, source: 'n8n' };
  } finally {
    clearTimeout(timer);
  }
}

function mapN8nQuestions(raw) {
  if (!Array.isArray(raw)) return null;
  const mapped = raw.map((q, i) => {
    if (typeof q === 'string') {
      return { questionText: q.trim(), type: 'literal', order: i + 1 };
    }
    const typeMap = {
      comprension_literal: 'literal',
      literal: 'literal',
      inferencial: 'inferential',
      comprension_inferencial: 'inferential',
      inferential: 'inferential',
      critical: 'critical',
      pensamiento_critico: 'critical',
      vocabulary: 'vocabulary',
      vocabulario: 'vocabulary',
      main_idea: 'main_idea',
      idea_principal: 'main_idea',
    };
    const skill = q.skill || q.type || 'literal';
    return {
      questionText: String(q.text || q.questionText || '').trim(),
      type: typeMap[skill] || skill,
      order: i + 1,
      difficulty: q.difficulty || 'media',
    };
  }).filter((q) => q.questionText);

  return mapped.length >= 5 ? mapped : null;
}

function mapN8nBiases(data) {
  if (!data) return [];
  if (Array.isArray(data.biases)) return data.biases;
  if (Array.isArray(data.tags)) return data.tags.map((t) => (typeof t === 'string' ? { label: t } : t));
  return [];
}

async function triggerActivityAssigned(payload = {}) {
  const url = process.env.N8N_ACTIVITY_ASSIGNED_WEBHOOK_URL;
  const workflow = 'activity-assigned-notification';

  if (!isConfigured(url)) {
    return {
      success: false,
      message: 'No se pudo enviar el evento a n8n',
      error: 'N8N_ACTIVITY_ASSIGNED_WEBHOOK_URL no configurada',
    };
  }

  const body = {
    event: 'activity_assigned',
    activityId: payload.activityId,
    title: payload.title,
    area: payload.area,
    topic: payload.topic,
    dueDate: payload.dueDate ?? null,
    teacherName: payload.teacherName,
    students: payload.students || [],
    timestamp: payload.timestamp || new Date().toISOString(),
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    const text = await res.text();
    let n8nResponse = null;
    try {
      n8nResponse = text ? JSON.parse(text) : null;
    } catch {
      n8nResponse = text ? { raw: text } : null;
    }

    if (!res.ok) {
      const errorMsg = n8nResponse?.error || n8nResponse?.message || `n8n respondió ${res.status}`;
      await logWorkflowExecution({
        workflowName: workflow,
        eventType: 'activity_assigned',
        status: 'failed',
        payload: body,
        response: n8nResponse,
        errorMessage: errorMsg,
        activityId: payload.activityId || null,
        teacherId: payload.teacherId || null,
      }).catch(() => {});

      return {
        success: false,
        message: 'No se pudo enviar el evento a n8n',
        error: errorMsg,
        webhookUrl: url,
      };
    }

    await logWorkflowExecution({
      workflowName: workflow,
      eventType: 'activity_assigned',
      status: 'success',
      payload: body,
      response: n8nResponse,
      activityId: payload.activityId || null,
      teacherId: payload.teacherId || null,
    }).catch(() => {});

    return {
      success: true,
      message: 'Evento enviado correctamente a n8n',
      workflow,
      webhookUrl: url,
      n8nResponse,
    };
  } catch (err) {
    const errorMsg =
      err.name === 'AbortError'
        ? `Timeout después de ${TIMEOUT_MS}ms — verifica que n8n esté corriendo`
        : err.message;

    await logWorkflowExecution({
      workflowName: workflow,
      eventType: 'activity_assigned',
      status: 'failed',
      payload: body,
      errorMessage: errorMsg,
      activityId: payload.activityId || null,
      teacherId: payload.teacherId || null,
    }).catch(() => {});

    return {
      success: false,
      message: 'No se pudo enviar el evento a n8n',
      error: errorMsg,
      webhookUrl: url,
    };
  } finally {
    clearTimeout(timer);
  }
}

function buildTestActivityAssignedPayload() {
  return {
    event: 'activity_assigned',
    activityId: 'test-activity-001',
    title: 'Lectura de prueba desde backend',
    area: 'Comunicación',
    topic: 'Comprensión lectora',
    dueDate: '2026-06-20',
    teacherName: 'Docente de prueba',
    students: [
      {
        id: 'test-student-001',
        name: 'Estudiante de prueba',
        email: 'estudiante@example.com',
      },
    ],
    timestamp: new Date().toISOString(),
  };
}

async function testActivityAssignedConnection() {
  return triggerActivityAssigned(buildTestActivityAssignedPayload());
}

async function triggerReadingReminder(payload = {}) {
  const url = process.env.N8N_READING_REMINDER_WEBHOOK_URL;
  if (!isConfigured(url)) {
    return { ok: false, skipped: true, reason: 'N8N_READING_REMINDER_WEBHOOK_URL no configurada' };
  }
  return postWebhook(url, payload, 'reading-reminder');
}

async function triggerGenerateQuestions(payload) {
  const url = process.env.N8N_GENERATE_QUESTIONS_WEBHOOK_URL;
  if (!isConfigured(url)) {
    return { ok: false, skipped: true, reason: 'N8N_GENERATE_QUESTIONS_WEBHOOK_URL no configurada' };
  }

  const result = await postWebhook(url, payload, 'generate-questions');
  if (!result.ok) return result;

  const questions = mapN8nQuestions(
    result.data?.questions || result.data?.body?.questions || result.data
  );
  if (questions) {
    return { ok: true, questions, source: 'n8n' };
  }
  return { ok: false, error: 'Respuesta n8n sin preguntas válidas', source: 'n8n' };
}

async function triggerDetectBiases(payload) {
  const url = process.env.N8N_DETECT_BIASES_WEBHOOK_URL;
  if (!isConfigured(url)) {
    return { ok: false, skipped: true, reason: 'N8N_DETECT_BIASES_WEBHOOK_URL no configurada' };
  }

  const result = await postWebhook(url, payload, 'detect-biases');
  if (!result.ok) return result;

  const biases = mapN8nBiases(result.data?.body || result.data);
  const tags = biases.map((b) => (typeof b === 'string' ? b : b.label)).filter(Boolean);
  return { ok: true, biases, tags, source: 'n8n' };
}

/**
 * Genera preguntas: n8n si está configurado, fallback a aiService.
 */
async function generateQuestionsWithFallback(payload) {
  const n8n = await triggerGenerateQuestions(payload);
  if (n8n.ok && n8n.questions) return n8n;

  try {
    const questions = await aiService.generateTypedQuestions(payload.text);
    return { ok: true, questions, source: 'backend', n8nSkipped: n8n.skipped, n8nError: n8n.error };
  } catch (err) {
    return {
      ok: false,
      error: n8n.error || err.message || 'No fue posible generar preguntas',
      source: 'none',
    };
  }
}

/**
 * Detecta sesgos: n8n si está configurado, fallback a no bloquear (array vacío).
 * Para fallback completo el caller puede usar /api/ai/biases directamente.
 */
async function detectBiasesWithFallback(payload) {
  const n8n = await triggerDetectBiases(payload);
  if (n8n.ok) return n8n;

  return {
    ok: true,
    biases: [],
    tags: [],
    source: 'fallback',
    n8nSkipped: n8n.skipped,
    n8nError: n8n.error,
  };
}

async function logWorkflowExecution(data) {
  return createWorkflowLog(data);
}

async function testN8nConnection() {
  const webhookUrl = process.env.N8N_TEST_WEBHOOK_URL;
  if (!isConfigured(webhookUrl)) {
    return {
      success: false,
      message: 'No se pudo conectar con n8n',
      error: 'N8N_TEST_WEBHOOK_URL no está configurada en .env',
    };
  }

  const payload = {
    source: 'backend',
    event: 'test_connection',
    message: 'Probando conexión backend con n8n',
    timestamp: new Date().toISOString(),
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    const text = await res.text();
    let n8nResponse = null;
    try {
      n8nResponse = text ? JSON.parse(text) : null;
    } catch {
      n8nResponse = text ? { raw: text } : null;
    }

    if (!res.ok) {
      const errorMsg = n8nResponse?.error || n8nResponse?.message || `n8n respondió ${res.status}`;
      await logWorkflowExecution({
        workflowName: 'test-n8n',
        eventType: 'test_connection',
        status: 'failed',
        payload,
        response: n8nResponse,
        errorMessage: errorMsg,
      }).catch(() => {});

      return {
        success: false,
        message: 'No se pudo conectar con n8n',
        error: errorMsg,
        webhookUrl,
      };
    }

    await logWorkflowExecution({
      workflowName: 'test-n8n',
      eventType: 'test_connection',
      status: 'success',
      payload,
      response: n8nResponse,
    }).catch(() => {});

    return {
      success: true,
      message: 'Conexión con n8n exitosa',
      webhookUrl,
      n8nResponse,
    };
  } catch (err) {
    const errorMsg =
      err.name === 'AbortError'
        ? `Timeout después de ${TIMEOUT_MS}ms — verifica que n8n esté corriendo`
        : err.message;

    await logWorkflowExecution({
      workflowName: 'test-n8n',
      eventType: 'test_connection',
      status: 'failed',
      payload,
      errorMessage: errorMsg,
    }).catch(() => {});

    return {
      success: false,
      message: 'No se pudo conectar con n8n',
      error: errorMsg,
      webhookUrl,
    };
  } finally {
    clearTimeout(timer);
  }
}

async function testWebhookConnection() {
  const configured = {
    generateQuestions: isConfigured(process.env.N8N_GENERATE_QUESTIONS_WEBHOOK_URL),
    detectBiases: isConfigured(process.env.N8N_DETECT_BIASES_WEBHOOK_URL),
    activityAssigned: isConfigured(process.env.N8N_ACTIVITY_ASSIGNED_WEBHOOK_URL),
    readingReminder: isConfigured(process.env.N8N_READING_REMINDER_WEBHOOK_URL),
  };

  return {
    ok: true,
    n8nBaseUrl: process.env.N8N_BASE_URL || null,
    configured,
    apiKeySet: !!(process.env.N8N_INTERNAL_API_KEY && process.env.N8N_INTERNAL_API_KEY !== 'change_me'),
  };
}

module.exports = {
  triggerActivityAssigned,
  testActivityAssignedConnection,
  buildTestActivityAssignedPayload,
  triggerReadingReminder,
  triggerGenerateQuestions,
  triggerDetectBiases,
  generateQuestionsWithFallback,
  detectBiasesWithFallback,
  logWorkflowExecution,
  testN8nConnection,
  testWebhookConnection,
  mapN8nQuestions,
  mapN8nBiases,
};
