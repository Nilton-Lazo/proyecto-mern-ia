const automationService = require('../services/automation.service');
const n8nService = require('../services/n8n.service');

async function getPendingActivities(req, res) {
  try {
    const daysAhead = Number(req.query.daysAhead) || 3;
    const activities = await automationService.getPendingActivities({ daysAhead });
    res.json({ ok: true, count: activities.length, activities });
  } catch (err) {
    console.error('automation/pending-activities:', err);
    res.status(500).json({ error: 'No se pudieron obtener actividades pendientes' });
  }
}

async function postWorkflowLog(req, res) {
  try {
    const {
      workflowName,
      eventType,
      status,
      payload,
      response,
      errorMessage,
      activityId,
      studentId,
      teacherId,
      executedAt,
    } = req.body || {};

    if (!workflowName?.trim()) {
      return res.status(400).json({ error: 'workflowName es requerido' });
    }

    const log = await automationService.createWorkflowLog({
      workflowName: workflowName.trim(),
      eventType,
      status,
      payload,
      response,
      errorMessage,
      activityId,
      studentId,
      teacherId,
      executedAt,
    });

    res.status(201).json({ ok: true, logId: log._id });
  } catch (err) {
    console.error('automation/workflow-log:', err);
    res.status(500).json({ error: 'No se pudo guardar el log' });
  }
}

async function getTeacherWeeklySummary(req, res) {
  try {
    const teacherId = req.query.teacherId || null;
    const summaries = await automationService.getTeacherWeeklySummary(teacherId);
    res.json({ ok: true, count: summaries.length, summaries });
  } catch (err) {
    console.error('automation/teacher-weekly-summary:', err);
    res.status(500).json({ error: 'No se pudo generar el resumen semanal' });
  }
}

async function getWorkflowLogs(req, res) {
  try {
    const limit = Number(req.query.limit) || 50;
    const workflowName = req.query.workflowName;
    const logs = await automationService.listWorkflowLogs({ limit, workflowName });
    res.json({ ok: true, count: logs.length, logs });
  } catch (err) {
    console.error('automation/workflow-logs:', err);
    res.status(500).json({ error: 'No se pudieron listar los logs' });
  }
}

async function triggerActivityAssigned(req, res) {
  try {
    const payload = req.body;
    if (!payload?.activityId || !payload?.students?.length) {
      return res.status(400).json({ error: 'Se requiere activityId y students[]' });
    }
    const result = await n8nService.triggerActivityAssigned(payload);
    res.json({ success: result.success, ...result });
  } catch (err) {
    console.error('automation/trigger-activity-assigned:', err);
    res.status(500).json({ error: err.message });
  }
}

async function getTestActivityAssigned(req, res) {
  try {
    const result = await n8nService.testActivityAssignedConnection();
    if (result.success) {
      return res.json({
        success: true,
        message: 'Prueba enviada a n8n correctamente',
        data: result,
      });
    }
    return res.status(503).json({
      success: false,
      message:
        'No se pudo conectar con n8n. Verifica que n8n esté ejecutándose y que el workflow esté escuchando.',
      error: result.error,
    });
  } catch (err) {
    console.error('automation/test-activity-assigned:', err);
    res.status(500).json({
      success: false,
      message: 'Error interno al probar activity-assigned con n8n',
      error: err.message,
    });
  }
}

async function testWebhook(req, res) {
  try {
    const status = await n8nService.testWebhookConnection();
    res.json(status);
  } catch (err) {
    console.error('automation/test-webhook:', err);
    res.status(500).json({ error: err.message });
  }
}

async function getTestN8n(req, res) {
  try {
    const result = await n8nService.testN8nConnection();
    if (result.success) {
      return res.json({
        success: true,
        message: 'Backend conectado correctamente con n8n',
        data: {
          source: 'backend',
          event: 'test_connection',
          webhookUrl: result.webhookUrl,
          n8nResponse: result.n8nResponse,
        },
      });
    }
    return res.status(503).json({
      success: false,
      message:
        'No se pudo conectar con n8n. Verifica que n8n esté ejecutándose en http://localhost:5678',
      error: result.error,
    });
  } catch (err) {
    console.error('automation/test-n8n:', err);
    res.status(500).json({
      success: false,
      message: 'Error interno al probar conexión con n8n',
      error: err.message,
    });
  }
}

module.exports = {
  getPendingActivities,
  postWorkflowLog,
  getTeacherWeeklySummary,
  getWorkflowLogs,
  triggerActivityAssigned,
  testWebhook,
  getTestN8n,
  getTestActivityAssigned,
};
