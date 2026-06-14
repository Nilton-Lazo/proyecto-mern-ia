import { getApiBase, apiFetch } from './api';
import { buildReportQuery } from '../utils/reportFormatters';
import type {
  ReportFilters,
  StudentReportSummary,
  SkillReportItem,
  AreaPerformance,
  TimelinePoint,
  FeedbackItem,
  RecentActivityRow,
  EvidenceItem,
  TeacherReportSummary,
  StudentRankingRow,
  AreaTopicReport,
  ActivityDifficulty,
  PedagogicalAlert,
  TeacherAnswerRow,
} from '../types/reports';

function q(filters: ReportFilters = {}) {
  return buildReportQuery({
    period: filters.period,
    area: filters.area,
    status: filters.status,
    topic: filters.topic,
    studentId: filters.studentId,
  });
}

// ——— Estudiante ———

export function fetchStudentReportSummary(token: string | null, filters?: ReportFilters) {
  return apiFetch<{ summary: StudentReportSummary }>(
    `/api/student/reports/summary${q(filters)}`,
    { token }
  );
}

export function fetchStudentReportSkills(token: string | null, filters?: ReportFilters) {
  return apiFetch<{ skills: SkillReportItem[]; hasData: boolean }>(
    `/api/student/reports/skills${q(filters)}`,
    { token }
  );
}

export function fetchStudentReportAreas(token: string | null, filters?: ReportFilters) {
  return apiFetch<{ areas: AreaPerformance[]; hasData: boolean }>(
    `/api/student/reports/areas${q(filters)}`,
    { token }
  );
}

export function fetchStudentReportTimeline(token: string | null, filters?: ReportFilters) {
  return apiFetch<{ timeline: TimelinePoint[]; hasData: boolean }>(
    `/api/student/reports/timeline${q(filters)}`,
    { token }
  );
}

export function fetchStudentReportFeedback(token: string | null, filters?: ReportFilters) {
  return apiFetch<{ feedback: FeedbackItem[]; activities: RecentActivityRow[]; hasData: boolean }>(
    `/api/student/reports/recent-feedback${q(filters)}`,
    { token }
  );
}

export function fetchStudentReportRecommendations(token: string | null, filters?: ReportFilters) {
  return apiFetch<{ recommendations: string[]; evidence: EvidenceItem[]; hasData: boolean }>(
    `/api/student/reports/recommendations${q(filters)}`,
    { token }
  );
}

export async function downloadStudentReportPdf(token: string | null, filters?: ReportFilters) {
  const res = await fetch(`${getApiBase()}/api/student/reports/export-pdf${q(filters)}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'No se pudo generar el PDF.');
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'reporte-estudiante.pdf';
  a.click();
  URL.revokeObjectURL(url);
}

// ——— Docente ———

export function fetchTeacherReportSummary(token: string | null, filters?: ReportFilters) {
  return apiFetch<{ summary: TeacherReportSummary; teacher: { nombres: string; apellidos: string } }>(
    `/api/teacher/reports/summary${q(filters)}`,
    { token }
  );
}

export function fetchTeacherReportSkills(token: string | null, filters?: ReportFilters) {
  return apiFetch<{ skills: SkillReportItem[]; hasData: boolean }>(
    `/api/teacher/reports/skills${q(filters)}`,
    { token }
  );
}

export function fetchTeacherReportStudents(token: string | null, filters?: ReportFilters) {
  return apiFetch<{ students: StudentRankingRow[]; hasData: boolean }>(
    `/api/teacher/reports/students${q(filters)}`,
    { token }
  );
}

export function fetchTeacherReportAreas(token: string | null, filters?: ReportFilters) {
  return apiFetch<{ areas: AreaTopicReport[]; hasData: boolean }>(
    `/api/teacher/reports/areas${q(filters)}`,
    { token }
  );
}

export function fetchTeacherReportDifficulty(token: string | null, filters?: ReportFilters) {
  return apiFetch<{ activities: ActivityDifficulty[]; hasData: boolean }>(
    `/api/teacher/reports/activities-difficulty${q(filters)}`,
    { token }
  );
}

export function fetchTeacherReportAnswers(token: string | null, filters?: ReportFilters) {
  return apiFetch<{ answers: TeacherAnswerRow[]; hasData: boolean }>(
    `/api/teacher/reports/recent-answers${q(filters)}`,
    { token }
  );
}

export function fetchTeacherReportAlerts(token: string | null, filters?: ReportFilters) {
  return apiFetch<{ alerts: PedagogicalAlert[] }>(
    `/api/teacher/reports/alerts${q(filters)}`,
    { token }
  );
}

export function fetchTeacherReportRecommendations(token: string | null, filters?: ReportFilters) {
  return apiFetch<{ recommendations: string[]; evidence: EvidenceItem[]; hasData: boolean }>(
    `/api/teacher/reports/recommendations${q(filters)}`,
    { token }
  );
}

export async function downloadTeacherReportPdf(token: string | null, filters?: ReportFilters) {
  const res = await fetch(`${getApiBase()}/api/teacher/reports/export-pdf${q(filters)}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'No se pudo generar el PDF.');
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'reporte-grupo.pdf';
  a.click();
  URL.revokeObjectURL(url);
}

export async function downloadTeacherReportCsv(token: string | null, filters?: ReportFilters) {
  const res = await fetch(`${getApiBase()}/api/teacher/reports/export-csv${q(filters)}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'No se pudo exportar CSV.');
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'reporte-grupo.csv';
  a.click();
  URL.revokeObjectURL(url);
}
