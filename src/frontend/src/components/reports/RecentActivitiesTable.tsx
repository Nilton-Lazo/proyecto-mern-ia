import { Link } from 'react-router-dom';
import type { RecentActivityRow } from '../../types/reports';
import { formatDate } from '../../utils/formatDate';
import EmptyReportState from './EmptyReportState';

type Props = { activities: RecentActivityRow[]; detailBasePath?: string };

export default function RecentActivitiesTable({
  activities,
  detailBasePath = '/student/activities',
}: Props) {
  if (!activities.length) {
    return (
      <EmptyReportState message="No hay actividades evaluadas recientes para mostrar." />
    );
  }

  return (
    <section className="app-card overflow-hidden p-5">
      <h2 className="text-base font-semibold text-slate-900 dark:text-white">Últimas actividades evaluadas</h2>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-left text-xs">
          <thead className="border-b border-slate-100 text-slate-500 dark:border-slate-800">
            <tr>
              <th className="px-2 py-2 font-medium">Actividad</th>
              <th className="px-2 py-2 font-medium">Área</th>
              <th className="px-2 py-2 font-medium">Tema</th>
              <th className="px-2 py-2 font-medium">Fecha</th>
              <th className="px-2 py-2 font-medium">Comprensión</th>
              <th className="px-2 py-2 font-medium">Habilidad fuerte</th>
              <th className="px-2 py-2 font-medium">Por mejorar</th>
              <th className="px-2 py-2 font-medium">Acción</th>
            </tr>
          </thead>
          <tbody>
            {activities.map((a) => (
              <tr key={a.activityId} className="border-t border-slate-50 dark:border-slate-800/80">
                <td className="px-2 py-2 font-medium text-slate-800 dark:text-slate-100">{a.titulo}</td>
                <td className="px-2 py-2 text-slate-600 dark:text-slate-400">{a.area}</td>
                <td className="px-2 py-2 text-slate-600 dark:text-slate-400">{a.tema || '—'}</td>
                <td className="px-2 py-2 whitespace-nowrap text-slate-500">{formatDate(a.fecha)}</td>
                <td className="px-2 py-2">{a.score != null ? `${a.score}%` : '—'}</td>
                <td className="px-2 py-2 text-emerald-600">{a.strongestSkill || '—'}</td>
                <td className="px-2 py-2 text-amber-600">{a.weakestSkill || '—'}</td>
                <td className="px-2 py-2">
                  <Link
                    to={`${detailBasePath}/${a.activityId}`}
                    className="text-indigo-600 hover:underline dark:text-indigo-400"
                  >
                    Ver detalle
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
