import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchStudentProgress } from '../../services/studentService';
import type { StudentProgressSummary } from '../../types/student';
import ActivityStats from '../../components/student/ActivityStats';
import LoadingState from '../../components/ui/LoadingState';
import Card from '../../components/ui/Card';
import { STATUS_LABELS, STATUS_STYLES } from '../../utils/statusHelpers';
import { formatDate } from '../../utils/formatDate';
import Badge from '../../components/ui/Badge';
import PageHeader from '../../components/ui/PageHeader';

export default function StudentHome() {
  const { user, token } = useAuth();
  const [data, setData] = useState<StudentProgressSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const firstName = user?.nombres?.split(' ')[0] || 'estudiante';

  useEffect(() => {
    (async () => {
      try {
        const res = await fetchStudentProgress(token);
        setData(res);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error al cargar');
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const pending = data?.activities.filter((a) => a.displayStatus === 'pendiente' || a.displayStatus === 'en_progreso').slice(0, 3) ?? [];

  return (
    <div>
      <PageHeader
        badge="Panel del estudiante"
        title={`Hola, ${firstName}`}
        subtitle="Bienvenido a tu espacio de aprendizaje con IA. Completa las lecturas asignadas por tus docentes y practica comprensión lectora cuando quieras."
        crumbs={[{ label: 'Inicio', to: '/student/home' }]}
      />

      {loading && <LoadingState label="Cargando tu resumen…" />}
      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300">{error}</p>
      )}

      {data && !loading && (
        <>
          <ActivityStats
            stats={[
              {
                label: 'Pendientes',
                value: data.pending + data.inProgress,
                hint: 'Actividades por completar',
                accent: 'text-amber-600',
              },
              {
                label: 'Completadas',
                value: data.completed,
                hint: 'Entregadas con éxito',
                accent: 'text-emerald-600',
              },
              {
                label: 'Progreso promedio',
                value: `${data.avgProgress}%`,
                hint: 'Avance general',
              },
              {
                label: 'Comprensión',
                value: data.avgScore != null ? `${data.avgScore}%` : '—',
                hint: 'Promedio en actividades evaluadas',
                accent: 'text-indigo-600',
              },
            ]}
          />

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <Card title="Accesos rápidos" subtitle="Continúa aprendiendo">
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  to={data.lastActivity ? `/student/activities/${data.lastActivity._id}` : '/student/activities'}
                  className="flex-1 rounded-xl bg-indigo-600 px-4 py-3 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
                >
                  {data.lastActivity ? 'Continuar actividad' : 'Ver mis actividades'}
                </Link>
                <Link
                  to="/student/practice"
                  className="flex-1 rounded-xl bg-white px-4 py-3 text-center text-sm font-semibold text-indigo-700 ring-1 ring-indigo-200 hover:bg-indigo-50"
                >
                  Practicar con IA
                </Link>
              </div>
            </Card>

            <Card title="Consejo de lectura" subtitle="Recomendación del tutor virtual">
              <p className="text-sm text-slate-700 dark:text-slate-300">
                Lee el texto completo antes de responder. Subraya ideas clave, formula preguntas
                propias y usa la retroalimentación de IA para mejorar tu comprensión.
              </p>
              <Link to="/student/progress" className="mt-3 inline-block text-xs font-medium text-indigo-600 hover:underline">
                Ver mi progreso detallado →
              </Link>
            </Card>
          </div>

          <section className="mt-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Actividades pendientes</h2>
              <Link to="/student/activities" className="text-xs font-medium text-indigo-600 hover:underline">
                Ver todas
              </Link>
            </div>
            {pending.length === 0 ? (
              <p className="text-sm text-slate-500">No tienes actividades pendientes. ¡Buen trabajo!</p>
            ) : (
              <div className="grid gap-3">
                {pending.map((a) => (
                  <Link
                    key={a._id}
                    to={`/student/activities/${a._id}`}
                    className="app-card flex flex-wrap items-center justify-between gap-3 p-4 transition hover:ring-indigo-200 dark:hover:ring-indigo-800"
                  >
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{a.titulo}</p>
                      <p className="text-xs text-slate-500">Vence: {formatDate(a.dueAt)}</p>
                    </div>
                    <Badge className={STATUS_STYLES[a.displayStatus]}>
                      {STATUS_LABELS[a.displayStatus]}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
