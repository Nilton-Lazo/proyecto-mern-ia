const express = require('express');
const multer = require('multer');
const Activity = require('../models/Activity');
const Submission = require('../models/Submission');
const User = require('../models/User');
const authRequired = require('../middlewares/auth');
const requireRole = require('../middlewares/roles');
const { isValidArea, DEFAULT_AREA } = require('../constants/curricularAreas');
const { extractTextFromPdf, MAX_PDF_BYTES } = require('../services/pdfService');

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_PDF_BYTES },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.originalname?.toLowerCase().endsWith('.pdf')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos PDF'));
    }
  },
});

// GET /api/teacher/students?search=
router.get('/students', authRequired, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const q = (req.query.search || '').trim();
    const filter = { role: 'student' };
    if (q) {
      const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ nombres: rx }, { apellidos: rx }, { email: rx }];
    }
    const students = await User.find(filter)
      .select('_id nombres apellidos email')
      .sort({ apellidos: 1, nombres: 1 })
      .lean();
    res.json({ students, total: students.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/teacher/extract-pdf
router.post(
  '/extract-pdf',
  authRequired,
  requireRole('teacher', 'admin'),
  upload.single('file'),
  async (req, res) => {
    try {
      if (!req.file?.buffer) {
        return res.status(400).json({ error: 'Debes enviar un archivo PDF (campo "file")' });
      }
      const result = await extractTextFromPdf(req.file.buffer);
      res.json({
        ok: true,
        text: result.text,
        pages: result.pages,
        charCount: result.charCount,
        originalFileName: req.file.originalname,
        sourceType: 'pdf',
      });
    } catch (err) {
      console.error('extract-pdf:', err);
      res.status(400).json({ error: err.message || 'No se pudo procesar el PDF' });
    }
  }
);

// POST /api/teacher/activities
router.post('/activities', authRequired, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const {
      title,
      area = DEFAULT_AREA,
      topic = '',
      instructions = '',
      text,
      dueAt = null,
      assignees = [],
      sourceType = 'text',
      originalFileName = '',
    } = req.body || {};

    if (!title?.trim() || !text?.trim() || !Array.isArray(assignees) || assignees.length === 0) {
      return res.status(400).json({ error: 'Faltan datos (title, text, assignees[])' });
    }

    const act = await Activity.create({
      title: title.trim(),
      area: isValidArea(area) ? area : DEFAULT_AREA,
      topic: String(topic).trim(),
      instructions,
      text: text.trim(),
      sourceType: ['text', 'pdf', 'markdown'].includes(sourceType) ? sourceType : 'text',
      originalFileName: originalFileName || '',
      dueAt,
      assignees,
      createdBy: req.user._id,
    });

    if (assignees.length) {
      const docs = assignees.map((s) => ({
        activity: act._id,
        student: s,
        progressPercent: 0,
        status: 'draft',
      }));
      await Submission.insertMany(docs, { ordered: false }).catch(() => {});
    }

    res.status(201).json({ ok: true, activityId: act._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/teacher/activities/summary
router.get('/activities/summary', authRequired, requireRole('teacher', 'admin'), async (req, res) => {
  const acts = await Activity.find({ createdBy: req.user._id }).sort({ createdAt: -1 }).lean();

  const ids = acts.map((a) => a._id);
  const subs = await Submission.aggregate([
    { $match: { activity: { $in: ids } } },
    {
      $group: {
        _id: '$activity',
        entregas: { $sum: { $cond: [{ $eq: ['$status', 'submitted'] }, 1, 0] } },
        avgProgress: { $avg: '$progressPercent' },
        countSubs: { $sum: 1 },
      },
    },
  ]);

  const map = new Map(subs.map((s) => [String(s._id), s]));
  const rows = acts.map((a) => {
    const s = map.get(String(a._id)) || { entregas: 0, avgProgress: 0, countSubs: 0 };
    return {
      _id: a._id,
      titulo: a.title,
      area: a.area,
      tema: a.topic,
      estudiantesAsignados: a.assignees.length || s.countSubs,
      entregas: s.entregas,
      progresoPromedio: Math.round(s.avgProgress || 0),
      creadaEn: a.createdAt,
    };
  });

  const countActivities = acts.length;
  const uniqueStudents = new Set(acts.flatMap((a) => a.assignees.map(String)));
  const avgProgress = rows.length
    ? Math.round(rows.reduce((acc, r) => acc + r.progresoPromedio, 0) / rows.length)
    : 0;

  res.json({
    countActivities,
    countStudents: uniqueStudents.size,
    avgProgress,
    activities: rows,
  });
});

module.exports = router;
