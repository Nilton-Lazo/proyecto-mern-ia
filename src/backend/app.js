const express = require('express');
const usersRouter = require('./routes/users.routes');
const aiRouter = require('./routes/ia');
const questionRouter = require('./routes/questionRoutes');

const app = express();
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// Ejemplo de rutas
app.use('/api/users', usersRouter);
app.use('/api/ai', aiRouter);
app.use('/api/questions', questionRouter);

module.exports = app; // importante: exportar app para Supertest