const express = require('express')
const { Ollama } = require('ollama')
const Question = require('../models/Question');
const Answer = require('../models/Answer');
const PDFDocument = require("pdfkit");

const router = express.Router()

const ollama = new Ollama({
  host: process.env.OLLAMA_HOST || 'http://127.0.0.1:11434'
})

const MODEL = process.env.OLLAMA_MODEL || 'llama3:8b'

const KNOWN_BIASES = [
  "Ad hominem",
  "Generalización apresurada",
  "Falacia de autoridad",
  "Apelación a la emoción",
  "Falsa dicotomía",
  "Hombre de paja",
  "Pendiente resbaladiza",
  "Confirmación",
  "Sesgo de disponibilidad",
  "Sesgo de selección",
  "Circularidad (petición de principio)"
];

// mapeo de sinónimos/indicadores por sesgo para heurística básica
const HEUR_HINTS = {
  "Ad hominem": [
    "no deberíamos escuchar", "no confiar en él", "no terminó la universidad",
    "siempre se equivoca", "es un ignorante", "es un incompetente"
  ],
  "Generalización apresurada": [
    "todos", "siempre", "nunca", "ninguno", "la mayoría sin pruebas", "como todos"
  ],
  "Falacia de autoridad": [
    "lo dijo un famoso", "lo dijo una celebridad", "porque el actor dijo",
    "mi doctor lo afirma sin pruebas", "lo dijo el gurú"
  ],
  "Apelación a la emoción": [
    "si te importan los niños", "si amas tu país", "te haría muy feliz o muy triste",
    "apela al miedo", "apela a la compasión"
  ],
  "Falsa dicotomía": [
    "o estás con nosotros o", "solo hay dos opciones", "no hay punto medio"
  ],
  "Hombre de paja": [
    "ellos quieren que vivamos como", "exageras su posición", "distorsionas su argumento"
  ],
  "Pendiente resbaladiza": [
    "si hacemos esto, entonces inevitablemente", "esto nos llevará a", "terminaremos en"
  ],
  "Confirmación": [
    "solo leo lo que confirma", "ignoro lo que contradice", "mis creencias ya prueban"
  ],
  "Sesgo de disponibilidad": [
    "vi una noticia y por eso concluyo", "como salió en tv", "escuché un caso y es común"
  ],
  "Sesgo de selección": [
    "solo elegimos los que convienen", "muestra sesgada", "casos favorables únicamente"
  ],
  "Circularidad (petición de principio)": [
    "es verdad porque es verdad", "es cierto porque lo digo", "la biblia lo dice luego es cierto"
  ],
};

// normaliza texto para heurística
const norm = (s) =>
  (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

// heurística: devuelve conjunto de etiquetas detectadas
function heuristicDetect(text) {
  const t = norm(text);
  const found = new Set();
  for (const [label, hints] of Object.entries(HEUR_HINTS)) {
    for (const h of hints) {
      if (t.includes(norm(h))) {
        found.add(label);
        break;
      }
    }
  }
  // patrón simple de generalización por cuantificadores
  if (/\b(todos|siempre|nunca|ninguno|nadie|todos los|la mayoria)\b/i.test(text)) {
    found.add("Generalización apresurada");
  }
  // patrón simple de falsa dicotomía
  if (/o .* o /i.test(text) && /no hay (otra|alternativa|opcion)/i.test(text)) {
    found.add("Falsa dicotomía");
  }
  return Array.from(found);
}

// Extrae array JSON si viene “ensuciado”
function tryExtractJsonArray(str) {
  const m = str.match(/\[[\s\S]*\]/);
  if (!m) return null;
  try { return JSON.parse(m[0]); } catch { return null; }
}

// Valida etiquetas contra la lista
function sanitizeTags(arr) {
  const set = new Set();
  for (const x of arr || []) {
    if (typeof x !== "string") continue;
    // intenta “capitalizar” etiquetas que vengan en otra forma
    const hit = KNOWN_BIASES.find(k => k.toLowerCase() === x.toLowerCase());
    if (hit) set.add(hit);
  }
  return Array.from(set);
}

// ------- Rutas -------
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

/* -------------------- HU07 – Detectar sesgos -------------------- */
/* Nuevo endpoint: POST /api/ai/biases */
router.post('/biases', async (req, res) => {
  try {
    const { text } = req.body || {};
    if (!text || !text.trim()) {
      return res.status(400).json({ ok: false, tags: [], error: 'Falta el texto' });
    }

    // Prompt para forzar salida JSON (Arreglo de strings de etiquetas válidas)
    const systemPrompt = `
Eres un clasificador de sesgos y falacias lógicas en español.
Devuelve EXCLUSIVAMENTE JSON válido (sin texto adicional), con el formato:
["Ad hominem", "Generalización apresurada", ...]
No inventes etiquetas. Solo puedes usar exactamente estas:
${KNOWN_BIASES.map(x => `- ${x}`).join('\n')}
Si no detectas nada, devuelve [].
Texto a evaluar (entre <<< >>>):
<<<
${text}
>>>
`;

    // Intento 1: JSON estricto (muchos modelos de Ollama honran "format: 'json'")
    let llmTags = [];
    try {
      const r = await ollama.generate({
        model: MODEL,
        prompt: systemPrompt,
        format: 'json',           // si el modelo lo soporta, ayuda mucho
        options: {
          temperature: 0,
          num_ctx: 2048
        }
      });

      // r.response puede ser: '["...","..."]' o un string con basura (a veces)
      let parsed = null;
      try {
        parsed = JSON.parse(r.response);
      } catch {
        parsed = tryExtractJsonArray(r.response);
      }
      llmTags = sanitizeTags(parsed);
    } catch (e) {
      // cae al plan B (sin format json)
      llmTags = [];
    }

    // Intento 2 (fallback): pedir en texto y extraer por regex si lo anterior falló
    if (!llmTags.length) {
      const r2 = await ollama.generate({
        model: MODEL,
        prompt:
`Lee el texto y lista SOLO las etiquetas detectadas separadas por comas.
Etiquetas permitidas (no inventes): ${KNOWN_BIASES.join(', ')}.
Si no hay ninguna, responde: ninguna.

Texto:
${text}
`,
        options: { temperature: 0 }
      });

      const raw = (r2.response || '').toLowerCase();
      const found = [];
      for (const label of KNOWN_BIASES) {
        if (raw.includes(label.toLowerCase())) found.push(label);
      }
      if (/ninguna|no hay/i.test(r2.response)) {
        // deja found vacío
      }
      llmTags = sanitizeTags(found);
    }

    // Intento 3: heurística local (si el modelo no dio nada)
    const heuristic = heuristicDetect(text);

    // Mezcla y dedup
    const final = Array.from(new Set([...(llmTags || []), ...(heuristic || [])]));

    return res.json({
      ok: true,
      tags: final,
      detail: final.length ? undefined : "No se detectaron sesgos con el modelo ni con la heurística."
    });

  } catch (err) {
    console.error('biases error:', err);
    return res.status(200).json({ ok: false, tags: [], error: 'model_error' });
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