import { useState } from 'react';
import type { AreaGroup } from '../../types/student';
import ActivityCard from './ActivityCard';

type Props = { group: AreaGroup; defaultOpen?: boolean };

export default function ActivityAreaGroup({ group, defaultOpen = true }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const { stats } = group;

  return (
    <section className="app-card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 p-4 text-left hover:bg-slate-50/80 dark:hover:bg-slate-800/50"
      >
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            {group.area}
          </h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {stats.total} actividad{stats.total === 1 ? '' : 'es'} ·{' '}
            {stats.pendiente} pend. · {stats.en_progreso} en progreso ·{' '}
            {stats.entregada} entregadas
            {stats.vencida > 0 ? ` · ${stats.vencida} vencidas` : ''}
          </p>
        </div>
        <span className="text-slate-400">{open ? '▾' : '▸'}</span>
      </button>

      {open && (
        <div className="space-y-3 border-t border-slate-100 p-4 dark:border-slate-800">
          {group.activities.map((a) => (
            <ActivityCard key={a._id} activity={a} />
          ))}
        </div>
      )}
    </section>
  );
}
