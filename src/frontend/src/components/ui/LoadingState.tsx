type Props = { label?: string; rows?: number };

export default function LoadingState({ label = 'Cargando…', rows = 3 }: Props) {
  return (
    <div className="space-y-3" aria-busy="true" aria-label={label}>
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-12 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
      ))}
    </div>
  );
}
