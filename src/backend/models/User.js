const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  nombres: { type: String, required: true, trim: true },
  apellidos: { type: String, required: true, trim: true },
  centroEstudios: { type: String, required: false, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);