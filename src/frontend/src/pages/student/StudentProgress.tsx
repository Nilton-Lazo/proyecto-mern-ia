import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchStudentProgress, fetchSkillProgress } from '../../services/studentService';
import type { StudentProgressSummary, SkillScores, SkillRecommendation } from '../../types/student';
import ActivityStats from '../../components/student/ActivityStats';
import SkillProgressMap from '../../components/student/SkillProgressMap';
import LoadingState from '../../components/ui/LoadingState';
import ProgressBar from '../../components/ui/ProgressBar';
import Badge from '../../components/ui/Badge';
import { STATUS_LABELS, STATUS_STYLES } from '../../utils/statusHelpers';
import { formatDate } from '../../utils/formatDate';
import PageHeader from '../../components/ui/PageHeader';

export default function StudentProgress() {
  const { token } = useAuth();
  const [data, setData] = useState<StudentProgressSummary | null>(null);
  const [skillScores, setSkillScores] = useState<SkillScores>({});
  const [recommendations, setRecommendations] = useState<SkillRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [progress, skills] = await Promise.all([
          fetchStudentProgress(token),
          fetchSkillProgress(token),
        ]);
        setData(progress);
        setSkillScores(skills.skillScores ?? progress.skillScores ?? {});
        setRecommendations(skills.recommendations ?? progress.skillRecommendations ?? []);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error');
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  return (
    <div>
      <PageHeader
        badge="Mapa de mejora lectora"
        title="Mi progreso"
        subtitle="Resumen de tu avance por actividad y perfil de habilidades lectoras medido por la IA."
        crumbs={[
          { label: 'Inicio', to: '/student/home' },
          { label: 'Progreso' },
        ]}
      />

      {loading && <LoadingState />}
      {error && <p className="text-red-600">{error}</p>}

      {data && !loading && (
        <>
          <ActivityStats
            stats={[
              { label: 'Total actividades', value: data.totalActivities },
              { label: 'Pendientes', value: data.pending, accent: 'text-slate-600' },
              { label: 'En progreso', value: data.inProgress, accent: 'text-amber-600' },
              { label: 'Completadas', value: data.completed, accent: 'text-emerald-600' },
              { label: 'Vencidas', value: data.overdue, accent: 'text-red-600' },
              { label: 'Progreso promedio', value: `${data.avgProgress}%` },
            ]}
          />

          <section className="mt-8">
            <SkillProgressMap skillScores={skillScores} recommendations={recommendations} />
          </section>

          {data.activities.length === 0 ? (
            <p className="mt-8 text-sm text-slate-500 dark:text-slate-400">
              Sin datos disponibles todavía.
            </p>
          ) : (
            <section className="mt-8 space-y-3">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Detalle por actividad
              </h2>
              {data.activities.map((a) => (
                <Link
                  key={a._id}
                  to={`/student/activities/${a._id}`}
                  className="app-card block p-4 hover:ring-indigo-200 dark:hover:ring-indigo-800"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{a.titulo}</p>
                      {(a.area || a.tema) && (
                        <p className="text-xs text-indigo-600 dark:text-indigo-400">
                          {a.area}{a.tema ? ` · ${a.tema}` : ''}
                        </p>
                      )}
                    </div>
                    <Badge className={STATUS_STYLES[a.displayStatus]}>
                      {STATUS_LABELS[a.displayStatus]}
                    </Badge>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-500 dark:text-slate-400">
                    <span>Progreso: {a.progreso}%</span>
                    {a.score != null && <span>Puntaje: {a.score}%</span>}
                    <span>Vence: {formatDate(a.dueAt)}</span>
                  </div>
                  <ProgressBar value={a.progreso} className="mt-3 max-w-md" />
                </Link>
              ))}
            </section>
          )}

          <p className="mt-8 text-sm text-slate-500 dark:text-slate-400">
            Para reportes detallados e historial de práctica libre, visita{' '}
            <Link to="/student/reports" className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">
              Reportes
            </Link>
            .
          </p>
        </>
      )}
    </div>
  );
}
