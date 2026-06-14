const mongoose = require('mongoose');
const { Schema, Types } = mongoose;

const NotificationSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    message: { type: String, default: '', trim: true },
    type: {
      type: String,
      enum: ['activity_assigned', 'reminder', 'report', 'system'],
      default: 'system',
    },
    activityId: { type: Types.ObjectId, ref: 'Activity', default: null },
    read: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index(
  { userId: 1, activityId: 1, type: 1 },
  { unique: true, partialFilterExpression: { activityId: { $type: 'objectId' } } }
);

module.exports = mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
