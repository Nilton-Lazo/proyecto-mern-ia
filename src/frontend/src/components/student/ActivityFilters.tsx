import type { ActivityFilter } from '../../utils/statusHelpers';

type Props = {
  filter: ActivityFilter;
  onFilter: (f: ActivityFilter) => void;
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

export default function ActivityFilters({ filter, onFilter, search, onSearch, counts }: Props) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => onFilter(f.id)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
              filter === f.id
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
            }`}
          >
            {f.label}
            <span className="ml-1 opacity-80">({counts[f.id] ?? 0})</span>
          </button>
        ))}
      </div>
      <input
        type="search"
        placeholder="Buscar por título…"
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        className="w-full rounded-xl border-0 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm ring-1 ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-400 sm:max-w-xs"
      />
    </div>
  );
}
