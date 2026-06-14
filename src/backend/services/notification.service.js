const mongoose = require('mongoose');
const Notification = require('../models/Notification');

const EVENT_TYPE_MAP = {
  activity_assigned: 'activity_assigned',
  reminder: 'reminder',
  report: 'report',
};

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(String(id));
}

async function createBulkNotifications(payload = {}) {
  const { event, activityId, title, message, students } = payload;

  if (!Array.isArray(students) || students.length === 0) {
    const err = new Error('Se requiere al menos un estudiante en students[]');
    err.status = 400;
    throw err;
  }

  if (!title || !String(title).trim()) {
    const err = new Error('Se requiere title');
    err.status = 400;
    throw err;
  }

  const type = EVENT_TYPE_MAP[event] || 'system';
  const activityRef = activityId && isValidObjectId(activityId) ? activityId : null;

  const docs = [];
  for (const student of students) {
    const userId = student?.id || student?._id;
    if (!userId || !isValidObjectId(userId)) continue;

    if (activityRef) {
      const exists = await Notification.findOne({
        userId,
        activityId: activityRef,
        type,
      }).lean();
      if (exists) continue;
    }

    docs.push({
      userId,
      title: String(title).trim(),
      message: message ? String(message).trim() : '',
      type,
      activityId: activityRef,
      read: false,
    });
  }

  if (!docs.length) {
    return [];
  }

  const created = await Notification.insertMany(docs, { ordered: false });
  return created;
}

async function getNotificationsForUser(userId, { limit = 30, unreadOnly = false } = {}) {
  const filter = { userId };
  if (unreadOnly) filter.read = false;

  return Notification.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
}

async function markNotificationRead(notificationId, userId) {
  const doc = await Notification.findOneAndUpdate(
    { _id: notificationId, userId },
    { $set: { read: true } },
    { new: true }
  ).lean();

  if (!doc) {
    const err = new Error('Notificación no encontrada');
    err.status = 404;
    throw err;
  }

  return doc;
}

async function countUnread(userId) {
  return Notification.countDocuments({ userId, read: false });
}

module.exports = {
  createBulkNotifications,
  getNotificationsForUser,
  markNotificationRead,
  countUnread,
};
