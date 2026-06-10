import { apiFetch } from './api';
import type { ActivityQuestion, PracticeAnalysis } from '../types/student';

export function runPractice(text: string, token: string | null) {
  return apiFetch<{
    ok: boolean;
    questions: ActivityQuestion[];
    analysis: PracticeAnalysis;
  }>('/api/ai/practice', {
    method: 'POST',
    token,
    body: JSON.stringify({ text }),
  });
}

export function detectBiases(text: string, token: string | null) {
  return apiFetch<{ ok: boolean; tags: string[] }>('/api/ai/biases', {
    method: 'POST',
    token,
    body: JSON.stringify({ text }),
  });
}

export function getFeedback(
  text: string,
  question: string,
  answer: string,
  token: string | null
) {
  return apiFetch<{ feedback: string }>('/api/ai/feedback', {
    method: 'POST',
    token,
    body: JSON.stringify({ text, question, answer }),
  });
}
