import express from 'express';
const router = express.Router();

router.post('/generate', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Falta el texto' });
    }

    res.json({
      message: 'Texto recibido correctamente',
      text,
    });

  } catch (error) {
    res.status(500).json({ error: 'Error en el servidor', details: error.message });
  }
});

export default router;
