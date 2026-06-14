import type { SkillReportItem } from '../../types/reports';
import { skillLevelColor } from '../../utils/reportFormatters';
import { skillBarColor } from '../../utils/skillScoring';
import EmptyReportState from './EmptyReportState';

type Props = {
  skills: SkillReportItem[];
  title?: string;
  subtitle?: string;
};

export default function SkillMap({
  skills,
  title = 'Mapa de mejora lectora',
  subtitle = 'Habilidades medidas por la IA según evidencias de aprendizaje',
}: Props) {
  const withData = skills.filter((s) => s.percentage != null);

  if (!withData.length) {
    return (
      <EmptyReportState
        title="Mapa de habilidades lectoras"
        message="El mapa de habilidades se generará cuando respondas actividades evaluadas por IA."
      />
    );
  }

  return (
    <section className="app-card p-5">
      <h2 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h2>
      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {withData.map((sk) => (
          <div
            key={sk.skill}
            className="rounded-xl border border-slate-100 p-4 dark:border-slate-800"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{sk.label}</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{sk.percentage}%</p>
              </div>
              {sk.levelLabel && (
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${skillLevelColor(sk.level)}`}>
                  {sk.levelLabel}
                </span>
              )}
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className={`h-2 rounded-full ${skillBarColor(sk.percentage)}`}
                style={{ width: `${Math.min(100, sk.percentage ?? 0)}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{sk.recommendation}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
