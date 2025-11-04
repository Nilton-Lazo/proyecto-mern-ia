const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// --- Registro ---
router.post('/register', async (req, res) => {
  try {
    const { nombres, apellidos, centroEstudios, email, password, role } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'El correo ya está registrado.' });

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      nombres,
      apellidos,
      centroEstudios,
      email,
      passwordHash,
      role: role || 'student' // permite registrar docentes también
    });

    res.json({ ok: true, user: { id: user._id, nombres, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al registrar usuario' });
  }
});

// --- Login ---
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
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
        role: user.role
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al iniciar sesión' });
  }
});

module.exports = router;