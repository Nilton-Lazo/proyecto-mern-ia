const express = require('express');
const Activity = require('../models/Activity');
const Submission = require('../models/Submission');
const authRequired = require('../middlewares/auth');
const requireRole = require('../middlewares/roles');

const router = express.Router();

// GET /api/student/activities  (lista asignadas al alumno)
router.get('/activities', authRequired, requireRole('student','admin'), async (req, res) => {
  const subs = await Submission.find({ student: req.user._id })
    .populate({ path:'activity', select:'title createdAt dueAt' })
    .sort({ updatedAt: -1 }).lean();

  const rows = subs.map(s => ({
    _id: s.activity?._id,
    titulo: s.activity?.title,
    dueAt: s.activity?.dueAt,
    progreso: s.progressPercent,
    status: s.status,
    actualizada: s.updatedAt
  }));

  res.json({ activities: rows });
});

// GET /api/student/activities/:id  (detalle para trabajar)
router.get('/activities/:id', authRequired, requireRole('student','admin'), async (req, res) => {
  const act = await Activity.findById(req.params.id).lean();
  if (!act) return res.status(404).json({ error: 'No existe' });
  if (!act.assignees.map(String).includes(String(req.user._id))) {
    return res.status(403).json({ error: 'No asignada a este estudiante' });
  }
  const sub = await Submission.findOne({ activity: act._id, student: req.user._id }).lean();
  res.json({
    _id: act._id,
    title: act.title,
    instructions: act.instructions,
    text: act.text,
    dueAt: act.dueAt,
    progressPercent: sub?.progressPercent ?? 0,
    status: sub?.status ?? 'draft',
    answer: sub?.answer ?? ''
  });
});

// POST /api/student/progress  (guardar borrador + %)
router.post('/progress', authRequired, requireRole('student','admin'), async (req, res) => {
  const { activityId, answer='', progressPercent=0 } = req.body || {};
  if (!activityId) return res.status(400).json({ error: 'activityId requerido' });

  const act = await Activity.findById(activityId).lean();
  if (!act) return res.status(404).json({ error: 'Actividad no existe' });
  if (!act.assignees.map(String).includes(String(req.user._id))) {
    return res.status(403).json({ error: 'No asignada' });
  }

  const sub = await Submission.findOneAndUpdate(
    { activity: activityId, student: req.user._id },
    { $set: { answer, progressPercent: Math.max(0, Math.min(100, progressPercent)), status: 'draft' } },
    { upsert: true, new: true }
  );
  res.json({ ok: true, progressPercent: sub.progressPercent });
});

// POST /api/student/submit  (entregar)
router.post('/submit', authRequired, requireRole('student','admin'), async (req, res) => {
  const { activityId } = req.body || {};
  if (!activityId) return res.status(400).json({ error: 'activityId requerido' });

  const act = await Activity.findById(activityId).lean();
  if (!act) return res.status(404).json({ error: 'Actividad no existe' });
  if (!act.assignees.map(String).includes(String(req.user._id))) {
    return res.status(403).json({ error: 'No asignada' });
  }

  const sub = await Submission.findOneAndUpdate(
    { activity: activityId, student: req.user._id },
    { $set: { status: 'submitted', progressPercent: 100 } },
    { upsert: true, new: true }
  );
  res.json({ ok: true, status: sub.status });
});

module.exports = router;