import type { SkillReportItem } from '../types/reports';

export function hasSkillData(skills: SkillReportItem[]): boolean {
  return skills.some((s) => s.percentage != null);
}

export function summaryCardItemsStudent(summary: {
  assigned: number;
  completed: number;
  inProgress: number;
  overdue: number;
  avgProgress: number;
  avgComprehension: number | null;
  totalQuestionsAnswered: number;
  lastActivity?: { titulo: string } | null;
}) {
  return [
    { label: 'Actividades asignadas', value: summary.assigned },
    { label: 'Completadas', value: summary.completed, accent: 'text-emerald-600' },
    { label: 'En progreso', value: summary.inProgress, accent: 'text-amber-600' },
    { label: 'Vencidas', value: summary.overdue, accent: 'text-rose-600' },
    { label: 'Progreso promedio', value: `${summary.avgProgress}%` },
    {
      label: 'Comprensión promedio',
      value: summary.avgComprehension != null ? `${summary.avgComprehension}%` : '—',
    },
    { label: 'Preguntas respondidas', value: summary.totalQuestionsAnswered },
    {
      label: 'Última actividad',
      value: summary.lastActivity?.titulo || '—',
      small: true,
    },
  ];
}

export function summaryCardItemsTeacher(summary: {
  totalStudents: number;
  activitiesAssigned: number;
  submitted: number;
  pending: number;
  overdue: number;
  avgComprehension: number | null;
  participation: number;
  studentsAtRisk: number;
}) {
  return [
    { label: 'Estudiantes', value: summary.totalStudents },
    { label: 'Actividades asignadas', value: summary.activitiesAssigned },
    { label: 'Entregadas', value: summary.submitted, accent: 'text-emerald-600' },
    { label: 'Pendientes', value: summary.pending, accent: 'text-amber-600' },
    { label: 'Vencidas', value: summary.overdue, accent: 'text-rose-600' },
    {
      label: 'Comprensión promedio',
      value: summary.avgComprehension != null ? `${summary.avgComprehension}%` : '—',
    },
    { label: 'Participación', value: `${summary.participation}%` },
    { label: 'En seguimiento', value: summary.studentsAtRisk, accent: 'text-violet-600' },
  ];
}
