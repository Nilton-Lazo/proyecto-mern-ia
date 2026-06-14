import { CURRICULAR_AREAS, AREA_FILTER_ALL } from '../../constants/curricularAreas';
import type { ReportFilters as Filters, ReportPeriod, ReportStatus } from '../../types/reports';
import type { StudentRankingRow } from '../../types/reports';

type Props = {
  filters: Filters;
  onChange: (f: Filters) => void;
  role: 'student' | 'teacher';
  students?: StudentRankingRow[];
};

const PERIODS: { value: ReportPeriod; label: string }[] = [
  { value: 'all', label: 'Todo el periodo' },
  { value: 'week', label: 'Última semana' },
  { value: 'month', label: 'Último mes' },
  { value: 'semester', label: 'Último semestre' },
];

const STATUSES: { value: ReportStatus; label: string }[] = [
  { value: 'all', label: 'Todos los estados' },
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'en_progreso', label: 'En progreso' },
  { value: 'entregada', label: 'Entregada' },
  { value: 'vencida', label: 'Vencida' },
];

export default function ReportFilters({ filters, onChange, role, students }: Props) {
  const set = (patch: Partial<Filters>) => onChange({ ...filters, ...patch });

  return (
    <div className="app-card flex flex-wrap gap-3 p-4">
      <label className="flex flex-col gap-1 text-xs text-slate-500 dark:text-slate-400">
        Periodo
        <select
          className="app-input min-w-[140px] text-sm"
          value={filters.period || 'all'}
          onChange={(e) => set({ period: e.target.value as ReportPeriod })}
        >
          {PERIODS.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-xs text-slate-500 dark:text-slate-400">
        Área
        <select
          className="app-input min-w-[160px] text-sm"
          value={filters.area || AREA_FILTER_ALL}
          onChange={(e) => set({ area: e.target.value })}
        >
          <option value={AREA_FILTER_ALL}>Todas las áreas</option>
          {CURRICULAR_AREAS.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-xs text-slate-500 dark:text-slate-400">
        Estado
        <select
          className="app-input min-w-[140px] text-sm"
          value={filters.status || 'all'}
          onChange={(e) => set({ status: e.target.value as ReportStatus })}
        >
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </label>

      {role === 'teacher' && (
        <>
          <label className="flex flex-col gap-1 text-xs text-slate-500 dark:text-slate-400">
            Tema
            <input
              className="app-input min-w-[140px] text-sm"
              placeholder="Buscar tema…"
              value={filters.topic || ''}
              onChange={(e) => set({ topic: e.target.value })}
            />
          </label>
          {students && students.length > 0 && (
            <label className="flex flex-col gap-1 text-xs text-slate-500 dark:text-slate-400">
              Estudiante
              <select
                className="app-input min-w-[160px] text-sm"
                value={filters.studentId || ''}
                onChange={(e) => set({ studentId: e.target.value || undefined })}
              >
                <option value="">Todos</option>
                {students.map((s) => (
                  <option key={s.studentId} value={s.studentId}>
                    {s.nombres} {s.apellidos}
                  </option>
                ))}
              </select>
            </label>
          )}
        </>
      )}
    </div>
  );
}
