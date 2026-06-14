import { useMemo } from 'react';
import type { TeacherStudent } from '../../services/teacherService';

type Props = {
  students: TeacherStudent[];
  selected: string[];
  search: string;
  onSearch: (q: string) => void;
  onToggle: (id: string) => void;
  onSelectAll: () => void;
  onSelectFiltered: () => void;
  onClear: () => void;
};

export default function StudentSelector({
  students,
  selected,
  search,
  onSearch,
  onToggle,
  onSelectAll,
  onSelectFiltered,
  onClear,
}: Props) {
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (s) =>
        s.nombres.toLowerCase().includes(q) ||
        s.apellidos.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q)
    );
  }, [students, search]);

  return (
    <div className="app-panel p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-slate-900 dark:text-white">
          Estudiantes asignados *
        </p>
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {selected.length} de {students.length} seleccionados
        </span>
      </div>

      <input
        type="search"
        placeholder="Buscar por nombre o correo…"
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        className="app-input mt-3 text-sm"
      />

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onSelectAll}
          className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:text-indigo-300"
        >
          Seleccionar todos
        </button>
        {search.trim() && (
          <button
            type="button"
            onClick={onSelectFiltered}
            className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
          >
            Seleccionar filtrados ({filtered.length})
          </button>
        )}
        {selected.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="rounded-lg px-2.5 py-1 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400"
          >
            Limpiar selección
          </button>
        )}
      </div>

      {!students.length && (
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
          No hay estudiantes registrados o no se pudo cargar la lista.
        </p>
      )}

      {students.length > 0 && (
        <ul className="mt-3 max-h-64 space-y-1 overflow-auto rounded-2xl border border-slate-100 bg-slate-50/60 p-2 dark:border-slate-700 dark:bg-slate-900/50">
          {filtered.map((s) => (
            <li
              key={s._id}
              className="flex items-start gap-2 rounded-xl px-2 py-1.5 hover:bg-white dark:hover:bg-slate-800"
            >
              <input
                id={`stu-${s._id}`}
                type="checkbox"
                className="mt-1 h-4 w-4 accent-indigo-600"
                checked={selected.includes(s._id)}
                onChange={() => onToggle(s._id)}
              />
              <label htmlFor={`stu-${s._id}`} className="flex-1 cursor-pointer text-sm">
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {s.nombres} {s.apellidos}
                </span>
                <span className="block text-[11px] text-slate-500 dark:text-slate-400">
                  {s.email}
                </span>
              </label>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="px-2 py-4 text-center text-xs text-slate-500">
              Ningún estudiante coincide con la búsqueda.
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
