import type { FeedbackItem } from '../../types/reports';
import { evaluationColor, evaluationLabel } from '../../utils/reportFormatters';
import { formatDate } from '../../utils/formatDate';
import EmptyReportState from './EmptyReportState';

type Props = { items: FeedbackItem[] };

export default function RecentFeedbackList({ items }: Props) {
  if (!items.length) {
    return (
      <EmptyReportState message="Aún no hay retroalimentación de IA registrada en tus actividades." />
    );
  }

  return (
    <section className="app-card p-5">
      <h2 className="text-base font-semibold text-slate-900 dark:text-white">Retroalimentación reciente de IA</h2>
      <div className="mt-4 space-y-3">
        {items.map((item, i) => (
          <article
            key={`${item.activityTitle}-${i}`}
            className="rounded-xl border border-slate-100 p-4 dark:border-slate-800"
          >
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-medium text-indigo-600 dark:text-indigo-400">{item.skillLabel}</span>
              <span>·</span>
              <span>{item.area}</span>
              <span>·</span>
              <span>{formatDate(item.fecha)}</span>
              <span className={`ml-auto font-medium ${evaluationColor(item.evaluation)}`}>
                {evaluationLabel(item.evaluation)}
              </span>
            </div>
            <p className="mt-2 text-sm font-medium text-slate-800 dark:text-slate-100">{item.question}</p>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
              <span className="font-medium">Tu respuesta:</span> {item.answer}
            </p>
            <p className="mt-2 text-xs text-blue-700 dark:text-blue-300">{item.feedback}</p>
            {item.recommendation && (
              <p className="mt-1 text-xs text-violet-600 dark:text-violet-400">💡 {item.recommendation}</p>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
