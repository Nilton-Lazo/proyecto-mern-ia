const express = require('express');
const { Ollama } = require('ollama');
const PDFDocument = require('pdfkit');
const Question = require('../models/Question');
const Answer = require('../models/Answer');

const router = express.Router();

const ollama = new Ollama({
    host: process.env.OLLAMA_HOST || 'http://localhost:11434'
});
const MODEL = process.env.OLLAMA_MODEL || 'llama3:8b';

/** POST /api/ai/chat
 *  body: { prompt }
 */
router.post('/chat', async (req, res) => {
    try {
        const { prompt } = req.body || {};
        if (!prompt) return res.status(400).json({ error: 'Falta el prompt' });

        const r = await ollama.generate({ model: MODEL, prompt });
        return res.json({ ok: true, answer: r.response });
    } catch (err) {
        console.error('[AI:chat] ', err);
        return res.status(500).json({ error: err.message || 'Error en IA' });
    }
});

/** POST /api/ai/questions
 *  body: { text }
 *  Guarda texto + 5 preguntas generadas
 */
router.post('/questions', async (req, res) => {
    try {
        const { text } = req.body || {};
        if (!text) return res.status(400).json({ error: 'Falta el texto' });

        const prompt = `Lee el siguiente texto y genera exactamente 5 preguntas de comprensión lectora en español.
    - Devuélvelas en una lista, una por línea.
    - No incluyas respuestas ni explicaciones.

    Texto:
    ${text}`;

    const r = await ollama.generate({ model: MODEL, prompt });

    // Procesar respuesta a líneas con signo de interrogación
    let lines = (r.response || '')
        .split('\n')
        .map(l => l.trim())
        .filter(Boolean);

    let generated = lines.filter(l => /[¿?]$/.test(l));
    if (generated.length === 0 && lines.length) generated = [lines[0]];

    const newEntry = await Question.create({ text, questions: generated });

    res.json({
        message: 'Texto y preguntas guardados en Mongo correctamente',
        data: newEntry
    });
    } catch (err) {
    console.error('[AI:questions] ', err);
    return res.status(500).json({ error: err.message || 'Error generando preguntas' });
    }
});

/** POST /api/ai/feedback
 *  body: { text, question, answer }
 *  Devuelve una oración breve (CORRECTA / PARCIAL / INCORRECTA …)
 */
router.post('/feedback', async (req, res) => {
    try {
    const { text, question, answer } = req.body || {};
    if (!text || !question || !answer) {
        return res.status(400).json({ error: 'Faltan datos: text, question o answer' });
    }

    const prompt = `Analiza el siguiente ejercicio de comprensión lectora.

Texto:
${text}

Pregunta:
${question}

Respuesta del usuario:
${answer}

Instrucciones para la retroalimentación:
- Usa un lenguaje claro, sencillo, respetuoso y en español.
- Habla directamente al usuario en segunda persona.
- No uses negritas, cursivas, guiones, asteriscos ni ningún tipo de formato de edición.
- No uses expresiones como "el usuario respondió...".
- Responde únicamente con UNA oración breve en español (máximo 20 palabras).
- Solo indica si es correcta, parcial o incorrecta y qué mejorar en pocas palabras.`;

    const r = await ollama.generate({ model: MODEL, prompt });

    let feedback = (r.response || '').trim();
    feedback = feedback.replace(/\*\*(.*?)\*\*/g, '$1').replace(/[_*`]/g, '').replace(/\s+/g, ' ');

    const saved = await Answer.create({ text, question, answer, feedback });

    res.json({ feedback, saved });
    } catch (err) {
    console.error('[AI:feedback] ', err);
    return res.status(500).json({ error: err.message || 'Error generando feedback' });
    }
});

/** GET /api/ai/reports
 *  Resumen simple de respuestas guardadas
 */
router.get('/reports', async (_req, res) => {
    try {
        const answers = await Answer.find().lean();

        const total = answers.length;
        const contains = (a, token) => (a.feedback || '').toUpperCase().includes(token);
        const correctas = answers.filter(a => contains(a, 'CORRECTA')).length;
        const incorrectas = answers.filter(a => contains(a, 'INCORRECTA')).length;
        const parciales = answers.filter(a => contains(a, 'PARCIAL')).length;

        res.json({
            total,
            correctas,
            incorrectas,
            parciales,
            ultimas: answers.slice(-5)
        });
    } catch (err) {
    console.error('[AI:reports] ', err);
    return res.status(500).json({ error: err.message || 'Error obteniendo reportes' });
    }
});

/** GET /api/ai/informe
 *  Genera PDF con respuestas guardadas
 */
router.get('/informe', async (_req, res) => {
    try {
        const answers = await Answer.find().lean();

        const doc = new PDFDocument({ margin: 50 });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=informe.pdf');
        doc.pipe(res);

        doc.fillColor('#1e3a8a').fontSize(22).text('Informe de Comprensión Lectora', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).fillColor('gray').text(`Generado el: ${new Date().toLocaleString()}`, { align: 'center' });
        doc.moveDown(2);

        // Resumen
        const total = answers.length;
        const contains = (a, token) => (a.feedback || '').toUpperCase().includes(token);
        const correctas = answers.filter(a => contains(a, 'CORRECTA')).length;
        const incorrectas = answers.filter(a => contains(a, 'INCORRECTA')).length;
        const parciales = answers.filter(a => contains(a, 'PARCIAL')).length;

        doc.fontSize(16).fillColor('#111827').text('Resumen General', { underline: true });
        doc.moveDown();
        doc.fontSize(12).fillColor('#111827').list(
            [
            `Total de respuestas: ${total}`,
            `Correctas: ${correctas}`,
            `Incorrectas: ${incorrectas}`,
            `Parciales: ${parciales}`
            ],
            { bulletRadius: 2 }
        );
        doc.moveDown(2);

        // Detalle
        doc.fontSize(16).fillColor('#111827').text('Detalle de Respuestas', { underline: true });
        doc.moveDown();

        answers.forEach((a, i) => {
            if (doc.y > 650) doc.addPage();

            doc.fontSize(13).fillColor('#1e40af').text(`Pregunta ${i + 1}: ${a.question}`);
            doc.moveDown(0.5);
            doc.fontSize(12).fillColor('#111827').text(`Respuesta: ${a.answer}`);
            doc.moveDown(0.5);
            doc.fontSize(12).fillColor('#2563eb').text(`Feedback: ${a.feedback}`);
            doc.moveDown(0.5);
            doc.fontSize(10).fillColor('gray').text(`Fecha: ${new Date(a.createdAt).toLocaleString()}`);
            doc.moveDown(1.5);
            doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor('#e5e7eb').stroke();
            doc.moveDown();
        });

        doc.moveDown(2);
        doc.fontSize(10).fillColor('gray')
            .text('Tutor Virtual de Lectura Crítica — Informe generado automáticamente', { align: 'center' });

        doc.end();
    } catch (err) {
        console.error('[AI:informe] ', err);
        return res.status(500).json({ error: err.message || 'Error generando informe' });
    }
});

module.exports = router;