import type { QuestionType } from '../types/student';

export const SKILL_LABELS: Record<QuestionType, string> = {
  literal: 'Comprensión literal',
  inferential: 'Comprensión inferencial',
  critical: 'Pensamiento crítico',
  vocabulary: 'Vocabulario',
  main_idea: 'Idea principal',
};

export type SkillScores = Partial<Record<QuestionType, number | null>>;

export type SkillRecommendation = {
  skill: string;
  label: string;
  level: 'alto' | 'medio' | 'bajo';
  message: string;
};

export function skillBarColor(value: number | null | undefined): string {
  if (value == null) return 'bg-slate-300 dark:bg-slate-700';
  if (value >= 75) return 'bg-emerald-500';
  if (value >= 50) return 'bg-amber-500';
  return 'bg-rose-500';
}
