import type { SkillLevel } from '../types/reports';

export function formatReportPeriod(period: string): string {
  const map: Record<string, string> = {
    all: 'Todo el periodo',
    week: 'Última semana',
    month: 'Último mes',
    semester: 'Último semestre',
  };
  return map[period] || period;
}

export function skillLevelColor(level: SkillLevel | null): string {
  switch (level) {
    case 'destacado':
      return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300';
    case 'logrado':
      return 'text-emerald-600 bg-emerald-50/80 dark:bg-emerald-950/30 dark:text-emerald-300';
    case 'en_proceso':
      return 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300';
    case 'bajo':
      return 'text-rose-600 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-300';
    default:
      return 'text-slate-500 bg-slate-100 dark:bg-slate-800 dark:text-slate-400';
  }
}

export function studentStatusColor(status: string): string {
  switch (status) {
    case 'avance_adecuado':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300';
    case 'en_seguimiento':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300';
    case 'requiere_acompanamiento':
      return 'bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300';
    default:
      return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
  }
}

export function evaluationLabel(evaluation: string): string {
  if (evaluation === 'correcta') return 'Correcta';
  if (evaluation === 'incorrecta') return 'Incorrecta';
  if (evaluation === 'parcial') return 'Parcial';
  return 'Sin evaluar';
}

export function evaluationColor(evaluation: string): string {
  if (evaluation === 'correcta') return 'text-emerald-600';
  if (evaluation === 'incorrecta') return 'text-rose-600';
  if (evaluation === 'parcial') return 'text-amber-600';
  return 'text-slate-500';
}

export function buildReportQuery(filters: Record<string, string | undefined>): string {
  const q = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v && v !== 'all' && v !== 'todas') q.set(k, v);
  });
  const s = q.toString();
  return s ? `?${s}` : '';
}
