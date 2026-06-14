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
              <th className="px-2 py-2 font-medium">Área</th>
              <th className="px-2 py-2 font-medium">Promedio</th>
              <th className="px-2 py-2 font-medium">Parciales</th>
              <th className="px-2 py-2 font-medium">Incorrectas</th>
              <th className="px-2 py-2 font-medium">Sin entregar</th>
            </tr>
          </thead>
          <tbody>
            {activities.map((a) => (
              <tr key={a.activityId} className="border-t border-slate-50 dark:border-slate-800/80">
                <td className="px-2 py-2 font-medium text-slate-800 dark:text-slate-100">{a.titulo}</td>
                <td className="px-2 py-2">{a.area}</td>
                <td className="px-2 py-2">{a.avgComprehension != null ? `${a.avgComprehension}%` : '—'}</td>
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
