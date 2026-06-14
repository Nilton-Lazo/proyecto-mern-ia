const {
  SKILL_TYPES,
  SKILL_LABELS,
  SKILL_RECOMMENDATIONS,
  aggregateSkillScores,
  getSkillRecommendations,
} = require('./skillScoring');
const { displayStatus, calcProgress } = require('../routes/studentHelpers');

const SKILL_LEVEL_LABELS = {
  bajo: 'Bajo',
  en_proceso: 'En proceso',
  logrado: 'Logrado',
  destacado: 'Destacado',
};

const TEACHER_SKILL_RECOMMENDATIONS = {
  literal: 'Programar lecturas con preguntas de ubicación y datos explícitos.',
  inferential: 'Incluir preguntas donde el estudiante deduzca información implícita.',
  critical: 'Programar actividades con preguntas abiertas y argumentativas.',
  vocabulary: 'Asignar actividades cortas de vocabulario contextual.',
  main_idea: 'Practicar resúmenes por párrafo antes de responder.',
};

function getSkillLevel(pct) {
  if (pct == null || Number.isNaN(pct)) return null;
  if (pct >= 90) return 'destacado';
  if (pct >= 75) return 'logrado';
  if (pct >= 50) return 'en_proceso';
  return 'bajo';
}

function parsePeriod(period) {
  if (!period || period === 'all' || period === 'todas') return null;
  const now = new Date();
  const start = new Date(now);
  if (period === 'week' || period === 'semana') start.setDate(now.getDate() - 7);
  else if (period === 'month' || period === 'mes') start.setDate(now.getDate() - 30);
  else if (period === 'semester' || period === 'semestre') start.setMonth(now.getMonth() - 6);
  else return null;
  return start;
}

function parseReportFilters(query = {}) {
  return {
    area: query.area && query.area !== 'todas' && query.area !== 'all' ? query.area : null,
    status: query.status && query.status !== 'todas' && query.status !== 'all' ? query.status : null,
    topic: query.topic?.trim() || null,
    studentId: query.studentId || query.student || null,
    period: parsePeriod(query.period),
  };
}

function filterSubmissions(subs, filters) {
  let result = subs;
  if (filters.period) {
    result = result.filter((s) => new Date(s.updatedAt) >= filters.period);
  }
  if (filters.area) {
    result = result.filter((s) => (s.activity?.area || 'Comunicación') === filters.area);
  }
  if (filters.topic) {
    const t = filters.topic.toLowerCase();
    result = result.filter((s) => (s.activity?.topic || '').toLowerCase().includes(t));
  }
  if (filters.studentId) {
    result = result.filter((s) => String(s.student?._id || s.student) === String(filters.studentId));
  }
  if (filters.status) {
    result = result.filter((s) => {
      const st = displayStatus(s, s.activity?.dueAt);
      return st === filters.status;
    });
  }
  return result;
}

function countAnswerStats(sub) {
  let correct = 0;
  let partial = 0;
  let incorrect = 0;
  (sub.questionAnswers || []).forEach((a) => {
    if (!a.answer?.trim()) return;
    if (a.isCorrect === 'correcta') correct++;
    else if (a.isCorrect === 'parcial') partial++;
    else incorrect++;
  });
  return { correct, partial, incorrect, total: correct + partial + incorrect };
}

function buildSkillMap(skillScores = {}, recommendations = []) {
  const recMap = Object.fromEntries(recommendations.map((r) => [r.skill, r.message]));
  return SKILL_TYPES.map((skill) => {
    const pct = skillScores[skill];
    const level = getSkillLevel(pct);
    return {
      skill,
      label: SKILL_LABELS[skill],
      percentage: pct,
      level,
      levelLabel: level ? SKILL_LEVEL_LABELS[level] : null,
      recommendation: pct == null
        ? 'Completa actividades evaluadas para medir esta habilidad.'
        : recMap[skill] || SKILL_RECOMMENDATIONS[skill],
    };
  }).filter((s) => s.percentage != null || true);
}

function buildTeacherSkillMap(skillScores = {}) {
  return SKILL_TYPES.map((skill) => {
    const pct = skillScores[skill];
    const level = getSkillLevel(pct);
    return {
      skill,
      label: SKILL_LABELS[skill],
      percentage: pct,
      level,
      levelLabel: level ? SKILL_LEVEL_LABELS[level] : null,
      recommendation: pct == null
        ? 'Sin datos suficientes del grupo.'
        : TEACHER_SKILL_RECOMMENDATIONS[skill],
    };
  });
}

function findStrongestWeakest(skillScores = {}) {
  const entries = SKILL_TYPES
    .map((s) => ({ skill: s, label: SKILL_LABELS[s], value: skillScores[s] }))
    .filter((e) => e.value != null);
  if (!entries.length) return { strongest: null, weakest: null };
  const sorted = [...entries].sort((a, b) => b.value - a.value);
  return { strongest: sorted[0], weakest: sorted[sorted.length - 1] };
}

function buildStudentSummary(subs, user) {
  const rows = subs.map((s) => {
    const act = s.activity;
    const st = displayStatus(s, act?.dueAt);
    return {
      activityId: act?._id,
      titulo: act?.title || '',
      area: act?.area || 'Comunicación',
      tema: act?.topic || '',
      progreso: s.status === 'submitted' ? 100 : calcProgress(s),
      displayStatus: st,
      score: s.score,
      updatedAt: s.updatedAt,
    };
  });

  const completed = rows.filter((r) => r.displayStatus === 'entregada').length;
  const inProgress = rows.filter((r) => r.displayStatus === 'en_progreso').length;
  const pending = rows.filter((r) => r.displayStatus === 'pendiente').length;
  const overdue = rows.filter((r) => r.displayStatus === 'vencida').length;
  const avgProgress = rows.length
    ? Math.round(rows.reduce((a, r) => a + r.progreso, 0) / rows.length)
    : 0;

  const submitted = subs.filter((s) => s.status === 'submitted');
  const scores = submitted.filter((s) => s.score != null).map((s) => s.score);
  const avgComprehension = scores.length
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : null;

  let totalQuestions = 0;
  submitted.forEach((s) => {
    totalQuestions += countAnswerStats(s).total;
  });

  const lastWorked = rows.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0];

  return {
    student: {
      id: user._id,
      nombres: user.nombres,
      apellidos: user.apellidos,
      email: user.email,
      role: user.role,
    },
    assigned: rows.length,
    completed,
    inProgress,
    pending,
    overdue,
    avgProgress,
    avgComprehension,
    totalQuestionsAnswered: totalQuestions,
    lastActivity: lastWorked || null,
    hasData: rows.length > 0,
  };
}

function buildAreaPerformance(subs) {
  const groups = {};
  subs.forEach((s) => {
    const area = s.activity?.area || 'Comunicación';
    if (!groups[area]) {
      groups[area] = { area, completed: 0, total: 0, scores: [], topics: {} };
    }
    groups[area].total++;
    const st = displayStatus(s, s.activity?.dueAt);
    if (st === 'entregada') groups[area].completed++;
    if (s.score != null) groups[area].scores.push(s.score);
    const topic = s.activity?.topic || 'Sin tema';
    groups[area].topics[topic] = (groups[area].topics[topic] || 0) + 1;
  });

  return Object.values(groups)
    .map((g) => {
      const avg = g.scores.length
        ? Math.round(g.scores.reduce((a, b) => a + b, 0) / g.scores.length)
        : null;
      const topTopic = Object.entries(g.topics).sort((a, b) => b[1] - a[1])[0];
      let status = 'sin_datos';
      if (avg != null) {
        if (avg >= 75) status = 'adecuado';
        else if (avg >= 50) status = 'en_seguimiento';
        else status = 'requiere_apoyo';
      }
      return {
        area: g.area,
        completed: g.completed,
        total: g.total,
        avgComprehension: avg,
        status,
        topTopic: topTopic ? topTopic[0] : null,
      };
    })
    .sort((a, b) => a.area.localeCompare(b.area, 'es'));
}

function buildTimeline(subs) {
  const byWeek = {};
  subs.forEach((s) => {
    const d = new Date(s.updatedAt);
    const weekKey = `${d.getFullYear()}-W${Math.ceil((d.getDate() + 6 - d.getDay()) / 7)}-${d.getMonth()}`;
    if (!byWeek[weekKey]) byWeek[weekKey] = { date: d.toISOString().slice(0, 10), completed: 0, avgScore: [], progress: [] };
    if (s.status === 'submitted') byWeek[weekKey].completed++;
    if (s.score != null) byWeek[weekKey].avgScore.push(s.score);
    byWeek[weekKey].progress.push(s.status === 'submitted' ? 100 : calcProgress(s));
  });

  return Object.values(byWeek)
    .map((w) => ({
      date: w.date,
      completed: w.completed,
      avgComprehension: w.avgScore.length
        ? Math.round(w.avgScore.reduce((a, b) => a + b, 0) / w.avgScore.length)
        : null,
      avgProgress: w.progress.length
        ? Math.round(w.progress.reduce((a, b) => a + b, 0) / w.progress.length)
        : 0,
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-12);
}

function buildRecentActivities(subs, limit = 10) {
  return subs
    .filter((s) => s.status === 'submitted')
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, limit)
    .map((s) => {
      const { strongest, weakest } = findStrongestWeakest(s.skillScores || {});
      return {
        activityId: s.activity?._id,
        titulo: s.activity?.title || '',
        area: s.activity?.area || 'Comunicación',
        tema: s.activity?.topic || '',
        fecha: s.updatedAt,
        estado: 'entregada',
        score: s.score,
        strongestSkill: strongest?.label || null,
        weakestSkill: weakest?.label || null,
      };
    });
}

function buildRecentFeedback(subs, limit = 8) {
  const items = [];
  subs
    .filter((s) => s.status === 'submitted')
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .forEach((s) => {
      (s.questionAnswers || []).forEach((ans, i) => {
        if (!ans.feedback?.trim() || !ans.answer?.trim()) return;
        const q = s.questions?.[i];
        items.push({
          activityId: s.activity?._id,
          activityTitle: s.activity?.title || '',
          area: s.activity?.area || 'Comunicación',
          question: q?.questionText || `Pregunta ${i + 1}`,
          answer: ans.answer,
          feedback: ans.feedback,
          skill: q?.type || 'literal',
          skillLabel: SKILL_LABELS[q?.type] || SKILL_LABELS.literal,
          evaluation: ans.isCorrect || 'parcial',
          recommendation: SKILL_RECOMMENDATIONS[q?.type] || '',
          fecha: s.updatedAt,
        });
      });
    });
  return items.slice(0, limit);
}

function buildPersonalRecommendations(summary, skillScores, areas) {
  const recs = [];
  const { weakest } = findStrongestWeakest(skillScores);
  if (weakest && weakest.value < 60) {
    recs.push(`Refuerza ${weakest.label.toLowerCase()}.`);
  }
  getSkillRecommendations(skillScores)
    .filter((r) => r.level === 'bajo')
    .slice(0, 2)
    .forEach((r) => recs.push(r.message));

  const { strongest } = findStrongestWeakest(skillScores);
  if (strongest && strongest.value >= 75) {
    recs.push(`Tienes buen avance en ${strongest.label.toLowerCase()}.`);
  }
  if (summary.overdue > 0) {
    const overdueArea = areas.find((a) => a.status === 'requiere_apoyo');
    recs.push(
      `Dedica más tiempo a actividades vencidas${overdueArea ? ` de ${overdueArea.area}` : ''}.`
    );
  }
  return [...new Set(recs)].slice(0, 6);
}

function buildLearningEvidence(subs, limit = 6) {
  return buildRecentFeedback(subs, limit).map((item) => ({
    activityTitle: item.activityTitle,
    skill: item.skillLabel,
    answer: item.answer,
    feedback: item.feedback,
    recommendation: item.recommendation,
    evaluation: item.evaluation,
    fecha: item.fecha,
  }));
}

function buildTeacherSummary(activities, subs, students) {
  const studentIds = new Set(students.map((s) => String(s._id)));
  const relevantSubs = subs.filter((s) => studentIds.has(String(s.student?._id || s.student)));

  const rows = activities.map((act) => {
    const actSubs = relevantSubs.filter((s) => String(s.activity?._id || s.activity) === String(act._id));
    const entregadas = actSubs.filter((s) => s.status === 'submitted').length;
    const vencidas = actSubs.filter((s) => displayStatus(s, act.dueAt) === 'vencida').length;
    const pendientes = actSubs.filter((s) => displayStatus(s, act.dueAt) === 'pendiente').length;
    return { act, actSubs, entregadas, vencidas, pendientes };
  });

  const totalAssigned = activities.reduce((a, act) => a + (act.assignees?.length || 0), 0);
  const allSubs = relevantSubs;
  const submitted = allSubs.filter((s) => s.status === 'submitted');
  const overdue = allSubs.filter((s) => displayStatus(s, s.activity?.dueAt) === 'vencida').length;
  const pending = allSubs.filter((s) => displayStatus(s, s.activity?.dueAt) === 'pendiente').length;
  const scores = submitted.filter((s) => s.score != null).map((s) => s.score);
  const avgComprehension = scores.length
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : null;

  const participation = students.length
    ? Math.round((new Set(submitted.map((s) => String(s.student?._id || s.student))).size / students.length) * 100)
    : 0;

  const atRisk = buildTeacherStudentRanking(activities, allSubs, students)
    .filter((s) => s.status === 'requiere_acompanamiento' || s.status === 'sin_actividad').length;

  return {
    totalStudents: students.length,
    activitiesAssigned: activities.length,
    totalAssignments: totalAssigned,
    submitted: submitted.length,
    pending,
    overdue,
    avgComprehension,
    participation,
    studentsAtRisk: atRisk,
    hasData: allSubs.length > 0,
  };
}

function getStudentReportStatus(subSubs, studentId) {
  const mine = subSubs.filter((s) => String(s.student?._id || s.student) === String(studentId));
  if (!mine.length) return 'sin_actividad';
  const submitted = mine.filter((s) => s.status === 'submitted');
  const avgProgress = mine.length
    ? Math.round(mine.reduce((a, s) => a + (s.status === 'submitted' ? 100 : calcProgress(s)), 0) / mine.length)
    : 0;
  const scores = submitted.filter((s) => s.score != null).map((s) => s.score);
  const avgScore = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  const overdue = mine.some((s) => displayStatus(s, s.activity?.dueAt) === 'vencida');

  if (!submitted.length && !mine.some((s) => calcProgress(s) > 0)) return 'sin_actividad';
  if (avgProgress < 40 || overdue) return 'requiere_acompanamiento';
  if (avgScore >= 70 || avgProgress >= 70) return 'avance_adecuado';
  return 'en_seguimiento';
}

const STUDENT_STATUS_LABELS = {
  avance_adecuado: 'Avance adecuado',
  en_seguimiento: 'En seguimiento',
  requiere_acompanamiento: 'Requiere acompañamiento',
  sin_actividad: 'Sin actividad',
};

function buildTeacherStudentRanking(activities, subs, students) {
  const activityIds = new Set(activities.map((a) => String(a._id)));
  const relevant = subs.filter((s) => activityIds.has(String(s.activity?._id || s.activity)));

  return students.map((st) => {
    const mine = relevant.filter((s) => String(s.student?._id || s.student) === String(st._id));
    const completed = mine.filter((s) => s.status === 'submitted').length;
    const avgProgress = mine.length
      ? Math.round(mine.reduce((a, s) => a + (s.status === 'submitted' ? 100 : calcProgress(s)), 0) / mine.length)
      : 0;
    const scores = mine.filter((s) => s.score != null).map((s) => s.score);
    const avgComprehension = scores.length
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : null;
    const skillScores = aggregateSkillScores(mine.filter((s) => s.status === 'submitted'));
    const { weakest } = findStrongestWeakest(skillScores);
    const status = getStudentReportStatus(relevant, st._id);

    return {
      studentId: st._id,
      nombres: st.nombres,
      apellidos: st.apellidos,
      email: st.email,
      completed,
      total: mine.length,
      avgProgress,
      avgComprehension,
      weakestSkill: weakest?.label || null,
      status,
      statusLabel: STUDENT_STATUS_LABELS[status],
    };
  }).sort((a, b) => (a.avgComprehension ?? 0) - (b.avgComprehension ?? 0));
}

function buildTeacherAreaTopicReport(activities, subs) {
  const groups = {};
  activities.forEach((act) => {
    const key = `${act.area || 'Comunicación'}::${act.topic || 'Sin tema'}`;
    if (!groups[key]) {
      groups[key] = {
        area: act.area || 'Comunicación',
        topic: act.topic || 'Sin tema',
        assigned: 0,
        scores: [],
        submitted: 0,
        pending: 0,
        overdue: 0,
        skillSums: {},
        skillCounts: {},
      };
    }
    const actSubs = subs.filter((s) => String(s.activity?._id || s.activity) === String(act._id));
    groups[key].assigned += act.assignees?.length || actSubs.length;
    actSubs.forEach((s) => {
      const st = displayStatus(s, act.dueAt);
      if (s.status === 'submitted') {
        groups[key].submitted++;
        if (s.score != null) groups[key].scores.push(s.score);
        SKILL_TYPES.forEach((sk) => {
          const v = s.skillScores?.[sk];
          if (v != null) {
            groups[key].skillSums[sk] = (groups[key].skillSums[sk] || 0) + v;
            groups[key].skillCounts[sk] = (groups[key].skillCounts[sk] || 0) + 1;
          }
        });
      } else if (st === 'pendiente') groups[key].pending++;
      else if (st === 'vencida') groups[key].overdue++;
    });
  });

  return Object.values(groups).map((g) => {
    const avg = g.scores.length ? Math.round(g.scores.reduce((a, b) => a + b, 0) / g.scores.length) : null;
    let weakestSkill = null;
    let minVal = 101;
    SKILL_TYPES.forEach((sk) => {
      if (g.skillCounts[sk]) {
        const v = Math.round(g.skillSums[sk] / g.skillCounts[sk]);
        if (v < minVal) { minVal = v; weakestSkill = SKILL_LABELS[sk]; }
      }
    });
    return {
      area: g.area,
      topic: g.topic,
      assigned: g.assigned,
      avgComprehension: avg,
      submitted: g.submitted,
      pending: g.pending,
      overdue: g.overdue,
      weakestSkill,
    };
  });
}

function buildActivityDifficulty(activities, subs) {
  return activities.map((act) => {
    const actSubs = subs.filter((s) => String(s.activity?._id || s.activity) === String(act._id));
    const submitted = actSubs.filter((s) => s.status === 'submitted');
    const scores = submitted.filter((s) => s.score != null).map((s) => s.score);
    const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
    let partial = 0;
    let incorrect = 0;
    submitted.forEach((s) => {
      const st = countAnswerStats(s);
      partial += st.partial;
      incorrect += st.incorrect;
    });
    const notSubmitted = actSubs.length - submitted.length;
    return {
      activityId: act._id,
      titulo: act.title,
      area: act.area || 'Comunicación',
      tema: act.topic || '',
      avgComprehension: avg,
      partialAnswers: partial,
      incorrectAnswers: incorrect,
      notSubmitted,
      difficulty: avg != null && avg < 50 ? 'alta' : avg != null && avg < 70 ? 'media' : 'baja',
    };
  })
    .filter((a) => a.avgComprehension != null || a.notSubmitted > 0)
    .sort((a, b) => (a.avgComprehension ?? 0) - (b.avgComprehension ?? 0))
    .slice(0, 10);
}

function buildRecentAnswers(subs, limit = 15) {
  const items = [];
  subs
    .filter((s) => s.status === 'submitted')
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .forEach((s) => {
      const student = s.student;
      const studentName = student && typeof student === 'object'
        ? `${student.nombres || ''} ${student.apellidos || ''}`.trim()
        : '';
      (s.questionAnswers || []).forEach((ans, i) => {
        if (!ans.answer?.trim()) return;
        const q = s.questions?.[i];
        items.push({
          studentId: student?._id || student,
          studentName,
          activityTitle: s.activity?.title || '',
          area: s.activity?.area || 'Comunicación',
          question: q?.questionText || `Pregunta ${i + 1}`,
          answer: ans.answer,
          evaluation: ans.isCorrect || 'sin_evaluar',
          feedback: ans.feedback || '',
          fecha: s.updatedAt,
        });
      });
    });
  return items.slice(0, limit);
}

function buildPedagogicalAlerts(summary, skillScores, areaReport, studentRanking) {
  const alerts = [];
  if (summary.overdue > 0) {
    alerts.push({
      type: 'vencidas',
      message: `${summary.overdue} entrega(s) vencida(s) en el grupo.`,
      severity: 'warning',
    });
  }
  SKILL_TYPES.forEach((sk) => {
    const v = skillScores[sk];
    if (v != null && v < 60) {
      alerts.push({
        type: 'habilidad',
        message: `La habilidad ${SKILL_LABELS[sk].toLowerCase()} está por debajo del 60%.`,
        severity: 'warning',
      });
    }
  });
  areaReport
    .filter((a) => a.avgComprehension != null && a.avgComprehension < 55)
    .slice(0, 2)
    .forEach((a) => {
      alerts.push({
        type: 'tema',
        message: `El tema "${a.topic}" en ${a.area} presenta bajo desempeño.`,
        severity: 'info',
      });
    });
  const inactive = studentRanking.filter((s) => s.status === 'sin_actividad').length;
  if (inactive > 0) {
    alerts.push({
      type: 'inactividad',
      message: `${inactive} estudiante(s) sin actividad reciente.`,
      severity: 'info',
    });
  }
  return alerts.slice(0, 8);
}

function buildTeacherRecommendations(summary, skillScores, difficulty, ranking) {
  const recs = [];
  const lowSkills = SKILL_TYPES.filter((s) => skillScores[s] != null && skillScores[s] < 60);
  if (lowSkills.includes('inferential')) {
    recs.push('Reforzar preguntas inferenciales en la próxima clase.');
  }
  if (lowSkills.includes('vocabulary')) {
    recs.push('Asignar una actividad corta de vocabulario.');
  }
  if (lowSkills.includes('critical')) {
    recs.push('Incluir preguntas abiertas que promuevan argumentación.');
  }
  const atRisk = ranking.filter((s) => s.status === 'requiere_acompanamiento');
  if (atRisk.length) {
    recs.push(`Revisar a ${atRisk.length} estudiante(s) con progreso menor al 40%.`);
  }
  const hard = difficulty.filter((d) => d.difficulty === 'alta').slice(0, 1);
  if (hard.length) {
    recs.push(`Usar textos más breves si "${hard[0].titulo}" presenta alta dificultad.`);
  }
  if (summary.participation < 60) {
    recs.push('Motivar la participación con actividades cortas y retroalimentación inmediata.');
  }
  return [...new Set(recs)].slice(0, 6);
}

function buildTeacherEvidence(subs, limit = 6) {
  return buildRecentAnswers(subs, limit).map((a) => ({
    studentName: a.studentName,
    activityTitle: a.activityTitle,
    skill: a.area,
    answer: a.answer,
    feedback: a.feedback,
    evaluation: a.evaluation,
    recommendation: a.feedback ? 'Seguimiento formativo registrado por IA.' : '',
    fecha: a.fecha,
  }));
}

function submissionsToCsv(rows) {
  const header = 'Estudiante,Actividad,Área,Progreso,Comprensión,Estado\n';
  const lines = rows.map((r) =>
    `"${r.nombres} ${r.apellidos}","${r.completed}/${r.total}","","","${r.avgComprehension ?? ''}","${r.statusLabel}"`
  );
  return header + lines.join('\n');
}

module.exports = {
  SKILL_LEVEL_LABELS,
  STUDENT_STATUS_LABELS,
  parseReportFilters,
  filterSubmissions,
  buildSkillMap,
  buildTeacherSkillMap,
  buildStudentSummary,
  buildAreaPerformance,
  buildTimeline,
  buildRecentActivities,
  buildRecentFeedback,
  buildPersonalRecommendations,
  buildLearningEvidence,
  buildTeacherSummary,
  buildTeacherStudentRanking,
  buildTeacherAreaTopicReport,
  buildActivityDifficulty,
  buildRecentAnswers,
  buildPedagogicalAlerts,
  buildTeacherRecommendations,
  buildTeacherEvidence,
  aggregateSkillScores,
  getSkillRecommendations,
  submissionsToCsv,
  findStrongestWeakest,
};
