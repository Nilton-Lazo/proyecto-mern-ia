import type { AreaTopicReport } from '../../types/reports';
import EmptyReportState from './EmptyReportState';

type Props = { areas: AreaTopicReport[] };

export default function TeacherAreaTopicTable({ areas }: Props) {
  if (!areas.length) {
    return <EmptyReportState message="Aún no hay entregas suficientes para generar análisis por área y tema." />;
  }

  return (
    <section className="app-card overflow-hidden p-5">
      <h2 className="text-base font-semibold text-slate-900 dark:text-white">Reporte por área y tema</h2>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-left text-xs">
          <thead className="border-b border-slate-100 text-slate-500 dark:border-slate-800">
            <tr>
              <th className="px-2 py-2 font-medium">Área</th>
              <th className="px-2 py-2 font-medium">Tema</th>
              <th className="px-2 py-2 font-medium">Asignadas</th>
              <th className="px-2 py-2 font-medium">Promedio</th>
              <th className="px-2 py-2 font-medium">Entregadas</th>
              <th className="px-2 py-2 font-medium">Pendientes</th>
              <th className="px-2 py-2 font-medium">Vencidas</th>
              <th className="px-2 py-2 font-medium">Habilidad débil</th>
            </tr>
          </thead>
          <tbody>
            {areas.map((a, i) => (
              <tr key={`${a.area}-${a.topic}-${i}`} className="border-t border-slate-50 dark:border-slate-800/80">
                <td className="px-2 py-2 font-medium">{a.area}</td>
                <td className="px-2 py-2">{a.topic}</td>
                <td className="px-2 py-2">{a.assigned}</td>
                <td className="px-2 py-2">{a.avgComprehension != null ? `${a.avgComprehension}%` : '—'}</td>
                <td className="px-2 py-2 text-emerald-600">{a.submitted}</td>
                <td className="px-2 py-2 text-amber-600">{a.pending}</td>
                <td className="px-2 py-2 text-rose-600">{a.overdue}</td>
                <td className="px-2 py-2">{a.weakestSkill || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
