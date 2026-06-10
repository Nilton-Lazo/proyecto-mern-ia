import type { ActivityQuestion, QuestionAnswer } from '../../types/student';
import { QUESTION_TYPE_LABELS } from '../../utils/statusHelpers';
import Badge from '../ui/Badge';

type Props = {
  questions: ActivityQuestion[];
  answers: QuestionAnswer[];
  onAnswerChange: (index: number, value: string) => void;
  onFeedback?: (index: number) => void;
  loadingFeedback?: number | null;
  readOnly?: boolean;
  showFeedback?: boolean;
};

export default function QuestionList({
  questions,
  answers,
  onAnswerChange,
  onFeedback,
  loadingFeedback,
  readOnly,
  showFeedback = true,
}: Props) {
  if (!questions.length) return null;

  const grouped = questions.reduce<Record<string, ActivityQuestion[]>>((acc, q) => {
    const key = q.type || 'literal';
    if (!acc[key]) acc[key] = [];
    acc[key].push(q);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([type, qs]) => (
        <div key={type}>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-indigo-600">
            {QUESTION_TYPE_LABELS[type] || type}
          </h3>
          <div className="space-y-4">
            {qs.map((q) => {
              const globalIndex = questions.findIndex(
                (x) => x.questionText === q.questionText && x.order === q.order
              );
              const ans = answers[globalIndex]?.answer ?? '';
              const fb = answers[globalIndex]?.feedback ?? '';
              return (
                <article
                  key={`${type}-${q.order}`}
                  className="rounded-2xl bg-slate-50/80 p-4 ring-1 ring-slate-100"
                >
                  <div className="flex items-start gap-3">
                    <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                      {q.order}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-900">{q.questionText}</p>
                      <textarea
                        className="mt-3 w-full resize-none rounded-xl border-0 bg-white p-3 text-sm text-slate-800 ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-400 disabled:bg-slate-100"
                        rows={3}
                        placeholder="Escribe tu respuesta…"
                        value={ans}
                        disabled={readOnly}
                        onChange={(e) => onAnswerChange(globalIndex, e.target.value)}
                      />
                      {!readOnly && onFeedback && (
                        <button
                          type="button"
                          onClick={() => onFeedback(globalIndex)}
                          disabled={!ans.trim() || loadingFeedback === globalIndex}
                          className="mt-2 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                        >
                          {loadingFeedback === globalIndex ? 'Evaluando…' : 'Obtener retroalimentación'}
                        </button>
                      )}
                      {showFeedback && fb && (
                        <div className="mt-3 rounded-xl bg-blue-50 p-3 text-xs text-blue-900 ring-1 ring-blue-100">
                          <p className="font-semibold">Retroalimentación IA</p>
                          <p className="mt-1">{fb}</p>
                          {answers[globalIndex]?.isCorrect && (
                            <Badge className="mt-2 bg-white/80 text-blue-800 border-blue-200">
                              {answers[globalIndex].isCorrect}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
