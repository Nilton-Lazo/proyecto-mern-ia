const express = require('express');
const Activity = require('../models/Activity');
const Submission = require('../models/Submission');
const User = require('../models/User');
const {
  parseReportFilters,
  filterSubmissions,
  buildTeacherSummary,
  buildTeacherSkillMap,
  buildTeacherStudentRanking,
  buildTeacherAreaTopicReport,
  buildActivityDifficulty,
  buildRecentAnswers,
  buildPedagogicalAlerts,
  buildTeacherRecommendations,
  buildTeacherEvidence,
  aggregateSkillScores,
  submissionsToCsv,
} = require('../utils/reportHelpers');
const { generateTeacherReportPdf } = require('../services/reportPdfService');

const router = express.Router();

const SUB_POPULATE = [
  { path: 'activity', select: 'title area topic dueAt createdAt assignees createdBy' },
  { path: 'student', select: 'nombres apellidos email' },
];

async function loadTeacherContext(teacherId, filters) {
  const activities = await Activity.find({ createdBy: teacherId }).sort({ createdAt: -1 }).lean();
  const activityIds = activities.map((a) => a._id);
  const assigneeIds = [...new Set(activities.flatMap((a) => (a.assignees || []).map(String)))];

  const students = assigneeIds.length
    ? await User.find({ _id: { $in: assigneeIds }, role: 'student' })
        .select('_id nombres apellidos email')
        .lean()
    : [];

  let subs = activityIds.length
    ? await Submission.find({ activity: { $in: activityIds } })
        .populate(SUB_POPULATE)
        .sort({ updatedAt: -1 })
        .lean()
    : [];

  subs = filterSubmissions(subs, filters);
  return { activities, subs, students };
}

router.get('/summary', async (req, res) => {
  try {
    const filters = parseReportFilters(req.query);
    const { activities, subs, students } = await loadTeacherContext(req.user._id, filters);
    const summary = buildTeacherSummary(activities, subs, students);
    res.json({ ok: true, summary, teacher: {
      id: req.user._id,
      nombres: req.user.nombres,
      apellidos: req.user.apellidos,
      email: req.user.email,
    }});
  } catch (err) {
    console.error('teacher reports/summary:', err);
    res.status(500).json({ error: 'No se pudieron cargar los reportes del grupo.' });
  }
});

router.get('/skills', async (req, res) => {
  try {
    const filters = parseReportFilters(req.query);
    const { subs } = await loadTeacherContext(req.user._id, filters);
    const submitted = subs.filter((s) => s.status === 'submitted');
    const skillScores = aggregateSkillScores(submitted);
    res.json({
      ok: true,
      skillScores,
      skills: buildTeacherSkillMap(skillScores),
      hasData: submitted.length > 0,
    });
  } catch (err) {
    console.error('teacher reports/skills:', err);
    res.status(500).json({ error: 'No se pudieron cargar las habilidades del grupo.' });
  }
});

router.get('/students', async (req, res) => {
  try {
    const filters = parseReportFilters(req.query);
    const { activities, subs, students } = await loadTeacherContext(req.user._id, filters);
    const ranking = buildTeacherStudentRanking(activities, subs, students);
    res.json({ ok: true, students: ranking, hasData: ranking.length > 0 });
  } catch (err) {
    console.error('teacher reports/students:', err);
    res.status(500).json({ error: 'No se pudo cargar el ranking de estudiantes.' });
  }
});

router.get('/areas', async (req, res) => {
  try {
    const filters = parseReportFilters(req.query);
    const { activities, subs } = await loadTeacherContext(req.user._id, filters);
    res.json({
      ok: true,
      areas: buildTeacherAreaTopicReport(activities, subs),
      hasData: activities.length > 0,
    });
  } catch (err) {
    console.error('teacher reports/areas:', err);
    res.status(500).json({ error: 'No se pudieron cargar los reportes por área.' });
  }
});

router.get('/activities-difficulty', async (req, res) => {
  try {
    const filters = parseReportFilters(req.query);
    const { activities, subs } = await loadTeacherContext(req.user._id, filters);
    res.json({
      ok: true,
      activities: buildActivityDifficulty(activities, subs),
      hasData: activities.length > 0,
    });
  } catch (err) {
    console.error('teacher reports/activities-difficulty:', err);
    res.status(500).json({ error: 'No se pudieron cargar las actividades.' });
  }
});

router.get('/recent-answers', async (req, res) => {
  try {
    const filters = parseReportFilters(req.query);
    const { subs } = await loadTeacherContext(req.user._id, filters);
    res.json({
      ok: true,
      answers: buildRecentAnswers(subs),
      hasData: subs.some((s) => s.status === 'submitted'),
    });
  } catch (err) {
    console.error('teacher reports/recent-answers:', err);
    res.status(500).json({ error: 'No se pudieron cargar las respuestas.' });
  }
});

router.get('/alerts', async (req, res) => {
  try {
    const filters = parseReportFilters(req.query);
    const { activities, subs, students } = await loadTeacherContext(req.user._id, filters);
    const summary = buildTeacherSummary(activities, subs, students);
    const skillScores = aggregateSkillScores(subs.filter((s) => s.status === 'submitted'));
    const areas = buildTeacherAreaTopicReport(activities, subs);
    const ranking = buildTeacherStudentRanking(activities, subs, students);
    res.json({
      ok: true,
      alerts: buildPedagogicalAlerts(summary, skillScores, areas, ranking),
    });
  } catch (err) {
    console.error('teacher reports/alerts:', err);
    res.status(500).json({ error: 'No se pudieron cargar las alertas.' });
  }
});

router.get('/recommendations', async (req, res) => {
  try {
    const filters = parseReportFilters(req.query);
    const { activities, subs, students } = await loadTeacherContext(req.user._id, filters);
    const summary = buildTeacherSummary(activities, subs, students);
    const skillScores = aggregateSkillScores(subs.filter((s) => s.status === 'submitted'));
    const difficulty = buildActivityDifficulty(activities, subs);
    const ranking = buildTeacherStudentRanking(activities, subs, students);
    res.json({
      ok: true,
      recommendations: buildTeacherRecommendations(summary, skillScores, difficulty, ranking),
      evidence: buildTeacherEvidence(subs),
      hasData: subs.length > 0,
    });
  } catch (err) {
    console.error('teacher reports/recommendations:', err);
    res.status(500).json({ error: 'No se pudieron cargar las recomendaciones.' });
  }
});

router.get('/export-pdf', async (req, res) => {
  try {
    const filters = parseReportFilters(req.query);
    const { activities, subs, students } = await loadTeacherContext(req.user._id, filters);
    if (!activities.length) {
      return res.status(400).json({ error: 'No hay datos suficientes para generar el PDF.' });
    }
    const summary = buildTeacherSummary(activities, subs, students);
    const skillScores = aggregateSkillScores(subs.filter((s) => s.status === 'submitted'));
    const ranking = buildTeacherStudentRanking(activities, subs, students);
    const difficulty = buildActivityDifficulty(activities, subs);
    generateTeacherReportPdf(res, {
      teacher: req.user,
      summary,
      skills: buildTeacherSkillMap(skillScores),
      students: ranking,
      difficulty,
      recommendations: buildTeacherRecommendations(summary, skillScores, difficulty, ranking),
    });
  } catch (err) {
    console.error('teacher reports/export-pdf:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'No se pudo generar el PDF.' });
    }
  }
});

router.get('/export-csv', async (req, res) => {
  try {
    const filters = parseReportFilters(req.query);
    const { activities, subs, students } = await loadTeacherContext(req.user._id, filters);
    const ranking = buildTeacherStudentRanking(activities, subs, students);
    if (!ranking.length) {
      return res.status(400).json({ error: 'No hay datos para exportar.' });
    }
    const csv = submissionsToCsv(ranking);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="reporte-grupo.csv"');
    res.send('\uFEFF' + csv);
  } catch (err) {
    console.error('teacher reports/export-csv:', err);
    res.status(500).json({ error: 'No se pudo exportar CSV.' });
  }
});

module.exports = router;
