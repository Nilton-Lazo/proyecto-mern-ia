const express = require('express');
const Activity = require('../models/Activity');
const Submission = require('../models/Submission');
const authRequired = require('../middlewares/auth');
const requireRole = require('../middlewares/roles');
const aiService = require('../services/aiService');
const n8nService = require('../services/n8n.service');
const {
  displayStatus,
  calcProgress,
  mapActivityRow,
  filterActivityRows,
  groupByArea,
  persistDraft,
  findOrCreateDraftSubmission,
  computeSkillScores,
  aggregateSkillScores,
  getSkillRecommendations,
} = require('./studentHelpers');

const studentReportsRouter = require('./studentReports');

const router = express.Router();

router.use('/reports', authRequired, requireRole('student', 'admin'), studentReportsRouter);

const ACTIVITY_POPULATE = {
  path: 'activity',
  select: 'title instructions dueAt createdAt area topic createdBy',
  populate: { path: 'createdBy', select: 'nombres apellidos' },
};

function assertAssigned(act, userId) {
  if (!act) return { code: 404, error: 'Actividad no existe' };
  if (!act.assignees.map(String).includes(String(userId))) {
    return { code: 403, error: 'No asignada a este estudiante' };
  }
  return null;
}

// GET /api/student/progress/skills — Mapa de mejora lectora
router.get('/progress/skills', authRequired, requireRole('student', 'admin'), async (req, res) => {
  try {
    const subs = await Submission.find({ student: req.user._id, status: 'submitted' })
      .select('skillScores questions questionAnswers score')
      .lean();

    const skillScores = aggregateSkillScores(subs);
    const recommendations = getSkillRecommendations(skillScores);

    res.json({
      skillScores,
      recommendations,
      submissionsEvaluated: subs.length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/student/progress
router.get('/progress', authRequired, requireRole('student', 'admin'), async (req, res) => {
  try {
    const subs = await Submission.find({ student: req.user._id })
      .populate(ACTIVITY_POPULATE)
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

    const submittedSubs = subs.filter((s) => s.status === 'submitted');
    const skillScores = aggregateSkillScores(submittedSubs);

    res.json({
      totalActivities: rows.length,
      pending,
      inProgress,
      completed,
      overdue,
      avgProgress,
      avgScore,
      skillScores,
      skillRecommendations: getSkillRecommendations(skillScores),
      lastActivity: rows[0] || null,
      activities: rows,
      groupedByArea: groupByArea(rows),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/student/activities?area=&status=&search=
router.get('/activities', authRequired, requireRole('student', 'admin'), async (req, res) => {
  try {
    const subs = await Submission.find({ student: req.user._id })
      .populate(ACTIVITY_POPULATE)
      .sort({ updatedAt: -1 })
      .lean();

    const all = subs.map((s) => mapActivityRow(s)).filter(Boolean);
    const activities = filterActivityRows(all, req.query);
    const groupedByArea = groupByArea(activities);

    res.json({
      activities,
      groupedByArea,
      total: all.length,
      filtered: activities.length,
    });
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
    if (!sub) sub = await Submission.create({ activity: act._id, student: req.user._id });
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

    const [genResult, aiAnalysis] = await Promise.all([
      n8nService.generateQuestionsWithFallback({
        activityId: String(act._id),
        text: act.text,
        area: act.area || 'Comunicación',
        topic: act.topic || '',
        level: 'primaria',
      }),
      aiService.analyzeText(act.text),
    ]);

    if (!genResult.ok || !genResult.questions?.length) {
      return res.status(500).json({
        error: genResult.error || 'No fue posible generar preguntas con IA. Intenta más tarde.',
      });
    }

    const questions = genResult.questions;

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
    sub.currentStep = Math.max(sub.currentStep, 3);
    sub.lastSavedAt = new Date();
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
      { $set: { aiAnalysis, currentStep: 2, lastSavedAt: new Date() } },
      { upsert: true, new: true }
    );
    res.json({ ok: true, aiAnalysis: sub.aiAnalysis });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al analizar el texto' });
  }
});

// POST /api/student/activities/:id/save-draft (manual — compatible)
router.post('/activities/:id/save-draft', authRequired, requireRole('student', 'admin'), async (req, res) => {
  try {
    const { answers = [], answer = '', currentStep } = req.body || {};
    const act = await Activity.findById(req.params.id).lean();
    const denied = assertAssigned(act, req.user._id);
    if (denied) return res.status(denied.code).json({ error: denied.error });

    const sub = await findOrCreateDraftSubmission(act._id, req.user._id);
    if (sub.status === 'submitted') {
      return res.status(400).json({ error: 'La actividad ya fue entregada' });
    }

    const updated = await persistDraft(sub, { answers, answer, currentStep });
    res.json({ ok: true, progressPercent: updated.progressPercent, lastSavedAt: updated.lastSavedAt });
  } catch (err) {
    console.error('save-draft:', err);
    const status = err.statusCode || 500;
    res.status(status).json({
      error: status === 500 ? 'No se pudo guardar el borrador. Intenta nuevamente.' : err.message,
    });
  }
});

// POST /api/student/activities/:id/autosave
router.post('/activities/:id/autosave', authRequired, requireRole('student', 'admin'), async (req, res) => {
  try {
    const { answers = [], answer = '', currentStep } = req.body || {};
    const act = await Activity.findById(req.params.id).lean();
    const denied = assertAssigned(act, req.user._id);
    if (denied) return res.status(denied.code).json({ error: denied.error });

    const sub = await findOrCreateDraftSubmission(act._id, req.user._id);
    if (sub.status === 'submitted') {
      return res.status(400).json({ error: 'La actividad ya fue entregada' });
    }

    const updated = await persistDraft(sub, { answers, answer, currentStep });
    res.json({
      ok: true,
      progressPercent: updated.progressPercent,
      lastSavedAt: updated.lastSavedAt,
      currentStep: updated.currentStep,
    });
  } catch (err) {
    console.error('autosave:', err);
    const status = err.statusCode || 500;
    res.status(status).json({
      error: status === 500 ? 'No se pudo guardar el borrador. Intenta nuevamente.' : err.message,
    });
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
    sub.skillScores = computeSkillScores(sub.questions, sub.questionAnswers);

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
    sub.currentStep = 5;
    sub.lastSavedAt = new Date();
    await sub.save();

    res.json({
      ok: true,
      status: sub.status,
      score: sub.score,
      skillScores: sub.skillScores,
      feedbackSummary: sub.feedbackSummary,
      recommendation: sub.recommendation,
      motivation: sub.motivation,
      questionAnswers: sub.questionAnswers,
      skillRecommendations: getSkillRecommendations(sub.skillScores),
    });
  } catch (err) {
    console.error('submit:', err);
    res.status(500).json({ error: 'Error al enviar la actividad' });
  }
});

// GET /api/student/activities/:id
router.get('/activities/:id', authRequired, requireRole('student', 'admin'), async (req, res) => {
  try {
    const act = await Activity.findById(req.params.id)
      .populate('createdBy', 'nombres apellidos')
      .lean();
    const denied = assertAssigned(act, req.user._id);
    if (denied) return res.status(denied.code).json({ error: denied.error });

    const sub = await Submission.findOne({ activity: act._id, student: req.user._id }).lean();
    const display = displayStatus(sub, act.dueAt);
    const teacher = act.createdBy;

    res.json({
      _id: act._id,
      title: act.title,
      area: act.area || 'Comunicación',
      topic: act.topic || '',
      instructions: act.instructions,
      text: act.text,
      sourceType: act.sourceType || 'text',
      originalFileName: act.originalFileName || '',
      dueAt: act.dueAt,
      teacherName: teacher ? `${teacher.nombres || ''} ${teacher.apellidos || ''}`.trim() : '',
      progressPercent: sub?.status === 'submitted' ? 100 : calcProgress(sub),
      status: sub?.status ?? 'draft',
      displayStatus: display,
      currentStep: sub?.currentStep ?? 1,
      lastSavedAt: sub?.lastSavedAt,
      answer: sub?.answer ?? '',
      questions: sub?.questions ?? [],
      questionAnswers: sub?.questionAnswers ?? [],
      aiAnalysis: sub?.aiAnalysis ?? {},
      questionsGenerated: !!sub?.questionsGenerated,
      score: sub?.score,
      skillScores: sub?.skillScores ?? {},
      skillRecommendations: getSkillRecommendations(sub?.skillScores ?? {}),
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
    { $set: { answer, progressPercent: Math.max(0, Math.min(100, progressPercent)), status: 'draft', lastSavedAt: new Date() } },
    { upsert: true, new: true }
  );
  res.json({ ok: true, progressPercent: sub.progressPercent });
});

// Legacy: POST /api/student/submit
router.post('/submit', authRequired, requireRole('student', 'admin'), async (req, res) => {
  const { activityId } = req.body || {};
  if (!activityId) return res.status(400).json({ error: 'activityId requerido' });

  const act = await Activity.findById(activityId).lean();
  const denied = assertAssigned(act, req.user._id);
  if (denied) return res.status(denied.code).json({ error: denied.error });

  const sub = await Submission.findOneAndUpdate(
    { activity: activityId, student: req.user._id },
    { $set: { status: 'submitted', progressPercent: 100, lastSavedAt: new Date() } },
    { upsert: true, new: true }
  );
  res.json({ ok: true, status: sub.status });
});

module.exports = router;
