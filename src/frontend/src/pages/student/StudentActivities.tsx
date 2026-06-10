import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchStudentActivities } from '../../services/studentService';
import type { StudentActivityRow } from '../../types/student';
import ActivityStats from '../../components/student/ActivityStats';
import ActivityFilters from '../../components/student/ActivityFilters';
import EmptyState from '../../components/ui/EmptyState';
import LoadingState from '../../components/ui/LoadingState';
import ProgressBar from '../../components/ui/ProgressBar';
import Badge from '../../components/ui/Badge';
import {
  filterActivities,
  sortByDueDate,
  STATUS_LABELS,
  STATUS_STYLES,
  type ActivityFilter,
} from '../../utils/statusHelpers';
import { formatDate } from '../../utils/formatDate';

function actionLabel(status: StudentActivityRow['displayStatus']): string {
  if (status === 'entregada') return 'Ver retroalimentación';
  if (status === 'pendiente') return 'Iniciar';
  return 'Continuar';
}

export default function StudentActivities() {
  const { token } = useAuth();
  const [rows, setRows] = useState<StudentActivityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<ActivityFilter>('todas');
  const [search, setSearch] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetchStudentActivities(token);
        const normalized = (res.activities ?? []).map((r) => ({
          ...r,
          displayStatus:
            r.displayStatus ??
            (r.status === 'submitted'
              ? 'entregada'
              : (r.progreso ?? 0) > 0
                ? 'en_progreso'
                : 'pendiente'),
        }));
        setRows(normalized);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error al cargar');
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { todas: rows.length };
    rows.forEach((r) => {
      const k = r.displayStatus || 'pendiente';
      c[k] = (c[k] || 0) + 1;
    });
    return c;
  }, [rows]);

  const filtered = useMemo(
    () => sortByDueDate(filterActivities(rows, filter, search)),
    [rows, filter, search]
  );

  const pending = rows.filter((r) => r.displayStatus === 'pendiente').length;
  const inProgress = rows.filter((r) => r.displayStatus === 'en_progreso').length;
  const completed = rows.filter((r) => r.displayStatus === 'entregada').length;
  const avgProgress = rows.length
    ? Math.round(rows.reduce((a, r) => a + r.progreso, 0) / rows.length)
    : 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <nav className="mb-2 text-xs text-slate-500">
        <Link to="/student/home" className="hover:text-slate-700">Inicio</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-700">Mis actividades</span>
      </nav>

      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Mis actividades</h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-600">
          Revisa las lecturas asignadas por tus docentes, responde con apoyo de IA y mejora tu
          comprensión lectora.
        </p>
      </header>

      {error && (
        <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      <ActivityStats
        stats={[
          { label: 'Pendientes', value: pending, accent: 'text-slate-700' },
          { label: 'En progreso', value: inProgress, accent: 'text-amber-600' },
          { label: 'Completadas', value: completed, accent: 'text-emerald-600' },
          { label: 'Progreso promedio', value: `${avgProgress}%` },
        ]}
      />

      <section className="mt-8 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
        <ActivityFilters
          filter={filter}
          onFilter={setFilter}
          search={search}
          onSearch={setSearch}
          counts={counts}
        />

        <div className="mt-6">
          {loading ? (
            <LoadingState />
          ) : filtered.length === 0 ? (
            <EmptyState
              title="No hay actividades para mostrar"
              description={
                rows.length === 0
                  ? 'Cuando tu docente te asigne una lectura, aparecerá aquí.'
                  : 'Prueba otro filtro o término de búsqueda.'
              }
              action={
                rows.length === 0 ? (
                  <Link
                    to="/student/practice"
                    className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
                  >
                    Practicar con IA
                  </Link>
                ) : undefined
              }
            />
          ) : (
            <div className="space-y-3">
              {filtered.map((r) => (
                <article
                  key={r._id}
                  className="flex flex-col gap-4 rounded-2xl bg-slate-50/50 p-4 ring-1 ring-slate-100 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-slate-900">{r.titulo}</h3>
                      <Badge className={STATUS_STYLES[r.displayStatus]}>
                        {STATUS_LABELS[r.displayStatus]}
                      </Badge>
                    </div>
                    {r.descripcion && (
                      <p className="mt-1 line-clamp-2 text-xs text-slate-500">{r.descripcion}</p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-slate-500">
                      <span>Vence: {formatDate(r.dueAt)}</span>
                      <span>{r.preguntasCount ?? 0} preguntas IA</span>
                    </div>
                    <div className="mt-2 max-w-xs">
                      <ProgressBar
                        value={r.progreso}
                        color={r.displayStatus === 'entregada' ? 'emerald' : 'blue'}
                      />
                    </div>
                  </div>
                  <Link
                    to={`/student/activities/${r._id}`}
                    className="shrink-0 rounded-xl bg-indigo-600 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-indigo-700"
                  >
                    {actionLabel(r.displayStatus)}
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
