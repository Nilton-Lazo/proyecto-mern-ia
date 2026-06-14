import type { ActivityDifficulty } from '../../types/reports';
import EmptyReportState from './EmptyReportState';

type Props = { activities: ActivityDifficulty[] };

export default function ActivityDifficultyTable({ activities }: Props) {
  if (!activities.length) {
    return <EmptyReportState message="No hay actividades con datos suficientes para analizar dificultad." />;
  }

  return (
    <section className="app-card overflow-hidden p-5">
      <h2 className="text-base font-semibold text-slate-900 dark:text-white">Actividades con mayor dificultad</h2>
      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
        Lecturas que requieren refuerzo pedagógico según evidencias del grupo
      </p>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-left text-xs">
          <thead className="border-b border-slate-100 text-slate-500 dark:border-slate-800">
            <tr>
              <th className="px-2 py-2 font-medium">Actividad</th>
              <th className="px-2 py-2 font-medium">Área / Tema</th>
              <th className="px-2 py-2 font-medium">Promedio</th>
              <th className="px-2 py-2 font-medium">Nivel</th>
              <th className="px-2 py-2 font-medium">Parciales</th>
              <th className="px-2 py-2 font-medium">Incorrectas</th>
              <th className="px-2 py-2 font-medium">Sin entregar</th>
            </tr>
          </thead>
          <tbody>
            {activities.map((a) => (
              <tr key={a.activityId} className="border-t border-slate-50 dark:border-slate-800/80">
                <td className="px-2 py-2 font-medium text-slate-800 dark:text-slate-100">{a.titulo}</td>
                <td className="px-2 py-2">
                  {a.area}
                  {a.tema ? <span className="block text-[10px] text-slate-400">{a.tema}</span> : null}
                </td>
                <td className="px-2 py-2">
                  {a.avgComprehension != null ? `${a.avgComprehension}%` : 'Sin evaluar'}
                </td>
                <td className="px-2 py-2">
                  <DifficultyBadge level={a.difficulty} />
                </td>
                <td className="px-2 py-2 text-amber-600">{a.partialAnswers}</td>
                <td className="px-2 py-2 text-rose-600">{a.incorrectAnswers}</td>
                <td className="px-2 py-2">{a.notSubmitted}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function DifficultyBadge({ level }: { level: string }) {
  const styles =
    level === 'alta'
      ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300'
      : level === 'media'
        ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300';
  const label = level === 'alta' ? 'Alta' : level === 'media' ? 'Media' : 'Baja';
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${styles}`}>{label}</span>
  );
}
