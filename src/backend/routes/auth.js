const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

function dbReady() {
  const mongoose = require('mongoose');
  return mongoose.connection.readyState === 1;
}

// --- Registro ---
router.post('/register', async (req, res) => {
  try {
    if (!dbReady()) {
      return res.status(503).json({ message: 'Base de datos no disponible. Verifica MongoDB.' });
    }

    const { nombres, apellidos, centroEstudios, email, password, role } = req.body;

    if (!nombres?.trim() || !apellidos?.trim() || !email?.trim() || !password?.trim()) {
      return res.status(400).json({ message: 'Completa nombres, apellidos, correo y contraseña.' });
    }

    const exists = await User.findOne({ email: email.trim().toLowerCase() });
    if (exists) return res.status(400).json({ message: 'El correo ya está registrado.' });

    const passwordHash = await bcrypt.hash(password, 10);

    const userRole = ['student', 'teacher', 'admin'].includes(role) ? role : 'student';
    const user = await User.create({
      nombres: nombres.trim(),
      apellidos: apellidos.trim(),
      centroEstudios: centroEstudios?.trim() || '',
      email: email.trim().toLowerCase(),
      passwordHash,
      role: userRole,
    });

    const token = jwt.sign(
      { id: user._id, role: userRole },
      process.env.JWT_SECRET || 'secreto',
      { expiresIn: '7d' }
    );

    res.json({
      ok: true,
      token,
      user: {
        id: user._id,
        nombres,
        apellidos: user.apellidos,
        email: user.email,
        role: userRole,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al registrar usuario' });
  }
});

// --- Login ---
router.post('/login', async (req, res) => {
  try {
    if (!dbReady()) {
      return res.status(503).json({ message: 'Base de datos no disponible. Verifica MongoDB.' });
    }

    const { email, password } = req.body;

    if (!email?.trim() || !password?.trim()) {
      return res.status(400).json({ message: 'Correo y contraseña son obligatorios.' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado.' });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(401).json({ message: 'Contraseña incorrecta.' });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'secreto',
      { expiresIn: '7d' }
    );

    res.json({
      ok: true,
      token,
      user: {
        id: user._id,
        nombres: user.nombres,
        apellidos: user.apellidos,
        email: user.email,
        role: user.role,
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al iniciar sesión' });
  }
});

module.exports = router;