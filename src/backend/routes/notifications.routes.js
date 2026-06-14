const express = require('express');
const n8nApiKeyRequired = require('../middlewares/n8nApiKey');
const authRequired = require('../middlewares/auth');
const requireRole = require('../middlewares/roles');
const controller = require('../controllers/notifications.controller');

const router = express.Router();

router.post('/bulk', n8nApiKeyRequired, controller.createBulk);

router.get('/me', authRequired, requireRole('student', 'admin'), controller.getMyNotifications);
router.patch('/:id/read', authRequired, requireRole('student', 'admin'), controller.markAsRead);

module.exports = router;
