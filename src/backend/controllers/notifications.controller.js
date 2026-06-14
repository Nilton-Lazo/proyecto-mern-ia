const notificationService = require('../services/notification.service');

async function createBulk(req, res) {
  console.log('n8n solicitó creación de notificaciones');

  try {
    const { event, activityId, title, message, students } = req.body || {};

    const created = await notificationService.createBulkNotifications({
      event,
      activityId,
      title,
      message,
      students,
    });

    console.log(`notificaciones creadas correctamente (${created.length})`);

    return res.status(201).json({
      success: true,
      created: created.length,
      notifications: created.map((n) => ({
        id: n._id,
        userId: n.userId,
        title: n.title,
        type: n.type,
        activityId: n.activityId,
      })),
    });
  } catch (err) {
    const status = err.status || 500;
    console.warn('Error al crear notificaciones bulk:', err.message);
    return res.status(status).json({
      success: false,
      error: err.message || 'No se pudieron crear las notificaciones',
    });
  }
}

async function getMyNotifications(req, res) {
  try {
    const unreadOnly = req.query.unread === 'true';
    const notifications = await notificationService.getNotificationsForUser(req.user._id, {
      unreadOnly,
    });
    const unreadCount = await notificationService.countUnread(req.user._id);

    return res.json({
      success: true,
      unreadCount,
      notifications,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

async function markAsRead(req, res) {
  try {
    const notification = await notificationService.markNotificationRead(
      req.params.id,
      req.user._id
    );

    return res.json({ success: true, notification });
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({ success: false, error: err.message });
  }
}

module.exports = {
  createBulk,
  getMyNotifications,
  markAsRead,
};
