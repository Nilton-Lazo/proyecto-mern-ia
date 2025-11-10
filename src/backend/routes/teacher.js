const express = require('express');
const Activity = require('../models/Activity');
const Submission = require('../models/Submission');
const User = require('../models/User');
const authRequired = require('../middlewares/auth');   // tu JWT middleware
const requireRole = require('../middlewares/roles');

const router = express.Router();

// GET /api/teacher/students  (catálogo simple)
router.get('/students', authRequired, requireRole('teacher','admin'), async (req, res) => {
  const students = await User.find({ role: 'student' })
    .select('_id nombres apellidos email')
    .sort({ apellidos: 1 }).lean();
  res.json({ students });
});

// POST /api/teacher/activities  (crear y pre-crear submissions en draft)
router.post('/activities', authRequired, requireRole('teacher','admin'), async (req, res) => {
  const { title, instructions='', text, dueAt=null, assignees=[] } = req.body || {};
  if (!title || !text || !Array.isArray(assignees) || assignees.length === 0) {
    return res.status(400).json({ error: 'Faltan datos (title, text, assignees[])' });
  }

  const act = await Activity.create({
    title, instructions, text, dueAt, assignees, createdBy: req.user._id
  });

  // Creamos submissions en draft con 0%
  if (assignees.length) {
    const docs = assignees.map(s => ({
      activity: act._id,
      student: s,
      progressPercent: 0,
      status: 'draft'
    }));
    await Submission.insertMany(docs, { ordered: false }).catch(()=>{});
  }

  res.status(201).json({ ok: true, activityId: act._id });
});

// GET /api/teacher/activities/summary  (KPI + tabla)
router.get('/activities/summary', authRequired, requireRole('teacher','admin'), async (req, res) => {
  // actividades creadas por el docente
  const acts = await Activity.find({ createdBy: req.user._id })
    .sort({ createdAt: -1 }).lean();

  // agregamos datos de submissions
  const ids = acts.map(a => a._id);
  const subs = await Submission.aggregate([
    { $match: { activity: { $in: ids } } },
    { $group: {
        _id: '$activity',
        entregas: { $sum: { $cond: [{ $eq: ['$status','submitted'] }, 1, 0] } },
        avgProgress: { $avg: '$progressPercent' },
        countSubs: { $sum: 1 }
    } }
  ]);

  const map = new Map(subs.map(s => [String(s._id), s]));
  const rows = acts.map(a => {
    const s = map.get(String(a._id)) || { entregas:0, avgProgress:0, countSubs:0 };
    return {
      _id: a._id,
      titulo: a.title,
      estudiantesAsignados: a.assignees.length || s.countSubs,
      entregas: s.entregas,
      progresoPromedio: Math.round(s.avgProgress || 0),
      creadaEn: a.createdAt
    };
  });

  // KPIs
  const countActivities = acts.length;
  const uniqueStudents = new Set(acts.flatMap(a => a.assignees.map(String)));
  const avgProgress = rows.length ? Math.round(rows.reduce((acc,r)=>acc+r.progresoPromedio,0)/rows.length) : 0;

  res.json({
    countActivities,
    countStudents: uniqueStudents.size,
    avgProgress,
    activities: rows
  });
});

module.exports = router;