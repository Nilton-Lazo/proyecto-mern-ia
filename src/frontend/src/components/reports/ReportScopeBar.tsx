import type { StudentRankingRow } from '../../types/reports';

type Props = {
  studentId?: string;
  students: StudentRankingRow[];
  onChange: (studentId: string | undefined) => void;
};

export default function ReportScopeBar({ studentId, students, onChange }: Props) {
  const selected = students.find((s) => s.studentId === studentId);

  return (
    <div className="app-card flex flex-wrap items-end gap-3 p-4">
      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Alcance del reporte</span>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              !studentId
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200'
            }`}
          >
            Todo el grupo
          </button>
          {students.map((s) => (
            <button
              key={s.studentId}
              type="button"
              onClick={() => onChange(s.studentId)}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                studentId === s.studentId
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200'
              }`}
            >
              {s.nombres} {s.apellidos}
            </button>
          ))}
        </div>
      </div>
      {selected && (
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Viendo datos de <strong className="text-slate-700 dark:text-slate-200">{selected.nombres} {selected.apellidos}</strong>
          {' '}· {selected.completed}/{selected.total} entregas · {selected.statusLabel}
        </p>
      )}
    </div>
  );
}
