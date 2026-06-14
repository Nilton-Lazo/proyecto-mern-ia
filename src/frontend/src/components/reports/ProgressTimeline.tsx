import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { TimelinePoint } from '../../types/reports';
import EmptyReportState from './EmptyReportState';

type Props = { timeline: TimelinePoint[] };

export default function ProgressTimeline({ timeline }: Props) {
  if (!timeline.length) {
    return (
      <EmptyReportState message="La evolución del progreso aparecerá cuando completes más actividades." />
    );
  }

  return (
    <section className="app-card p-5">
      <h2 className="text-base font-semibold text-slate-900 dark:text-white">Evolución del progreso</h2>
      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
        Progreso y comprensión a lo largo del tiempo
      </p>
      <div className="mt-4 h-52">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={timeline}>
            <CartesianGrid strokeDasharray="3 3" stroke="#33415533" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
            <Tooltip />
            <Line type="monotone" dataKey="avgProgress" name="Progreso %" stroke="#8b5cf6" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="avgComprehension" name="Comprensión %" stroke="#10b981" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
