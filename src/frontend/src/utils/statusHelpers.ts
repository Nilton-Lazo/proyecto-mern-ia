import type { ActivityDisplayStatus } from '../types/student';

export const STATUS_LABELS: Record<ActivityDisplayStatus, string> = {
  pendiente: 'Pendiente',
  en_progreso: 'En progreso',
  entregada: 'Entregada',
  vencida: 'Vencida',
};

export const STATUS_STYLES: Record<ActivityDisplayStatus, string> = {
  pendiente: 'bg-slate-100 text-slate-700 border-slate-200',
  en_progreso: 'bg-amber-50 text-amber-700 border-amber-100',
  entregada: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  vencida: 'bg-red-50 text-red-700 border-red-100',
};

export const QUESTION_TYPE_LABELS: Record<string, string> = {
  literal: 'Comprensión literal',
  inferential: 'Comprensión inferencial',
  critical: 'Pensamiento crítico',
  vocabulary: 'Vocabulario',
  main_idea: 'Idea principal',
};

export type ActivityFilter = 'todas' | ActivityDisplayStatus;

export function filterActivities<T extends { displayStatus?: ActivityDisplayStatus; titulo?: string }>(
  items: T[],
  filter: ActivityFilter,
  search: string
): T[] {
  let result = items;
  if (filter !== 'todas') {
    result = result.filter((i) => i.displayStatus === filter);
  }
  const q = search.trim().toLowerCase();
  if (q) {
    result = result.filter((i) => (i.titulo || '').toLowerCase().includes(q));
  }
  return result;
}

export function sortByDueDate<T extends { dueAt?: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    if (!a.dueAt && !b.dueAt) return 0;
    if (!a.dueAt) return 1;
    if (!b.dueAt) return -1;
    return new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime();
  });
}
