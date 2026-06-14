const Activity = require('../models/Activity');
const Submission = require('../models/Submission');
const User = require('../models/User');
const WorkflowLog = require('../models/WorkflowLog');
const { displayStatus, calcProgress } = require('../routes/studentHelpers');
const { aggregateSkillScores } = require('../utils/skillScoring');
const { SKILL_LABELS } = require('../utils/skillScoring');

const SKILL_TYPES = ['literal', 'inferential', 'critical', 'vocabulary', 'main_idea'];

async function getPendingActivities({ daysAhead = 3 } = {}) {
  const now = new Date();
  const horizon = new Date(now);
  horizon.setDate(horizon.getDate() + daysAhead);

  const subs = await Submission.find({ status: { $ne: 'submitted' } })
    .populate({ path: 'activity', select: 'title area topic dueAt' })
    .populate({ path: 'student', select: 'nombres apellidos email' })
    .lean();

  const items = [];
  for (const sub of subs) {
    const act = sub.activity;
    const student = sub.student;
    if (!act || !student) continue;

    const st = displayStatus(sub, act.dueAt);
    if (!['pendiente', 'en_progreso', 'vencida'].includes(st)) continue;

    const dueAt = act.dueAt ? new Date(act.dueAt) : null;
    const isOverdue = st === 'vencida';
    const isDueSoon = dueAt && dueAt <= horizon;
    const isPendingNoDue = !dueAt && (st === 'pendiente' || st === 'en_progreso');

    if (!isOverdue && !isDueSoon && !isPendingNoDue) continue;

    items.push({
      activityId: String(act._id),
      submissionId: String(sub._id),
      studentId: String(student._id),
      studentName: `${student.nombres || ''} ${student.apellidos || ''}`.trim(),
      studentEmail: student.email,
      title: act.title,
      area: act.area || 'Comunicación',
      topic: act.topic || '',
      dueDate: dueAt ? dueAt.toISOString() : null,
      status: isOverdue ? 'overdue' : st === 'en_progreso' ? 'in_progress' : 'pending',
      progressPercent: calcProgress(sub),
    });
  }

  return items.sort((a, b) => {
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate) - new Date(b.dueDate);
  });
}

async function buildTeacherSummary(teacherId, weekStart) {
  const activities = await Activity.find({ createdBy: teacherId }).lean();
  const activityIds = activities.map((a) => a._id);
  if (!activityIds.length) return null;

  const teacher = await User.findById(teacherId).select('nombres apellidos email').lean();
  if (!teacher) return null;

  const subs = await Submission.find({ activity: { $in: activityIds } })
    .populate('activity', 'title area topic dueAt')
    .populate('student', 'nombres apellidos email')
    .lean();

  const recentSubs = weekStart
    ? subs.filter((s) => new Date(s.updatedAt) >= weekStart)
    : subs;

  const submitted = subs.filter((s) => s.status === 'submitted');
  const pending = subs.filter((s) => displayStatus(s, s.activity?.dueAt) === 'pendiente');
  const overdue = subs.filter((s) => displayStatus(s, s.activity?.dueAt) === 'vencida');
  const scores = submitted.filter((s) => s.score != null).map((s) => s.score);
  const avgComprehension = scores.length
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : null;

  const skillScores = aggregateSkillScores(submitted);
  let weakestSkill = null;
  let minVal = 101;
  SKILL_TYPES.forEach((sk) => {
    if (skillScores[sk] != null && skillScores[sk] < minVal) {
      minVal = skillScores[sk];
      weakestSkill = SKILL_LABELS[sk];
    }
  });

  const studentMap = {};
  subs.forEach((s) => {
    const sid = String(s.student?._id || s.student);
    if (!sid) return;
    if (!studentMap[sid]) {
      studentMap[sid] = {
        studentId: sid,
        name: s.student?.nombres
          ? `${s.student.nombres} ${s.student.apellidos || ''}`.trim()
          : 'Estudiante',
        email: s.student?.email,
        total: 0,
        completed: 0,
        progressSum: 0,
      };
    }
    studentMap[sid].total++;
    if (s.status === 'submitted') studentMap[sid].completed++;
    studentMap[sid].progressSum += s.status === 'submitted' ? 100 : calcProgress(s);
  });

  const atRiskStudents = Object.values(studentMap)
    .map((st) => ({
      ...st,
      avgProgress: st.total ? Math.round(st.progressSum / st.total) : 0,
    }))
    .filter((st) => st.avgProgress < 40 || st.completed === 0)
    .sort((a, b) => a.avgProgress - b.avgProgress);

  return {
    teacherId: String(teacherId),
    teacherName: `${teacher.nombres} ${teacher.apellidos}`.trim(),
    teacherEmail: teacher.email,
    periodStart: weekStart ? weekStart.toISOString() : null,
    activitiesAssigned: activities.length,
    totalSubmissions: subs.length,
    submitted: submitted.length,
    pending: pending.length,
    overdue: overdue.length,
    avgComprehension,
    weakestSkill,
    recentActivityCount: recentSubs.length,
    atRiskStudents: atRiskStudents.slice(0, 10),
    generatedAt: new Date().toISOString(),
  };
}

async function getTeacherWeeklySummary(teacherId = null) {
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);

  if (teacherId) {
    const summary = await buildTeacherSummary(teacherId, weekStart);
    return summary ? [summary] : [];
  }

  const teacherIds = await Activity.distinct('createdBy');
  const summaries = [];
  for (const tid of teacherIds) {
    const s = await buildTeacherSummary(tid, weekStart);
    if (s) summaries.push(s);
  }
  return summaries;
}

async function createWorkflowLog(data) {
  const log = await WorkflowLog.create({
    workflowName: data.workflowName,
    eventType: data.eventType || 'execution',
    status: data.status || 'success',
    payload: data.payload ?? null,
    response: data.response ?? null,
    errorMessage: data.errorMessage || '',
    activityId: data.activityId || null,
    studentId: data.studentId || null,
    teacherId: data.teacherId || null,
    executedAt: data.executedAt || new Date(),
  });
  return log;
}

async function listWorkflowLogs({ limit = 50, workflowName } = {}) {
  const filter = workflowName ? { workflowName } : {};
  return WorkflowLog.find(filter).sort({ createdAt: -1 }).limit(limit).lean();
}

module.exports = {
  getPendingActivities,
  getTeacherWeeklySummary,
  createWorkflowLog,
  listWorkflowLogs,
};
