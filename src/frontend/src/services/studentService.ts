import { apiFetch } from './api';
import type {
  StudentActivityDetail,
  StudentActivityRow,
  StudentProgressSummary,
  QuestionAnswer,
  AreaGroup,
  SkillScores,
  SkillRecommendation,
} from '../types/student';

export type ActivitiesQuery = {
  area?: string;
  status?: string;
  search?: string;
};

function buildQuery(params: ActivitiesQuery): string {
  const q = new URLSearchParams();
  if (params.area && params.area !== 'todas') q.set('area', params.area);
  if (params.status && params.status !== 'todas') q.set('status', params.status);
  if (params.search?.trim()) q.set('search', params.search.trim());
  const s = q.toString();
  return s ? `?${s}` : '';
}

export function fetchStudentActivities(token: string | null, query: ActivitiesQuery = {}) {
  return apiFetch<{
    activities: StudentActivityRow[];
    groupedByArea: AreaGroup[];
    total: number;
    filtered: number;
  }>(`/api/student/activities${buildQuery(query)}`, { token });
}

export function fetchStudentProgress(token: string | null) {
  return apiFetch<StudentProgressSummary>('/api/student/progress', { token });
}

export function fetchSkillProgress(token: string | null) {
  return apiFetch<{
    skillScores: SkillScores;
    recommendations: SkillRecommendation[];
    submissionsEvaluated: number;
  }>('/api/student/progress/skills', { token });
}

export function fetchActivityDetail(id: string, token: string | null) {
  return apiFetch<StudentActivityDetail>(`/api/student/activities/${id}`, { token });
}

export function generateActivityQuestions(id: string, token: string | null) {
  return apiFetch<{
    ok: boolean;
    questions: StudentActivityDetail['questions'];
    aiAnalysis: StudentActivityDetail['aiAnalysis'];
    progressPercent: number;
    alreadyGenerated?: boolean;
  }>(`/api/student/activities/${id}/generate-questions`, { method: 'POST', token });
}

export function analyzeActivityText(id: string, token: string | null) {
  return apiFetch<{ ok: boolean; aiAnalysis: StudentActivityDetail['aiAnalysis'] }>(
    `/api/student/activities/${id}/analyze`,
    { method: 'POST', token }
  );
}

export function saveActivityDraft(
  id: string,
  answers: QuestionAnswer[],
  token: string | null,
  currentStep?: number
) {
  return apiFetch<{ ok: boolean; progressPercent: number; lastSavedAt?: string }>(
    `/api/student/activities/${id}/save-draft`,
    {
      method: 'POST',
      token,
      body: JSON.stringify({ answers, currentStep }),
    }
  );
}

export function autosaveActivity(
  id: string,
  answers: QuestionAnswer[],
  token: string | null,
  currentStep?: number
) {
  return apiFetch<{
    ok: boolean;
    progressPercent: number;
    lastSavedAt?: string;
    currentStep?: number;
  }>(`/api/student/activities/${id}/autosave`, {
    method: 'POST',
    token,
    body: JSON.stringify({ answers, currentStep }),
  });
}

export function submitActivity(id: string, answers: QuestionAnswer[], token: string | null) {
  return apiFetch<{
    ok: boolean;
    status: string;
    score: number;
    skillScores?: SkillScores;
    skillRecommendations?: SkillRecommendation[];
    feedbackSummary: string;
    recommendation: string;
    motivation: string;
    questionAnswers: QuestionAnswer[];
  }>(`/api/student/activities/${id}/submit`, {
    method: 'POST',
    token,
    body: JSON.stringify({ answers }),
  });
}
