const express = require('express');
const n8nApiKeyRequired = require('../middlewares/n8nApiKey');
const controller = require('../controllers/automation.controller');

const router = express.Router();

// Público — pruebas de conexión backend → n8n (desarrollo/diagnóstico)
router.get('/test-n8n', controller.getTestN8n);
router.get('/test-activity-assigned', controller.getTestActivityAssigned);

// Endpoints internos — requieren x-n8n-api-key
router.use(n8nApiKeyRequired);

router.get('/pending-activities', controller.getPendingActivities);
router.post('/workflow-log', controller.postWorkflowLog);
router.get('/workflow-logs', controller.getWorkflowLogs);
router.get('/teacher-weekly-summary', controller.getTeacherWeeklySummary);
router.post('/trigger-activity-assigned', controller.triggerActivityAssigned);
router.post('/test-webhook', controller.testWebhook);

module.exports = router;
