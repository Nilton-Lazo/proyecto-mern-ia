const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middlewares/auth');

const router = express.Router();
const sign = (u) =>
  jwt.sign({ id: u._id, email: u.email, nombres: u.nombres }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES || '7d' });

router.post('/register', async (req, res) => {
  try {
    const { nombres, apellidos, centroEstudios, email, password } = req.body || {};
    if (!nombres || !apellidos || !email || !password) {
      return res.status(400).json({ error: 'Campos requeridos: nombres, apellidos, email, password' });
    }
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ error: 'El email ya está registrado' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ nombres, apellidos, centroEstudios, email, passwordHash });

    const token = sign(user);
    return res.json({ token, user: { id: user._id, email: user.email, nombres: user.nombres } });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'Email y password requeridos' });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Credenciales inválidas' });

    const token = sign(user);
    return res.json({ token, user: { id: user._id, email: user.email, nombres: user.nombres } });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

router.get('/me', auth, async (req, res) => {
  const user = await User.findById(req.user.id).select('_id email nombres apellidos centroEstudios createdAt');
  return res.json({ user });
});

module.exports = router;