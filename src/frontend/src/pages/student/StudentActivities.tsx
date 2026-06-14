import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchStudentActivities } from '../../services/studentService';
import type { StudentActivityRow, AreaGroup } from '../../types/student';
import ActivityStats from '../../components/student/ActivityStats';
import ActivityFilters from '../../components/student/ActivityFilters';
import ActivityAreaGroup from '../../components/student/ActivityAreaGroup';
import ActivityCard from '../../components/student/ActivityCard';
import EmptyState from '../../components/ui/EmptyState';
import LoadingState from '../../components/ui/LoadingState';
import PageHeader from '../../components/ui/PageHeader';
import {
  filterActivities,
  sortByDueDate,
  type ActivityFilter,
} from '../../utils/statusHelpers';
import { AREA_FILTER_ALL } from '../../constants/curricularAreas';

function buildGroups(rows: StudentActivityRow[]): AreaGroup[] {
  const map = new Map<string, AreaGroup>();
  rows.forEach((r) => {
    const key = r.area || 'Otro';
    if (!map.has(key)) {
      map.set(key, {
        area: key,
        activities: [],
        stats: { total: 0, pendiente: 0, en_progreso: 0, entregada: 0, vencida: 0 },
      });
    }
    const g = map.get(key)!;
    g.activities.push(r);
    g.stats.total++;
    const st = r.displayStatus;
    if (st === 'pendiente') g.stats.pendiente++;
    else if (st === 'en_progreso') g.stats.en_progreso++;
    else if (st === 'entregada') g.stats.entregada++;
    else if (st === 'vencida') g.stats.vencida++;
  });
  return [...map.values()].sort((a, b) => a.area.localeCompare(b.area, 'es'));
}

export default function StudentActivities() {
  const { token } = useAuth();
  const [rows, setRows] = useState<StudentActivityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<ActivityFilter>('todas');
  const [areaFilter, setAreaFilter] = useState(AREA_FILTER_ALL);
  const [search, setSearch] = useState('');
  const [viewGrouped, setViewGrouped] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchStudentActivities(token, {
          area: areaFilter !== AREA_FILTER_ALL ? areaFilter : undefined,
          status: filter !== 'todas' ? filter : undefined,
          search,
        });
        const normalized = (res.activities ?? []).map((r) => ({
          ...r,
          area: r.area || 'Comunicación',
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
  }, [token, areaFilter, filter, search]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { todas: rows.length };
    rows.forEach((r) => {
      const k = r.displayStatus || 'pendiente';
      c[k] = (c[k] || 0) + 1;
    });
    return c;
  }, [rows]);

  const filtered = useMemo(
    () => sortByDueDate(filterActivities(rows, filter, search, areaFilter)),
    [rows, filter, search, areaFilter]
  );

  const grouped = useMemo(() => buildGroups(filtered), [filtered]);

  const pending = rows.filter((r) => r.displayStatus === 'pendiente').length;
  const inProgress = rows.filter((r) => r.displayStatus === 'en_progreso').length;
  const completed = rows.filter((r) => r.displayStatus === 'entregada').length;
  const overdue = rows.filter((r) => r.displayStatus === 'vencida').length;
  const avgProgress = rows.length
    ? Math.round(rows.reduce((a, r) => a + r.progreso, 0) / rows.length)
    : 0;

  return (
    <div>
      <PageHeader
        badge="Ruta de aprendizaje con IA"
        title="Mis actividades"
        subtitle="Organiza tus lecturas por área, responde con apoyo de IA y revisa tu progreso."
        crumbs={[
          { label: 'Inicio', to: '/student/home' },
          { label: 'Mis actividades' },
        ]}
      />

      {error && (
        <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300">
          {error}
        </p>
      )}

      <ActivityStats
        stats={[
          { label: 'Pendientes', value: pending, accent: 'text-slate-700 dark:text-slate-200' },
          { label: 'En progreso', value: inProgress, accent: 'text-amber-600' },
          { label: 'Completadas', value: completed, accent: 'text-emerald-600' },
          { label: 'Vencidas', value: overdue, accent: 'text-red-600' },
          { label: 'Progreso promedio', value: `${avgProgress}%` },
        ]}
      />

      <section className="app-card mt-8 p-5">
        <ActivityFilters
          filter={filter}
          onFilter={setFilter}
          areaFilter={areaFilter}
          onAreaFilter={setAreaFilter}
          search={search}
          onSearch={setSearch}
          counts={counts}
        />

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={() => setViewGrouped((v) => !v)}
            className="text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
          >
            {viewGrouped ? 'Ver lista plana' : 'Ver por áreas'}
          </button>
        </div>

        <div className="mt-6">
          {loading ? (
            <LoadingState />
          ) : filtered.length === 0 ? (
            <EmptyState
              title="No hay actividades para mostrar"
              description={
                rows.length === 0
                  ? 'Cuando tu docente te asigne una lectura, aparecerá aquí organizada por área.'
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
          ) : viewGrouped ? (
            <div className="space-y-4">
              {grouped.map((g) => (
                <ActivityAreaGroup key={g.area} group={g} />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((r) => (
                <ActivityCard key={r._id} activity={r} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
