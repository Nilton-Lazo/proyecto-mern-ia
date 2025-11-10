// src/backend/middlewares/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async function auth(req, res, next) {
  try {
    const hdr = req.headers.authorization || '';
    const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'No autorizado' });

    const payload = jwt.verify(token, process.env.JWT_SECRET); // { id, email, ... }
    // Trae el usuario para obtener el rol actual
    const u = await User.findById(payload.id)
      .select('_id email role nombres apellidos')
      .lean();
    if (!u) return res.status(401).json({ error: 'Sesión inválida' });

    req.user = {
      _id: String(u._id),
      email: u.email,
      role: u.role,
      nombres: u.nombres,
      apellidos: u.apellidos,
    };
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};