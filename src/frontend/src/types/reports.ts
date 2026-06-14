export type ReportPeriod = 'all' | 'week' | 'month' | 'semester';
export type ReportStatus = 'all' | 'pendiente' | 'en_progreso' | 'entregada' | 'vencida';

export type ReportFilters = {
  period?: ReportPeriod;
  area?: string;
  status?: ReportStatus;
  topic?: string;
  studentId?: string;
};

export type SkillLevel = 'bajo' | 'en_proceso' | 'logrado' | 'destacado';

export type SkillReportItem = {
  skill: string;
  label: string;
  percentage: number | null;
  level: SkillLevel | null;
  levelLabel: string | null;
  recommendation: string;
};

export type StudentReportSummary = {
  student: { id: string; nombres: string; apellidos: string; email: string; role: string };
  assigned: number;
  completed: number;
  inProgress: number;
  pending: number;
  overdue: number;
  avgProgress: number;
  avgComprehension: number | null;
  totalQuestionsAnswered: number;
  lastActivity: {
    titulo: string;
    area: string;
    updatedAt: string;
  } | null;
  hasData: boolean;
};

export type AreaPerformance = {
  area: string;
  completed: number;
  total: number;
  avgComprehension: number | null;
  status: string;
  topTopic: string | null;
};

export type TimelinePoint = {
  date: string;
  completed: number;
  avgComprehension: number | null;
  avgProgress: number;
};

export type RecentActivityRow = {
  activityId: string;
  titulo: string;
  area: string;
  tema: string;
  fecha: string;
  estado: string;
  score: number | null;
  strongestSkill: string | null;
  weakestSkill: string | null;
};

export type FeedbackItem = {
  activityId?: string;
  activityTitle: string;
  area: string;
  question: string;
  answer: string;
  feedback: string;
  skill: string;
  skillLabel: string;
  evaluation: string;
  recommendation: string;
  fecha: string;
};

export type EvidenceItem = {
  activityTitle: string;
  skill: string;
  answer: string;
  feedback: string;
  recommendation: string;
  evaluation: string;
  fecha: string;
};

export type TeacherReportSummary = {
  totalStudents: number;
  activitiesAssigned: number;
  totalAssignments: number;
  submitted: number;
  pending: number;
  overdue: number;
  avgComprehension: number | null;
  participation: number;
  studentsAtRisk: number;
  hasData: boolean;
};

export type StudentRankingRow = {
  studentId: string;
  nombres: string;
  apellidos: string;
  email: string;
  completed: number;
  total: number;
  avgProgress: number;
  avgComprehension: number | null;
  weakestSkill: string | null;
  status: string;
  statusLabel: string;
};

export type AreaTopicReport = {
  area: string;
  topic: string;
  assigned: number;
  avgComprehension: number | null;
  submitted: number;
  pending: number;
  overdue: number;
  weakestSkill: string | null;
};

export type ActivityDifficulty = {
  activityId: string;
  titulo: string;
  area: string;
  tema: string;
  avgComprehension: number | null;
  partialAnswers: number;
  incorrectAnswers: number;
  notSubmitted: number;
  difficulty: string;
};

export type PedagogicalAlert = {
  type: string;
  message: string;
  severity: 'info' | 'warning' | 'error';
};

export type TeacherAnswerRow = {
  studentId: string;
  studentName: string;
  activityTitle: string;
  area: string;
  question: string;
  answer: string;
  evaluation: string;
  feedback: string;
  fecha: string;
};
