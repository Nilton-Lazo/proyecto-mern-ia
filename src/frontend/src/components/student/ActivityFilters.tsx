import { CURRICULAR_AREAS, AREA_FILTER_ALL } from '../../constants/curricularAreas';
import type { ActivityFilter } from '../../utils/statusHelpers';

type Props = {
  filter: ActivityFilter;
  onFilter: (f: ActivityFilter) => void;
  areaFilter: string;
  onAreaFilter: (a: string) => void;
  search: string;
  onSearch: (q: string) => void;
  counts: Record<string, number>;
};

const FILTERS: { id: ActivityFilter; label: string }[] = [
  { id: 'todas', label: 'Todas' },
  { id: 'pendiente', label: 'Pendientes' },
  { id: 'en_progreso', label: 'En progreso' },
  { id: 'entregada', label: 'Entregadas' },
  { id: 'vencida', label: 'Vencidas' },
];

export default function ActivityFilters({
  filter,
  onFilter,
  areaFilter,
  onAreaFilter,
  search,
  onSearch,
  counts,
}: Props) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => onFilter(f.id)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
              filter === f.id
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700 dark:hover:bg-slate-700'
            }`}
          >
            {f.label}
            <span className="ml-1 opacity-80">({counts[f.id] ?? 0})</span>
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <select
          value={areaFilter}
          onChange={(e) => onAreaFilter(e.target.value)}
          className="app-input w-full text-sm sm:max-w-[220px]"
        >
          <option value={AREA_FILTER_ALL}>Todas las áreas</option>
          {CURRICULAR_AREAS.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
        <input
          type="search"
          placeholder="Buscar por título, tema o docente…"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          className="app-input w-full flex-1 text-sm"
        />
      </div>
    </div>
  );
}
