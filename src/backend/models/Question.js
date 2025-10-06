const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema(
    {
        text: { type: String, required: true },
        questions: { type: [String], default: [] }
    },
    { timestamps: true }
);

module.exports = mongoose.models.Question || mongoose.model('Question', QuestionSchema);