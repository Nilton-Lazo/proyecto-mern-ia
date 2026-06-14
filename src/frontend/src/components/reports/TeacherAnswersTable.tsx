import type { TeacherAnswerRow } from '../../types/reports';
import { evaluationColor, evaluationLabel } from '../../utils/reportFormatters';
import { formatDate } from '../../utils/formatDate';
import EmptyReportState from './EmptyReportState';

type Props = { answers: TeacherAnswerRow[] };

export default function TeacherAnswersTable({ answers }: Props) {
  if (!answers.length) {
    return <EmptyReportState message="No hay respuestas evaluadas recientes del grupo." />;
  }

  return (
    <section className="app-card overflow-hidden p-5">
      <h2 className="text-base font-semibold text-slate-900 dark:text-white">Últimas respuestas evaluadas por IA</h2>
      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
        Evidencias recientes con evaluación automática y retroalimentación formativa
      </p>
      <div className="mt-4 max-h-[400px] overflow-auto">
        <table className="min-w-full text-left text-xs">
          <thead className="sticky top-0 bg-white text-slate-500 dark:bg-slate-900 dark:text-slate-400">
            <tr>
              <th className="px-2 py-2 font-medium">Estudiante</th>
              <th className="px-2 py-2 font-medium">Actividad</th>
              <th className="px-2 py-2 font-medium">Área</th>
              <th className="px-2 py-2 font-medium">Pregunta</th>
              <th className="px-2 py-2 font-medium">Respuesta</th>
              <th className="px-2 py-2 font-medium">Evaluación</th>
              <th className="px-2 py-2 font-medium">Retroalimentación</th>
              <th className="px-2 py-2 font-medium">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {answers.map((a, i) => (
              <tr key={i} className="border-t border-slate-50 align-top dark:border-slate-800/80">
                <td className="px-2 py-2">{a.studentName}</td>
                <td className="px-2 py-2">{a.activityTitle}</td>
                <td className="px-2 py-2">{a.area}</td>
                <td className="px-2 py-2 max-w-[180px]">{a.question}</td>
                <td className="px-2 py-2 max-w-[140px] text-slate-600 dark:text-slate-300">{a.answer}</td>
                <td className={`px-2 py-2 ${evaluationColor(a.evaluation)}`}>
                  {evaluationLabel(a.evaluation)}
                </td>
                <td className="px-2 py-2 max-w-[200px] text-blue-700 dark:text-blue-300">{a.feedback}</td>
                <td className="px-2 py-2 whitespace-nowrap">{formatDate(a.fecha)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
