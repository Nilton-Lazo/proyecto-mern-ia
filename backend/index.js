const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = 3000;

app.use(express.json());

mongoose.connect('mongodb://tutor-mongo:27017/nombreDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Conectado a MongoDB'))
.catch(err => console.error('Error al conectar a MongoDB:', err));

app.get('/', (req, res) => {
    res.send('¡Hola, mundo con pnpm!');
});

app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
