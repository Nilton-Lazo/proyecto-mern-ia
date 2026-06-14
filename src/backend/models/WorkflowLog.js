const mongoose = require('mongoose');
const { Schema, Types } = mongoose;

const WorkflowLogSchema = new Schema(
  {
    workflowName: { type: String, required: true, trim: true },
    eventType: { type: String, default: 'execution', trim: true },
    status: {
      type: String,
      enum: ['success', 'failed', 'pending'],
      default: 'pending',
    },
    payload: { type: Schema.Types.Mixed, default: null },
    response: { type: Schema.Types.Mixed, default: null },
    errorMessage: { type: String, default: '' },
    activityId: { type: Types.ObjectId, ref: 'Activity', default: null },
    studentId: { type: Types.ObjectId, ref: 'User', default: null },
    teacherId: { type: Types.ObjectId, ref: 'User', default: null },
    executedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

WorkflowLogSchema.index({ workflowName: 1, createdAt: -1 });
WorkflowLogSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.models.WorkflowLog || mongoose.model('WorkflowLog', WorkflowLogSchema);
