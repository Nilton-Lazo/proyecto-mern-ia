type Props = {
  status: 'idle' | 'saving' | 'saved' | 'error';
  lastSavedAt?: Date | null;
  errorMsg?: string | null;
};

export default function AutoSaveStatus({ status, lastSavedAt, errorMsg }: Props) {
  if (status === 'idle' && !lastSavedAt) return null;

  const timeLabel =
    lastSavedAt &&
    lastSavedAt.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex items-center gap-2 text-xs">
      {status === 'saving' && (
        <span className="text-amber-600 dark:text-amber-400">Guardando…</span>
      )}
      {status === 'saved' && (
        <span className="text-emerald-600 dark:text-emerald-400">
          Borrador guardado{timeLabel ? ` · ${timeLabel}` : ''}
        </span>
      )}
      {status === 'error' && (
        <span className="text-red-600 dark:text-red-400">
          Error al guardar{errorMsg ? `: ${errorMsg}` : ''}. Intenta nuevamente.
        </span>
      )}
      {status === 'idle' && lastSavedAt && (
        <span className="text-slate-500 dark:text-slate-400">
          Último guardado: {timeLabel}
        </span>
      )}
    </div>
  );
}
