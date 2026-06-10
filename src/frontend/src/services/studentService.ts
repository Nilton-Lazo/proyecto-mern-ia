import { apiFetch } from './api';
import type {
  StudentActivityDetail,
  StudentActivityRow,
  StudentProgressSummary,
  QuestionAnswer,
} from '../types/student';

export function fetchStudentActivities(token: string | null) {
  return apiFetch<{ activities: StudentActivityRow[] }>('/api/student/activities', { token });
}

export function fetchStudentProgress(token: string | null) {
  return apiFetch<StudentProgressSummary>('/api/student/progress', { token });
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
  }>(`/api/student/activities/${id}/generate-questions`, {
    method: 'POST',
    token,
  });
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
  token: string | null
) {
  return apiFetch<{ ok: boolean; progressPercent: number }>(
    `/api/student/activities/${id}/save-draft`,
    {
      method: 'POST',
      token,
      body: JSON.stringify({ answers }),
    }
  );
}

export function submitActivity(id: string, answers: QuestionAnswer[], token: string | null) {
  return apiFetch<{
    ok: boolean;
    status: string;
    score: number;
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
