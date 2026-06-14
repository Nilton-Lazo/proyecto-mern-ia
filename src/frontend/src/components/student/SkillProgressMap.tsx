import type { SkillScores, SkillRecommendation } from '../../types/student';
import { SKILL_LABELS, skillBarColor } from '../../utils/skillScoring';
import type { QuestionType } from '../../types/student';

const SKILL_ORDER: QuestionType[] = [
  'literal',
  'inferential',
  'critical',
  'vocabulary',
  'main_idea',
];

type Props = {
  skillScores?: SkillScores;
  recommendations?: SkillRecommendation[];
  compact?: boolean;
};

export default function SkillProgressMap({ skillScores, recommendations, compact }: Props) {
  const hasData = SKILL_ORDER.some((s) => skillScores?.[s] != null);

  if (!hasData) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-8 text-center dark:border-slate-700 dark:bg-slate-900/40">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
          Mapa de mejora lectora
        </p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Completa y envía actividades para ver tu perfil de habilidades lectoras.
        </p>
      </div>
    );
  }

  return (
    <div className={`app-card ${compact ? 'p-4' : 'p-5'}`}>
      <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
        Mapa de mejora lectora
      </h3>
      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
        Habilidades medidas por la IA según tus respuestas
      </p>

      <div className={`mt-4 space-y-3 ${compact ? '' : 'sm:grid sm:grid-cols-2 sm:gap-4 sm:space-y-0'}`}>
        {SKILL_ORDER.map((skill) => {
          const v = skillScores?.[skill];
          if (v == null) return null;
          return (
            <div key={skill}>
              <div className="mb-1 flex justify-between text-xs">
                <span className="font-medium text-slate-700 dark:text-slate-200">
                  {SKILL_LABELS[skill]}
                </span>
                <span className="text-slate-500 dark:text-slate-400">{v}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className={`h-2 rounded-full transition-all ${skillBarColor(v)}`}
                  style={{ width: `${Math.min(100, v)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {recommendations && recommendations.length > 0 && (
        <ul className="mt-4 space-y-2 border-t border-slate-100 pt-3 dark:border-slate-800">
          {recommendations.slice(0, 3).map((r) => (
            <li key={r.skill} className="text-xs text-slate-600 dark:text-slate-300">
              <span
                className={
                  r.level === 'alto'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : r.level === 'medio'
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-rose-600 dark:text-rose-400'
                }
              >
                ●
              </span>{' '}
              {r.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
