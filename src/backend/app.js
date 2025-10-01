const express = require('express');
const usersRouter = require('./routes/users.routes');

const app = express();
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// Ejemplo de rutas
app.use('/api/users', usersRouter);

module.exports = app; // importante: exportar app para Supertest