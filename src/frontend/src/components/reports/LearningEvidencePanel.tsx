import type { EvidenceItem } from '../../types/reports';
import { evaluationColor, evaluationLabel } from '../../utils/reportFormatters';
import { formatDate } from '../../utils/formatDate';
import EmptyReportState from './EmptyReportState';

type Props = {
  evidence: EvidenceItem[];
  role: 'student' | 'teacher';
};

export default function LearningEvidencePanel({ evidence, role }: Props) {
  if (!evidence.length) {
    return (
      <EmptyReportState
        title="Evidencia de aprendizaje con IA"
        message="Las interacciones evaluadas por IA aparecerán aquí como evidencia académica organizada."
      />
    );
  }

  return (
    <section className="app-card border-indigo-100 p-5 dark:border-indigo-900/50">
      <div className="flex items-start gap-3">
        <span className="text-2xl" aria-hidden>🎓</span>
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            Evidencia de aprendizaje con IA
          </h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {role === 'student'
              ? 'Actividades trabajadas, habilidades evaluadas y retroalimentación registrada por el sistema.'
              : 'Evidencia por estudiante con trazabilidad pedagógica — diferenciador frente a un chat genérico.'}
          </p>
        </div>
      </div>
      <div className="mt-4 space-y-3">
        {evidence.map((e, i) => (
          <article key={i} className="rounded-xl border border-indigo-100/80 p-4 dark:border-indigo-900/40">
            <div className="flex flex-wrap gap-2 text-xs text-slate-500">
              {e.studentName && (
                <span className="font-medium text-slate-700 dark:text-slate-200">
                  {e.studentName}
                </span>
              )}
              <span className="text-indigo-600 dark:text-indigo-400">{e.skill}</span>
              <span>· {formatDate(e.fecha)}</span>
              <span className={`ml-auto ${evaluationColor(e.evaluation)}`}>
                {evaluationLabel(e.evaluation)}
              </span>
            </div>
            <p className="mt-1 text-sm font-medium">{e.activityTitle}</p>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{e.answer}</p>
            <p className="mt-2 text-xs text-blue-700 dark:text-blue-300">{e.feedback}</p>
            {e.recommendation && (
              <p className="mt-1 text-xs text-violet-600 dark:text-violet-400">{e.recommendation}</p>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
