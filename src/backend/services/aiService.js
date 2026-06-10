const { Ollama } = require('ollama');

const ollama = new Ollama({
  host: process.env.OLLAMA_HOST || 'http://127.0.0.1:11434',
});
const MODEL = process.env.OLLAMA_MODEL || 'llama3:8b';

const QUESTION_TYPES = ['literal', 'inferential', 'critical', 'vocabulary', 'main_idea'];
const TYPE_LABELS = {
  literal: 'Comprensión literal',
  inferential: 'Comprensión inferencial',
  critical: 'Pensamiento crítico',
  vocabulary: 'Vocabulario e interpretación',
  main_idea: 'Idea principal',
};

function tryParseJson(str) {
  if (!str) return null;
  try {
    return JSON.parse(str);
  } catch {
    const m = str.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (!m) return null;
    try {
      return JSON.parse(m[0]);
    } catch {
      return null;
    }
  }
}

function normalizeQuestions(raw, min = 5, max = 10) {
  if (!Array.isArray(raw)) return [];
  const out = [];
  for (let i = 0; i < raw.length && out.length < max; i++) {
    const item = raw[i];
    if (typeof item === 'string' && item.trim()) {
      out.push({
        questionText: item.trim(),
        type: QUESTION_TYPES[out.length % QUESTION_TYPES.length],
        order: out.length + 1,
      });
      continue;
    }
    if (item && typeof item === 'object' && item.questionText) {
      const t = QUESTION_TYPES.includes(item.type) ? item.type : QUESTION_TYPES[out.length % QUESTION_TYPES.length];
      out.push({
        questionText: String(item.questionText).trim(),
        type: t,
        order: out.length + 1,
        difficulty: item.difficulty || 'media',
      });
    }
  }
  while (out.length < min && out.length > 0) {
    const base = out[out.length % out.length];
    out.push({ ...base, questionText: `${base.questionText} (variante ${out.length + 1})`, order: out.length + 1 });
  }
  return out.slice(0, max);
}

async function generateTypedQuestions(text) {
  const count = text.length > 800 ? 8 : 5;
  const prompt = `Lee el siguiente texto en español y genera exactamente ${count} preguntas de comprensión lectora.
Devuelve EXCLUSIVAMENTE un JSON válido (array), sin texto adicional:
[
  {"questionText":"...","type":"literal"},
  {"questionText":"...","type":"inferential"},
  {"questionText":"...","type":"critical"},
  {"questionText":"...","type":"vocabulary"},
  {"questionText":"...","type":"main_idea"}
]
Tipos permitidos: literal, inferential, critical, vocabulary, main_idea.
Cada pregunta debe terminar con signo de interrogación y ser específica al texto.

Texto:
${text}`;

  const r = await ollama.generate({
    model: MODEL,
    prompt,
    format: 'json',
    options: { temperature: 0.3 },
  });

  let parsed = tryParseJson(r.response);
  if (Array.isArray(parsed)) {
    return normalizeQuestions(parsed, 5, 10);
  }
  if (parsed && Array.isArray(parsed.questions)) {
    return normalizeQuestions(parsed.questions, 5, 10);
  }

  const fallback = await ollama.generate({
    model: MODEL,
    prompt: `Genera 5 preguntas de comprensión en español, una por línea, solo preguntas:\n${text}`,
  });
  const lines = (fallback.response || '').split('\n').map((l) => l.replace(/^[\d.\-*]+\s*/, '').trim()).filter((l) => l.endsWith('?'));
  return normalizeQuestions(lines.length ? lines : [fallback.response], 5, 5);
}

async function analyzeText(text) {
  const prompt = `Analiza el siguiente texto en español. Devuelve EXCLUSIVAMENTE JSON válido:
{
  "mainIdea": "idea principal en una oración",
  "keywords": ["palabra1","palabra2","palabra3"],
  "difficulty": "básico|intermedio|avanzado",
  "readingTip": "consejo breve para leer mejor",
  "biases": []
}
Texto:
${text}`;

  try {
    const r = await ollama.generate({ model: MODEL, prompt, format: 'json', options: { temperature: 0 } });
    const parsed = tryParseJson(r.response);
    if (parsed) {
      return {
        mainIdea: parsed.mainIdea || '',
        keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
        difficulty: parsed.difficulty || 'intermedio',
        readingTip: parsed.readingTip || 'Lee el texto completo antes de responder.',
        biases: Array.isArray(parsed.biases) ? parsed.biases : [],
      };
    }
  } catch {
    /* fallback below */
  }
  return {
    mainIdea: 'Análisis no disponible temporalmente.',
    keywords: [],
    difficulty: 'intermedio',
    readingTip: 'Subraya ideas clave y relee los párrafos difíciles.',
    biases: [],
  };
}

async function generateFeedback(text, question, answer) {
  const r = await ollama.generate({
    model: MODEL,
    prompt: `Analiza este ejercicio de comprensión lectora en español.
Texto: ${text}
Pregunta: ${question}
Respuesta del estudiante: ${answer}
Responde en UNA oración breve (máx. 25 palabras), en segunda persona, indicando si es correcta, parcial o incorrecta y qué mejorar. Sin formato markdown.`,
    options: { temperature: 0.2 },
  });
  let feedback = (r.response || '').trim();
  feedback = feedback.replace(/\*\*(.*?)\*\*/g, '$1').replace(/[_*`]/g, '').replace(/\s+/g, ' ');
  return feedback;
}

async function evaluateSubmission(text, questions, answers) {
  const items = questions.map((q, i) => ({
    question: q.questionText,
    type: q.type,
    answer: answers[i]?.answer || '',
    feedback: answers[i]?.feedback || '',
  }));

  const prompt = `Eres evaluador de comprensión lectora. Evalúa las respuestas del estudiante.
Texto base: ${text}
Respuestas: ${JSON.stringify(items)}
Devuelve EXCLUSIVAMENTE JSON:
{
  "score": 0-100,
  "summary": "resumen general en 2 oraciones",
  "motivation": "mensaje motivador breve",
  "recommendation": "recomendación de mejora",
  "items": [{"index":0,"feedback":"...","isCorrect":"correcta|parcial|incorrecta"}]
}`;

  try {
    const r = await ollama.generate({ model: MODEL, prompt, format: 'json', options: { temperature: 0.2 } });
    const parsed = tryParseJson(r.response);
    if (parsed) return parsed;
  } catch {
    /* fallback */
  }

  const answered = items.filter((x) => x.answer.trim()).length;
  const score = questions.length ? Math.round((answered / questions.length) * 70) : 0;
  return {
    score,
    summary: 'Actividad enviada. Revisa la retroalimentación por pregunta.',
    motivation: '¡Buen trabajo! Sigue practicando tu comprensión lectora.',
    recommendation: 'Relee el texto y compara tus respuestas con las ideas principales.',
    items: items.map((_, i) => ({ index: i, feedback: items[i].feedback || 'Sin evaluación', isCorrect: 'parcial' })),
  };
}

module.exports = {
  MODEL,
  QUESTION_TYPES,
  TYPE_LABELS,
  generateTypedQuestions,
  analyzeText,
  generateFeedback,
  evaluateSubmission,
  tryParseJson,
};
