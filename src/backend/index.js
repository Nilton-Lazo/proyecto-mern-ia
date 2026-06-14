const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

console.log(
  'N8N_ACTIVITY_ASSIGNED_WEBHOOK_URL:',
  process.env.N8N_ACTIVITY_ASSIGNED_WEBHOOK_URL ? 'configurada' : 'NO configurada'
);

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const aiRouter = require('./routes/ai');
const authRouter = require('./routes/auth');
const teacherRoutes = require('./routes/teacher');
const studentRoutes = require('./routes/student');
const automationRoutes = require('./routes/automation.routes');
const notificationsRoutes = require('./routes/notifications.routes');

const app = express();
const PORT = process.env.PORT || 3000;
const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  console.error('ERROR: MONGODB_URI no está definida en .env');
  process.exit(1);
}

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  const dbState = mongoose.connection.readyState;
  const states = ['desconectado', 'conectado', 'conectando', 'desconectando'];
  res.json({
    ok: dbState === 1,
    db: states[dbState] || dbState,
    uptime: process.uptime(),
  });
});

app.get('/', (_req, res) => {
  res.send('¡Hola, mundo con pnpm!');
});

app.use('/api/ai', aiRouter);
app.use('/api/auth', authRouter);
app.use('/api/teacher', teacherRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/automation', automationRoutes);
app.use('/api/notifications', notificationsRoutes);

async function start() {
  console.log('Conectando a MongoDB en:', mongoUri);

  try {
    await mongoose.connect(mongoUri);
    console.log('Conectado a MongoDB');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Servidor corriendo en http://0.0.0.0:${PORT}`);
    });
  } catch (err) {
    console.error('Error al conectar a MongoDB:', err.message);
    console.error(
      'Verifica que MongoDB esté activo y que MONGODB_URI sea correcta en src/backend/.env'
    );
    process.exit(1);
  }
}

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB desconectado — las peticiones fallarán hasta reconectar.');
});

start();
