const express = require('express')
const { Ollama } = require('ollama')
const Question = require('../models/Question');
const Answer = require('../models/Answer');
const PDFDocument = require("pdfkit");

const router = express.Router()

const ollama = new Ollama({
  host: process.env.OLLAMA_HOST || 'http://172.23.165.233:11434'
})

const MODEL = process.env.OLLAMA_MODEL || 'llama3:8b'

router.post('/chat', async (req, res) => {
  try {
    const { prompt } = req.body
    if (!prompt) return res.status(400).json({ error: 'Falta el prompt' })

    const r = await ollama.generate({
      model: MODEL,
      prompt
    })

    return res.json({ ok: true, answer: r.response })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: err.message })
  }
})

// Endpoint HU01: Recibir preguntas
router.post('/questions', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Falta el texto' });
    }

    const r = await ollama.generate({
      model: MODEL,
      prompt: `Lee el siguiente texto y genera exactamente 5 preguntas de comprensión lectora en **español**.
    - Devuélvelas en una lista, una por línea.
    - No incluyas respuestas ni explicaciones.
    
    Texto:
    ${text}`
    });    

    let lines = r.response.split('\n').map(l => l.trim());

    let generated = lines.filter(l => l.endsWith('?'));

    if (generated.length === 0) {
      generated = [r.response];
    }

    const newEntry = new Question({
      text,
      questions: generated
    });

    await newEntry.save();

    res.json({
      message: 'Texto y preguntas guardados en Mongo correctamente',
      data: newEntry
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

// Endpoint HU02: Recibir retroalimentación
router.post('/feedback', async (req, res) => {
  try {
    const { text, question, answer } = req.body;

    if (!text || !question || !answer) {
      return res.status(400).json({ error: 'Faltan datos: text, question o answer' });
    }

    const r = await ollama.generate({
      model: MODEL,
      prompt: `Analiza el siguiente ejercicio de comprensión lectora.

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
- Solo indica si es correcta, parcial o incorrecta y qué mejorar en pocas palabras.`
    });

    let feedback = r.response.trim();

    feedback = feedback.replace(/\*\*(.*?)\*\*/g, "$1"); 
    feedback = feedback.replace(/[_*`]/g, "");
    feedback = feedback.replace(/\s+/g, " ");         

    const newAnswer = new Answer({
      text,
      question,
      answer,
      feedback
    });

    await newAnswer.save();

    res.json({
      feedback,
      saved: newAnswer
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Endpoint HU05: Acceder a reportes
router.get('/reports', async (req, res) => {
  try {
    const answers = await Answer.find();

    const total = answers.length;

    const correctas = answers.filter(a => a.feedback.includes("CORRECTA")).length;
    const incorrectas = answers.filter(a => a.feedback.includes("INCORRECTA")).length;
    const parciales = answers.filter(a => a.feedback.includes("PARCIAL")).length;

    const report = {
      total,
      correctas,
      incorrectas,
      parciales,
      ultimas: answers.slice(-5)
    };

    res.json(report);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Endpoint HU06: Obtener informe
router.get("/informe", async (req, res) => {
  try {
    const answers = await Answer.find();

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=informe.pdf");
    doc.pipe(res);

    doc
      .fillColor("#1e3a8a")
      .fontSize(22)
      .text("Informe de Comprensión Lectora", { align: "center" });

    doc.moveDown();
    doc
      .fontSize(12)
      .fillColor("gray")
      .text(`Generado el: ${new Date().toLocaleString()}`, { align: "center" });

    doc.moveDown(2);

    doc
      .fontSize(16)
      .fillColor("#111827")
      .text("Resumen General", { underline: true });
    doc.moveDown();

    const correctas = answers.filter((a) => a.feedback.includes("CORRECTA")).length;
    const incorrectas = answers.filter((a) => a.feedback.includes("INCORRECTA")).length;
    const parciales = answers.filter((a) => a.feedback.includes("PARCIAL")).length;

    doc
      .fontSize(12)
      .fillColor("#111827")
      .list(
        [
          `Total de respuestas: ${answers.length}`,
          `Correctas: ${correctas}`,
          `Incorrectas: ${incorrectas}`,
          `Parciales: ${parciales}`,
        ],
        { bulletRadius: 2 }
      );

    doc.moveDown(2);

    doc
      .fontSize(16)
      .fillColor("#111827")
      .text("Detalle de Respuestas", { underline: true });
    doc.moveDown();

    answers.forEach((a, i) => {

      if (doc.y > 650) {
        doc.addPage();
      }

      doc
        .fontSize(13)
        .fillColor("#1e40af")
        .text(`Pregunta ${i + 1}: ${a.question}`, {
          continued: false,
        });

      doc.moveDown(0.5);

      doc
        .fontSize(12)
        .fillColor("#111827")
        .text(`Respuesta: ${a.answer}`);

      doc.moveDown(0.5);

      doc
        .fontSize(12)
        .fillColor("#2563eb")
        .text(`Feedback: ${a.feedback}`);

      doc.moveDown(0.5);

      doc
        .fontSize(10)
        .fillColor("gray")
        .text(`Fecha: ${new Date(a.createdAt).toLocaleString()}`);

      doc.moveDown(1.5);

      doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor("#e5e7eb").stroke();
      doc.moveDown();
    });

    doc.moveDown(2);
    doc
      .fontSize(10)
      .fillColor("gray")
      .text("Tutor Virtual de Lectura Crítica — Informe generado automáticamente", {
        align: "center",
      });

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router
