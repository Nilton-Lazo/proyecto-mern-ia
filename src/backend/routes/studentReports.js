const express = require('express');
const Submission = require('../models/Submission');
const {
  parseReportFilters,
  filterSubmissions,
  buildStudentSummary,
  buildSkillMap,
  buildAreaPerformance,
  buildTimeline,
  buildRecentActivities,
  buildRecentFeedback,
  buildPersonalRecommendations,
  buildLearningEvidence,
  aggregateSkillScores,
  getSkillRecommendations,
} = require('../utils/reportHelpers');
const { generateStudentReportPdf } = require('../services/reportPdfService');

const router = express.Router();

const POPULATE = {
  path: 'activity',
  select: 'title area topic dueAt createdAt createdBy',
};

async function loadStudentSubmissions(userId, filters) {
  const subs = await Submission.find({ student: userId })
    .populate(POPULATE)
    .sort({ updatedAt: -1 })
    .lean();
  return filterSubmissions(subs, filters);
}

router.get('/summary', async (req, res) => {
  try {
    const filters = parseReportFilters(req.query);
    const subs = await loadStudentSubmissions(req.user._id, filters);
    const summary = buildStudentSummary(subs, req.user);
    res.json({ ok: true, summary, filters: req.query });
  } catch (err) {
    console.error('student reports/summary:', err);
    res.status(500).json({ error: 'No se pudieron cargar los reportes.' });
  }
});

router.get('/skills', async (req, res) => {
  try {
    const filters = parseReportFilters(req.query);
    const subs = await loadStudentSubmissions(req.user._id, filters);
    const submitted = subs.filter((s) => s.status === 'submitted');
    const skillScores = aggregateSkillScores(submitted);
    const recommendations = getSkillRecommendations(skillScores);
    const skills = buildSkillMap(skillScores, recommendations);
    res.json({
      ok: true,
      skillScores,
      skills,
      recommendations,
      hasData: submitted.length > 0,
    });
  } catch (err) {
    console.error('student reports/skills:', err);
    res.status(500).json({ error: 'No se pudieron cargar las habilidades.' });
  }
});

router.get('/areas', async (req, res) => {
  try {
    const filters = parseReportFilters(req.query);
    const subs = await loadStudentSubmissions(req.user._id, filters);
    res.json({ ok: true, areas: buildAreaPerformance(subs), hasData: subs.length > 0 });
  } catch (err) {
    console.error('student reports/areas:', err);
    res.status(500).json({ error: 'No se pudieron cargar las áreas.' });
  }
});

router.get('/timeline', async (req, res) => {
  try {
    const filters = parseReportFilters(req.query);
    const subs = await loadStudentSubmissions(req.user._id, filters);
    res.json({ ok: true, timeline: buildTimeline(subs), hasData: subs.length > 0 });
  } catch (err) {
    console.error('student reports/timeline:', err);
    res.status(500).json({ error: 'No se pudo cargar la evolución.' });
  }
});

router.get('/recent-feedback', async (req, res) => {
  try {
    const filters = parseReportFilters(req.query);
    const subs = await loadStudentSubmissions(req.user._id, filters);
    res.json({
      ok: true,
      feedback: buildRecentFeedback(subs),
      activities: buildRecentActivities(subs),
      hasData: subs.some((s) => s.status === 'submitted'),
    });
  } catch (err) {
    console.error('student reports/recent-feedback:', err);
    res.status(500).json({ error: 'No se pudo cargar la retroalimentación.' });
  }
});

router.get('/recommendations', async (req, res) => {
  try {
    const filters = parseReportFilters(req.query);
    const subs = await loadStudentSubmissions(req.user._id, filters);
    const submitted = subs.filter((s) => s.status === 'submitted');
    const skillScores = aggregateSkillScores(submitted);
    const summary = buildStudentSummary(subs, req.user);
    const areas = buildAreaPerformance(subs);
    const recommendations = buildPersonalRecommendations(summary, skillScores, areas);
    const evidence = buildLearningEvidence(subs);
    res.json({
      ok: true,
      recommendations,
      evidence,
      hasData: recommendations.length > 0,
    });
  } catch (err) {
    console.error('student reports/recommendations:', err);
    res.status(500).json({ error: 'No se pudieron cargar las recomendaciones.' });
  }
});

router.get('/export-pdf', async (req, res) => {
  try {
    const filters = parseReportFilters(req.query);
    const subs = await loadStudentSubmissions(req.user._id, filters);
    const submitted = subs.filter((s) => s.status === 'submitted');
    if (!subs.length) {
      return res.status(400).json({ error: 'No hay datos suficientes para generar el PDF.' });
    }
    const skillScores = aggregateSkillScores(submitted);
    const recommendations = getSkillRecommendations(skillScores);
    const data = {
      summary: buildStudentSummary(subs, req.user),
      skills: buildSkillMap(skillScores, recommendations),
      recentActivities: buildRecentActivities(subs, 5),
      recommendations: buildPersonalRecommendations(
        buildStudentSummary(subs, req.user),
        skillScores,
        buildAreaPerformance(subs)
      ),
    };
    generateStudentReportPdf(res, data);
  } catch (err) {
    console.error('student reports/export-pdf:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'No se pudo generar el PDF.' });
    }
  }
});

module.exports = router;
