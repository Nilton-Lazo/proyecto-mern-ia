type Props = {
  title?: string;
  message: string;
};

export default function EmptyReportState({
  title = 'Sin datos disponibles',
  message,
}: Props) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-10 text-center dark:border-slate-700 dark:bg-slate-900/40">
      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{title}</p>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{message}</p>
    </div>
  );
}
