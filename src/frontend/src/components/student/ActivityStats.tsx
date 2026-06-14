import ProgressBar from '../ui/ProgressBar';

type Stat = { label: string; value: string | number; hint?: string; accent?: string };

type Props = { stats: Stat[] };

export default function ActivityStats({ stats }: Props) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((s) => (
        <div key={s.label} className="app-card p-4">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{s.label}</p>
          <p className={`mt-1 text-2xl font-bold ${s.accent || 'text-slate-900 dark:text-white'}`}>
            {s.value}
          </p>
          {s.hint && <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">{s.hint}</p>}
          {s.label.toLowerCase().includes('progreso') &&
            typeof s.value === 'string' &&
            s.value.includes('%') && (
              <ProgressBar value={parseInt(String(s.value), 10) || 0} className="mt-3" />
            )}
        </div>
      ))}
    </section>
  );
}
