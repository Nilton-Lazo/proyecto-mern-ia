const mongoose = require('mongoose');
const { Schema, Types } = mongoose;

const SubmissionSchema = new Schema({
    activity: { type: Types.ObjectId, ref: 'Activity', required: true },
    student:  { type: Types.ObjectId, ref: 'User', required: true },

    // lo mínimo para progreso: guarda respuesta libre o hitos
    answer:   { type: String, default: '' },

    progressPercent: { type: Number, default: 0 },       // 0..100
    status:   { type: String, enum: ['draft','submitted'], default: 'draft' },
}, { timestamps: true });

SubmissionSchema.index({ activity: 1, student: 1 }, { unique: true });

module.exports = mongoose.models.Submission || mongoose.model('Submission', SubmissionSchema);