import EmptyReportState from './EmptyReportState';

type Props = {
  recommendations: string[];
  emptyMessage?: string;
};

export default function RecommendationsPanel({
  recommendations,
  emptyMessage = 'No hay suficientes evidencias para generar recomendaciones. Completa más actividades para visualizar tu progreso.',
}: Props) {
  if (!recommendations.length) {
    return <EmptyReportState title="Recomendaciones" message={emptyMessage} />;
  }

  return (
    <section className="app-card p-5">
      <h2 className="text-base font-semibold text-slate-900 dark:text-white">Recomendaciones personalizadas</h2>
      <ul className="mt-4 space-y-2">
        {recommendations.map((r, i) => (
          <li
            key={i}
            className="flex gap-2 rounded-xl bg-violet-50 px-4 py-3 text-sm text-violet-900 dark:bg-violet-950/30 dark:text-violet-200"
          >
            <span className="text-violet-500">✦</span>
            {r}
          </li>
        ))}
      </ul>
    </section>
  );
}
