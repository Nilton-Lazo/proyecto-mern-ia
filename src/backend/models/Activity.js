const mongoose = require('mongoose');
const { Schema, Types } = mongoose;
const { DEFAULT_AREA } = require('../constants/curricularAreas');

const ActivitySchema = new Schema({
  title: { type: String, required: true, trim: true },
  area: { type: String, default: DEFAULT_AREA, trim: true },
  topic: { type: String, default: '', trim: true },
  instructions: { type: String, default: '' },
  text: { type: String, required: true },
  sourceType: { type: String, enum: ['text', 'pdf', 'markdown'], default: 'text' },
  originalFileName: { type: String, default: '' },
  dueAt: { type: Date, default: null },
  assignees: [{ type: Types.ObjectId, ref: 'User' }],
  createdBy: { type: Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.models.Activity || mongoose.model('Activity', ActivitySchema);
