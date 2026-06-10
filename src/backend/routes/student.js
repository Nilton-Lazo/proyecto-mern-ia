const express = require('express');
const Activity = require('../models/Activity');
const Submission = require('../models/Submission');
const authRequired = require('../middlewares/auth');
const requireRole = require('../middlewares/roles');
const aiService = require('../services/aiService');

const router = express.Router();

function assertAssigned(act, userId) {
  if (!act) return { code: 404, error: 'Actividad no existe' };
  if (!act.assignees.map(String).includes(String(userId))) {
    return { code: 403, error: 'No asignada a este estudiante' };
  }
  return null;
}

function displayStatus(sub, dueAt) {
  if (sub?.status === 'submitted') return 'entregada';
  if (dueAt && new Date(dueAt) < new Date()) return 'vencida';
  const hasWork =
    (sub?.progressPercent ?? 0) > 0 ||
    sub?.questionsGenerated ||
    (sub?.questionAnswers?.length ?? 0) > 0 ||
    (sub?.questions?.length ?? 0) > 0;
  if (!hasWork) return 'pendiente';
  return 'en_progreso';
}

function calcProgress(sub) {
  if (sub?.status === 'submitted') return 100;
  const qs = sub?.questions?.length ?? 0;
  if (qs === 0) {
    return sub?.answer?.trim() ? 15 : sub?.progressPercent ?? 0;
  }
  const answered = (sub?.questionAnswers ?? []).filter((a) => a.answer?.trim()).length;
  return Math.min(99, Math.round((answered / qs) * 90) + (sub?.questionsGenerated ? 10 : 0));
}

function mapActivityRow(sub) {
  const act = sub.activity;
  if (!act) return null;
  const st = displayStatus(sub, act.dueAt);
  return {
    _id: act._id,
    titulo: act.title,
    descripcion: act.instructions || '',
    dueAt: act.dueAt,
    progreso: sub.status === 'submitted' ? 100 : calcProgress(sub),
    status: sub.status,
    displayStatus: st,
    preguntasCount: sub.questions?.length ?? 0,
    questionsGenerated: !!sub.questionsGenerated,
    actualizada: sub.updatedAt,
    score: sub.score,
  };
}

// GET /api/student/progress
router.get('/progress', authRequired, requireRole('student', 'admin'), async (req, res) => {
  try {
    const subs = await Submission.find({ student: req.user._id })
      .populate({ path: 'activity', select: 'title dueAt' })
      .sort({ updatedAt: -1 })
      .lean();

    const rows = subs.map((s) => mapActivityRow(s)).filter(Boolean);
    const completed = rows.filter((r) => r.displayStatus === 'entregada').length;
    const pending = rows.filter((r) => r.displayStatus === 'pendiente').length;
    const inProgress = rows.filter((r) => r.displayStatus === 'en_progreso').length;
    const overdue = rows.filter((r) => r.displayStatus === 'vencida').length;
    const avgProgress = rows.length
      ? Math.round(rows.reduce((a, r) => a + r.progreso, 0) / rows.length)
      : 0;
    const scores = subs.filter((s) => s.score != null).map((s) => s.score);
    const avgScore = scores.length
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : null;

    res.json({
      totalActivities: rows.length,
      pending,
      inProgress,
      completed,
      overdue,
      avgProgress,
      avgScore,
      lastActivity: rows[0] || null,
      activities: rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/student/activities
router.get('/activities', authRequired, requireRole('student', 'admin'), async (req, res) => {
  try {
    const subs = await Submission.find({ student: req.user._id })
      .populate({ path: 'activity', select: 'title instructions dueAt createdAt' })
      .sort({ updatedAt: -1 })
      .lean();

    const activities = subs.map((s) => mapActivityRow(s)).filter(Boolean);
    res.json({ activities });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/student/activities/:id/generate-questions
router.post('/activities/:id/generate-questions', authRequired, requireRole('student', 'admin'), async (req, res) => {
  try {
    const act = await Activity.findById(req.params.id).lean();
    const denied = assertAssigned(act, req.user._id);
    if (denied) return res.status(denied.code).json({ error: denied.error });

    let sub = await Submission.findOne({ activity: act._id, student: req.user._id });
    if (!sub) {
      sub = await Submission.create({ activity: act._id, student: req.user._id });
    }
    if (sub.status === 'submitted') {
      return res.status(400).json({ error: 'La actividad ya fue entregada' });
    }
    if (sub.questionsGenerated && sub.questions?.length > 0) {
      return res.json({
        ok: true,
        alreadyGenerated: true,
        questions: sub.questions,
        aiAnalysis: sub.aiAnalysis,
        progressPercent: calcProgress(sub),
      });
    }
    if (!act.text?.trim()) {
      return res.status(400).json({ error: 'La actividad no tiene texto para analizar' });
    }

    const [questions, aiAnalysis] = await Promise.all([
      aiService.generateTypedQuestions(act.text),
      aiService.analyzeText(act.text),
    ]);

    sub.questions = questions;
    sub.questionsGenerated = true;
    sub.aiAnalysis = aiAnalysis;
    sub.questionAnswers = questions.map((_, i) => ({
      questionIndex: i,
      answer: sub.questionAnswers?.[i]?.answer || '',
      feedback: '',
      isCorrect: '',
    }));
    sub.progressPercent = Math.max(sub.progressPercent, 15);
    await sub.save();

    res.json({
      ok: true,
      questions: sub.questions,
      aiAnalysis: sub.aiAnalysis,
      progressPercent: calcProgress(sub),
    });
  } catch (err) {
    console.error('generate-questions:', err);
    res.status(500).json({ error: 'No fue posible generar preguntas con IA. Intenta más tarde.' });
  }
});

// POST /api/student/activities/:id/analyze
router.post('/activities/:id/analyze', authRequired, requireRole('student', 'admin'), async (req, res) => {
  try {
    const act = await Activity.findById(req.params.id).lean();
    const denied = assertAssigned(act, req.user._id);
    if (denied) return res.status(denied.code).json({ error: denied.error });
    if (!act.text?.trim()) return res.status(400).json({ error: 'Sin texto' });

    const aiAnalysis = await aiService.analyzeText(act.text);
    const sub = await Submission.findOneAndUpdate(
      { activity: act._id, student: req.user._id },
      { $set: { aiAnalysis } },
      { upsert: true, new: true }
    );
    res.json({ ok: true, aiAnalysis: sub.aiAnalysis });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al analizar el texto' });
  }
});

// POST /api/student/activities/:id/save-draft
router.post('/activities/:id/save-draft', authRequired, requireRole('student', 'admin'), async (req, res) => {
  try {
    const { answers = [], answer = '' } = req.body || {};
    const act = await Activity.findById(req.params.id).lean();
    const denied = assertAssigned(act, req.user._id);
    if (denied) return res.status(denied.code).json({ error: denied.error });

    let sub = await Submission.findOne({ activity: act._id, student: req.user._id });
    if (!sub) sub = await Submission.create({ activity: act._id, student: req.user._id });
    if (sub.status === 'submitted') {
      return res.status(400).json({ error: 'La actividad ya fue entregada' });
    }

    if (Array.isArray(answers) && answers.length > 0) {
      sub.questionAnswers = answers.map((a, i) => ({
        questionIndex: a.questionIndex ?? i,
        answer: a.answer ?? '',
        feedback: sub.questionAnswers?.[i]?.feedback || '',
        isCorrect: sub.questionAnswers?.[i]?.isCorrect || '',
      }));
    }
    if (answer) sub.answer = answer;
    sub.progressPercent = calcProgress(sub);
    sub.status = 'draft';
    await sub.save();

    res.json({ ok: true, progressPercent: sub.progressPercent });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/student/activities/:id/submit
router.post('/activities/:id/submit', authRequired, requireRole('student', 'admin'), async (req, res) => {
  try {
    const act = await Activity.findById(req.params.id).lean();
    const denied = assertAssigned(act, req.user._id);
    if (denied) return res.status(denied.code).json({ error: denied.error });

    let sub = await Submission.findOne({ activity: act._id, student: req.user._id });
    if (!sub) return res.status(400).json({ error: 'Debes generar preguntas antes de enviar' });
    if (sub.status === 'submitted') {
      return res.status(400).json({ error: 'La actividad ya fue entregada' });
    }
    if (!sub.questions?.length) {
      return res.status(400).json({ error: 'Genera las preguntas con IA antes de enviar' });
    }

    const { answers = [] } = req.body || {};
    if (Array.isArray(answers) && answers.length > 0) {
      sub.questionAnswers = answers.map((a, i) => ({
        questionIndex: a.questionIndex ?? i,
        answer: a.answer ?? '',
        feedback: '',
        isCorrect: '',
      }));
    }

    const empty = sub.questionAnswers.filter((a) => !a.answer?.trim()).length;
    if (empty === sub.questions.length) {
      return res.status(400).json({ error: 'Responde al menos una pregunta antes de enviar' });
    }

    for (let i = 0; i < sub.questions.length; i++) {
      const ans = sub.questionAnswers[i]?.answer?.trim();
      if (!ans) continue;
      const fb = await aiService.generateFeedback(act.text, sub.questions[i].questionText, ans);
      sub.questionAnswers[i].feedback = fb;
      const lower = fb.toLowerCase();
      if (lower.includes('correcta') && !lower.includes('incorrecta')) {
        sub.questionAnswers[i].isCorrect = 'correcta';
      } else if (lower.includes('incorrecta')) {
        sub.questionAnswers[i].isCorrect = 'incorrecta';
      } else {
        sub.questionAnswers[i].isCorrect = 'parcial';
      }
    }

    const evaluation = await aiService.evaluateSubmission(act.text, sub.questions, sub.questionAnswers);
    sub.score = evaluation.score ?? calcProgress(sub);
    sub.feedbackSummary = evaluation.summary || '';
    sub.recommendation = evaluation.recommendation || '';
    sub.motivation = evaluation.motivation || '';
    if (Array.isArray(evaluation.items)) {
      evaluation.items.forEach((item) => {
        const idx = item.index;
        if (sub.questionAnswers[idx] && item.feedback) {
          sub.questionAnswers[idx].feedback = item.feedback;
        }
      });
    }

    sub.status = 'submitted';
    sub.progressPercent = 100;
    await sub.save();

    res.json({
      ok: true,
      status: sub.status,
      score: sub.score,
      feedbackSummary: sub.feedbackSummary,
      recommendation: sub.recommendation,
      motivation: sub.motivation,
      questionAnswers: sub.questionAnswers,
    });
  } catch (err) {
    console.error('submit:', err);
    res.status(500).json({ error: 'Error al enviar la actividad' });
  }
});

// GET /api/student/activities/:id
router.get('/activities/:id', authRequired, requireRole('student', 'admin'), async (req, res) => {
  try {
    const act = await Activity.findById(req.params.id).lean();
    const denied = assertAssigned(act, req.user._id);
    if (denied) return res.status(denied.code).json({ error: denied.error });

    const sub = await Submission.findOne({ activity: act._id, student: req.user._id }).lean();
    const display = displayStatus(sub, act.dueAt);

    res.json({
      _id: act._id,
      title: act.title,
      instructions: act.instructions,
      text: act.text,
      dueAt: act.dueAt,
      progressPercent: sub?.status === 'submitted' ? 100 : calcProgress(sub),
      status: sub?.status ?? 'draft',
      displayStatus: display,
      answer: sub?.answer ?? '',
      questions: sub?.questions ?? [],
      questionAnswers: sub?.questionAnswers ?? [],
      aiAnalysis: sub?.aiAnalysis ?? {},
      questionsGenerated: !!sub?.questionsGenerated,
      score: sub?.score,
      feedbackSummary: sub?.feedbackSummary ?? '',
      recommendation: sub?.recommendation ?? '',
      motivation: sub?.motivation ?? '',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Legacy: POST /api/student/progress
router.post('/progress', authRequired, requireRole('student', 'admin'), async (req, res) => {
  const { activityId, answer = '', progressPercent = 0 } = req.body || {};
  if (!activityId) return res.status(400).json({ error: 'activityId requerido' });

  const act = await Activity.findById(activityId).lean();
  const denied = assertAssigned(act, req.user._id);
  if (denied) return res.status(denied.code).json({ error: denied.error });

  const sub = await Submission.findOneAndUpdate(
    { activity: activityId, student: req.user._id },
    { $set: { answer, progressPercent: Math.max(0, Math.min(100, progressPercent)), status: 'draft' } },
    { upsert: true, new: true }
  );
  res.json({ ok: true, progressPercent: sub.progressPercent });
});

// Legacy: POST /api/student/submit (compatibilidad tests/clientes antiguos)
router.post('/submit', authRequired, requireRole('student', 'admin'), async (req, res) => {
  const { activityId } = req.body || {};
  if (!activityId) return res.status(400).json({ error: 'activityId requerido' });

  const act = await Activity.findById(activityId).lean();
  const denied = assertAssigned(act, req.user._id);
  if (denied) return res.status(denied.code).json({ error: denied.error });

  const sub = await Submission.findOneAndUpdate(
    { activity: activityId, student: req.user._id },
    { $set: { status: 'submitted', progressPercent: 100 } },
    { upsert: true, new: true }
  );
  res.json({ ok: true, status: sub.status });
});

module.exports = router;
