import type { PedagogicalAlert } from '../../types/reports';

type Props = { alerts: PedagogicalAlert[] };

export default function PedagogicalAlerts({ alerts }: Props) {
  if (!alerts.length) return null;

  const color = (s: string) =>
    s === 'warning'
      ? 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200'
      : 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-200';

  return (
    <section className="app-card p-5">
      <h2 className="text-base font-semibold text-slate-900 dark:text-white">Alertas de seguimiento</h2>
      <ul className="mt-4 space-y-2">
        {alerts.map((a, i) => (
          <li key={i} className={`rounded-xl border px-4 py-3 text-sm ${color(a.severity)}`}>
            {a.message}
          </li>
        ))}
      </ul>
    </section>
  );
}
