const Submission = require('../models/Submission');
const { computeSkillScores, aggregateSkillScores, getSkillRecommendations } = require('../utils/skillScoring');

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
  if (!act || typeof act !== 'object') return null;
  const teacher = act.createdBy;
  const teacherName =
    teacher && typeof teacher === 'object'
      ? `${teacher.nombres || ''} ${teacher.apellidos || ''}`.trim()
      : '';

  const st = displayStatus(sub, act.dueAt);
  return {
    _id: act._id,
    titulo: act.title,
    area: act.area || 'Comunicación',
    tema: act.topic || '',
    descripcion: act.instructions || '',
    docente: teacherName,
    dueAt: act.dueAt,
    progreso: sub.status === 'submitted' ? 100 : calcProgress(sub),
    status: sub.status,
    displayStatus: st,
    preguntasCount: sub.questions?.length ?? 0,
    questionsGenerated: !!sub.questionsGenerated,
    actualizada: sub.updatedAt,
    lastSavedAt: sub.lastSavedAt,
    score: sub.score,
  };
}

function filterActivityRows(rows, { area, status, search }) {
  let result = rows;
  if (area && area !== 'todas' && area !== 'all') {
    result = result.filter((r) => r.area === area);
  }
  if (status && status !== 'todas' && status !== 'all') {
    result = result.filter((r) => r.displayStatus === status);
  }
  const q = (search || '').trim().toLowerCase();
  if (q) {
    result = result.filter(
      (r) =>
        (r.titulo || '').toLowerCase().includes(q) ||
        (r.tema || '').toLowerCase().includes(q) ||
        (r.docente || '').toLowerCase().includes(q) ||
        (r.area || '').toLowerCase().includes(q)
    );
  }
  return result;
}

function groupByArea(rows) {
  const groups = {};
  rows.forEach((r) => {
    const key = r.area || 'Otro';
    if (!groups[key]) {
      groups[key] = { area: key, activities: [], stats: { total: 0, pendiente: 0, en_progreso: 0, entregada: 0, vencida: 0 } };
    }
    groups[key].activities.push(r);
    groups[key].stats.total++;
    const st = r.displayStatus;
    if (groups[key].stats[st] != null) groups[key].stats[st]++;
  });
  return Object.values(groups).sort((a, b) => a.area.localeCompare(b.area, 'es'));
}

function buildDraftUpdate(sub, { answers, answer, currentStep }) {
  let questionAnswers = sub.questionAnswers;
  if (Array.isArray(answers) && answers.length > 0) {
    questionAnswers = answers.map((a, i) => ({
      questionIndex: a.questionIndex ?? i,
      answer: a.answer ?? '',
      feedback: sub.questionAnswers?.[i]?.feedback || a.feedback || '',
      isCorrect: sub.questionAnswers?.[i]?.isCorrect || a.isCorrect || '',
    }));
  }

  const nextStep =
    currentStep != null
      ? Math.max(1, Math.min(5, Number(currentStep) || 1))
      : sub.currentStep ?? 1;

  const draftView = {
    ...(typeof sub.toObject === 'function' ? sub.toObject() : sub),
    questionAnswers,
    answer: answer || sub.answer,
    currentStep: nextStep,
    status: 'draft',
  };

  const update = {
    questionAnswers,
    currentStep: nextStep,
    progressPercent: calcProgress(draftView),
    status: 'draft',
    lastSavedAt: new Date(),
  };
  if (answer) update.answer = answer;
  return update;
}

/** Evita duplicados si save-draft y autosave corren a la vez al crear el submission */
async function findOrCreateDraftSubmission(activityId, studentId) {
  let sub = await Submission.findOne({ activity: activityId, student: studentId });
  if (sub) return sub;
  try {
    return await Submission.create({ activity: activityId, student: studentId });
  } catch (err) {
    if (err?.code === 11000) {
      return Submission.findOne({ activity: activityId, student: studentId });
    }
    throw err;
  }
}

/** Actualización atómica — evita VersionError por guardado manual + autosave simultáneo */
async function persistDraft(sub, { answers, answer, currentStep }) {
  const update = buildDraftUpdate(sub, { answers, answer, currentStep });
  const updated = await Submission.findOneAndUpdate(
    { _id: sub._id, status: { $ne: 'submitted' } },
    { $set: update },
    { new: true }
  );
  if (!updated) {
    const err = new Error('La actividad ya fue entregada.');
    err.statusCode = 400;
    throw err;
  }
  return updated;
}

module.exports = {
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
};
