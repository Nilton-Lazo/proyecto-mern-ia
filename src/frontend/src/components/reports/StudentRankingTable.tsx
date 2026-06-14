import type { StudentRankingRow } from '../../types/reports';
import { studentStatusColor } from '../../utils/reportFormatters';
import EmptyReportState from './EmptyReportState';

type Props = {
  students: StudentRankingRow[];
  onSelectStudent?: (studentId: string) => void;
};

export default function StudentRankingTable({ students, onSelectStudent }: Props) {
  if (!students.length) {
    return <EmptyReportState message="Aún no hay estudiantes asignados para generar análisis del grupo." />;
  }

  return (
    <section className="app-card overflow-hidden p-5">
      <h2 className="text-base font-semibold text-slate-900 dark:text-white">Seguimiento de estudiantes</h2>
      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
        Avance, comprensión y habilidades que requieren acompañamiento
      </p>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-left text-xs">
          <thead className="border-b border-slate-100 text-slate-500 dark:border-slate-800">
            <tr>
              <th className="px-2 py-2 font-medium">Estudiante</th>
              <th className="px-2 py-2 font-medium">Completadas</th>
              <th className="px-2 py-2 font-medium">Progreso</th>
              <th className="px-2 py-2 font-medium">Comprensión</th>
              <th className="px-2 py-2 font-medium">Habilidad más baja</th>
              <th className="px-2 py-2 font-medium">Estado</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.studentId} className="border-t border-slate-50 dark:border-slate-800/80">
                <td className="px-2 py-2 font-medium text-slate-800 dark:text-slate-100">
                  {onSelectStudent ? (
                    <button
                      type="button"
                      onClick={() => onSelectStudent(s.studentId)}
                      className="text-left text-indigo-600 hover:underline dark:text-indigo-400"
                    >
                      {s.nombres} {s.apellidos}
                    </button>
                  ) : (
                    <>{s.nombres} {s.apellidos}</>
                  )}
                </td>
                <td className="px-2 py-2">{s.completed}/{s.total}</td>
                <td className="px-2 py-2">{s.avgProgress}%</td>
                <td className="px-2 py-2">{s.avgComprehension != null ? `${s.avgComprehension}%` : '—'}</td>
                <td className="px-2 py-2 text-amber-600">{s.weakestSkill || '—'}</td>
                <td className="px-2 py-2">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${studentStatusColor(s.status)}`}>
                    {s.statusLabel}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
