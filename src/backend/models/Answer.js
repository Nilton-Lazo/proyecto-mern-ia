const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  text: { type: String, required: true },      // Texto base
  question: { type: String, required: true },  // Pregunta generada
  answer: { type: String, required: true },    // Respuesta del usuario
  feedback: { type: String, required: true },  // Retroalimentación
  createdAt: { type: Date, default: Date.now } // Fecha
});

module.exports = mongoose.model('Answer', answerSchema);
