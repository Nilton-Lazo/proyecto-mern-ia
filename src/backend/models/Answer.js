const mongoose = require('mongoose');

const AnswerSchema = new mongoose.Schema(
    {
        text: { type: String, required: true },        // texto base
        question: { type: String, required: true },    // pregunta hecha al usuario
        answer: { type: String, required: true },      // respuesta del usuario
        feedback: { type: String, required: true }     // retroalimentación de la IA
    },
    { timestamps: true }
);

module.exports = mongoose.models.Answer || mongoose.model('Answer', AnswerSchema);