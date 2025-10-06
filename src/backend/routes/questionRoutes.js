const express = require('express');
const router = express.Router();

/** POST /api/questions/generate
 *  body: { text }
 *  Devuelve eco del texto con un mensaje (stub para pruebas)
 */
router.post('/generate', async (req, res) => {
    try {
        const { text } = req.body || {};
        if (!text) return res.status(400).json({ error: 'Falta el texto' });

        return res.json({
            message: 'Texto recibido correctamente',
            text
        });
    } catch (error) {
        res.status(500).json({ error: 'Error en el servidor', details: error.message });
    }
});

module.exports = router;
