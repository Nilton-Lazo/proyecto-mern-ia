const mongoose = require('mongoose');
const { Schema, Types } = mongoose;

const ActivitySchema = new Schema({
    title:        { type: String, required: true, trim: true },
    instructions: { type: String, default: '' },
    text:         { type: String, required: true },            // cuerpo a leer
    dueAt:        { type: Date, default: null },
    assignees:    [{ type: Types.ObjectId, ref: 'User' }],     // alumnos
    createdBy:    { type: Types.ObjectId, ref: 'User', required: true }, // docente
}, { timestamps: true });

module.exports = mongoose.models.Activity || mongoose.model('Activity', ActivitySchema);