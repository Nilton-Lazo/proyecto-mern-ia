/**
 * Crea usuarios de prueba para Cypress E2E si no existen.
 * Uso: node scripts/seed-e2e-users.js
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../src/backend/.env') });

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  nombres: String,
  apellidos: String,
  email: { type: String, unique: true, lowercase: true },
  passwordHash: String,
  role: { type: String, enum: ['student', 'teacher', 'admin'], default: 'student' },
});
const User = mongoose.models.User || mongoose.model('User', UserSchema);

const E2E_USERS = [
  {
    nombres: 'Luis',
    apellidos: 'Docente E2E',
    email: 'luis@gmail.com',
    password: 'prueba',
    role: 'teacher',
  },
  {
    nombres: 'Joel',
    apellidos: 'Estudiante E2E',
    email: 'joel@gmail.com',
    password: 'prueba',
    role: 'student',
  },
];

async function main() {
  const uri =
    process.env.MONGODB_URI ||
    process.env.MONGO_URI ||
    'mongodb://127.0.0.1:27017/tutor-lectura';

  console.log('Conectando a', uri);
  await mongoose.connect(uri);

  for (const u of E2E_USERS) {
    const exists = await User.findOne({ email: u.email });
    if (exists) {
      console.log(`✓ Usuario existente: ${u.email}`);
      continue;
    }
    await User.create({
      nombres: u.nombres,
      apellidos: u.apellidos,
      email: u.email,
      passwordHash: await bcrypt.hash(u.password, 10),
      role: u.role,
    });
    console.log(`+ Usuario creado: ${u.email} (${u.role})`);
  }

  await mongoose.disconnect();
  console.log('Seed E2E completado.');
}

main().catch((err) => {
  console.error('Error en seed E2E:', err.message);
  process.exit(1);
});
