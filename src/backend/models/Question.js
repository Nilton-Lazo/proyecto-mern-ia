const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },       // Texto que envía el usuario
  questions: [{ type: String }],                // Preguntas generadas por IA (vacío por ahora)
  createdAt: { type: Date, default: Date.now }  // Fecha de creación
});

module.exports = mongoose.model('Question', questionSchema);
