import { Link } from 'react-router-dom';
import type { StudentActivityRow } from '../../types/student';
import Badge from '../ui/Badge';
import ProgressBar from '../ui/ProgressBar';
import { STATUS_LABELS, STATUS_STYLES } from '../../utils/statusHelpers';
import { formatDate } from '../../utils/formatDate';

function actionLabel(status: StudentActivityRow['displayStatus']): string {
  if (status === 'entregada') return 'Ver retroalimentación';
  if (status === 'pendiente') return 'Iniciar';
  if (status === 'vencida') return 'Revisar';
  return 'Continuar';
}

type Props = { activity: StudentActivityRow };

export default function ActivityCard({ activity: r }: Props) {
  return (
    <article className="app-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-semibold text-slate-900 dark:text-white">{r.titulo}</h3>
          <Badge className={STATUS_STYLES[r.displayStatus]}>
            {STATUS_LABELS[r.displayStatus]}
          </Badge>
        </div>
        {(r.tema || r.area) && (
          <p className="mt-1 text-xs text-indigo-600 dark:text-indigo-400">
            {r.area}{r.tema ? ` · ${r.tema}` : ''}
          </p>
        )}
        {r.descripcion && (
          <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
            {r.descripcion}
          </p>
        )}
        <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-slate-500 dark:text-slate-400">
          {r.docente && <span>Docente: {r.docente}</span>}
          <span>Vence: {formatDate(r.dueAt)}</span>
          <span>{r.preguntasCount ?? 0} preguntas IA</span>
        </div>
        <div className="mt-2 max-w-xs">
          <ProgressBar
            value={r.progreso}
            color={r.displayStatus === 'entregada' ? 'emerald' : 'blue'}
          />
        </div>
      </div>
      <Link
        to={`/student/activities/${r._id}`}
        className="shrink-0 rounded-xl bg-indigo-600 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-indigo-700"
      >
        {actionLabel(r.displayStatus)}
      </Link>
    </article>
  );
}
