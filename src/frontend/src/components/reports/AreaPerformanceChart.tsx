import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { AreaPerformance } from '../../types/reports';
import EmptyReportState from './EmptyReportState';

type Props = { areas: AreaPerformance[] };

export default function AreaPerformanceChart({ areas }: Props) {
  if (!areas.length) {
    return (
      <EmptyReportState message="No hay desempeño por área todavía. Completa actividades para visualizar tu progreso." />
    );
  }

  const data = areas.map((a) => ({
    name: a.area.length > 12 ? `${a.area.slice(0, 12)}…` : a.area,
    fullName: a.area,
    comprension: a.avgComprehension ?? 0,
    completadas: a.completed,
  }));

  return (
    <section className="app-card p-5">
      <h2 className="text-base font-semibold text-slate-900 dark:text-white">Desempeño por área curricular</h2>
      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
        Promedio de comprensión y actividades completadas por área
      </p>

      <div className="mt-4 h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#33415533" />
            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 11 }} />
            <Tooltip
              formatter={(v: number, name: string) => [
                name === 'comprension' ? `${v}%` : v,
                name === 'comprension' ? 'Comprensión' : 'Completadas',
              ]}
              labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName || ''}
            />
            <Bar dataKey="comprension" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={14} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {areas.map((a) => (
          <div key={a.area} className="rounded-lg bg-slate-50 px-3 py-2 text-xs dark:bg-slate-900/50">
            <span className="font-medium text-slate-700 dark:text-slate-200">{a.area}</span>
            <span className="text-slate-500 dark:text-slate-400">
              {' '}· {a.completed}/{a.total} completadas
              {a.topTopic ? ` · Tema: ${a.topTopic}` : ''}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
