import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchStudentProgress } from '../../services/studentService';
import type { StudentProgressSummary } from '../../types/student';
import ActivityStats from '../../components/student/ActivityStats';
import LoadingState from '../../components/ui/LoadingState';
import ProgressBar from '../../components/ui/ProgressBar';
import Badge from '../../components/ui/Badge';
import { STATUS_LABELS, STATUS_STYLES } from '../../utils/statusHelpers';
import { formatDate } from '../../utils/formatDate';

export default function StudentProgress() {
  const { token } = useAuth();
  const [data, setData] = useState<StudentProgressSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setData(await fetchStudentProgress(token));
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error');
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <nav className="mb-2 text-xs text-slate-500">
        <Link to="/student/home" className="hover:text-slate-700">Inicio</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-700">Progreso</span>
      </nav>

      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Mi progreso</h1>
        <p className="mt-1 text-sm text-slate-600">
          Resumen de tu avance en las actividades asignadas y tu desempeño en comprensión lectora.
        </p>
      </header>

      {loading && <LoadingState />}
      {error && <p className="text-red-600">{error}</p>}

      {data && !loading && (
        <>
          <ActivityStats
            stats={[
              { label: 'Total actividades', value: data.totalActivities },
              { label: 'En progreso', value: data.inProgress, accent: 'text-amber-600' },
              { label: 'Completadas', value: data.completed, accent: 'text-emerald-600' },
              { label: 'Progreso promedio', value: `${data.avgProgress}%` },
            ]}
          />

          {data.activities.length === 0 ? (
            <p className="mt-8 text-sm text-slate-500">Sin datos disponibles todavía.</p>
          ) : (
            <section className="mt-8 space-y-3">
              <h2 className="text-lg font-semibold text-slate-900">Detalle por actividad</h2>
              {data.activities.map((a) => (
                <Link
                  key={a._id}
                  to={`/student/activities/${a._id}`}
                  className="block rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100 hover:ring-indigo-200"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium text-slate-900">{a.titulo}</p>
                    <Badge className={STATUS_STYLES[a.displayStatus]}>
                      {STATUS_LABELS[a.displayStatus]}
                    </Badge>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-500">
                    <span>Progreso: {a.progreso}%</span>
                    {a.score != null && <span>Puntaje: {a.score}%</span>}
                    <span>Vence: {formatDate(a.dueAt)}</span>
                  </div>
                  <ProgressBar value={a.progreso} className="mt-3 max-w-md" />
                </Link>
              ))}
            </section>
          )}

          <p className="mt-8 text-sm text-slate-500">
            Para reportes detallados e historial de respuestas de práctica libre, visita{' '}
            <Link to="/reports" className="font-medium text-indigo-600 hover:underline">
              Reportes
            </Link>
            .
          </p>
        </>
      )}
    </div>
  );
}
