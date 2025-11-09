const express = require('express');
const mongoose = require('mongoose');
const aiRouter = require('./routes/ai');
const authRouter = require('./routes/auth'); //inicio de sesion
const teacherRoutes = require('./routes/teacher');
const studentRoutes = require('./routes/student');
const cors = require('cors');
require('dotenv').config(); 

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/api/ai', aiRouter);
app.use('/api/auth', authRouter);
app.use('/api/teacher', teacherRoutes);
app.use('/api/student', studentRoutes);

const mongoUri = process.env.MONGODB_URI;
console.log('Conectando a MongoDB en:', mongoUri);

mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Conectado a MongoDB'))
.catch(err => console.error('Error al conectar a MongoDB:', err));

app.get('/', (req, res) => {
  res.send('¡Hola, mundo con pnpm!');
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor corriendo en http://0.0.0.0:${PORT}`);
});