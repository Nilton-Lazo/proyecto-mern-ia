import Card from '../ui/Card';
import ProgressBar from '../ui/ProgressBar';

type Props = {
  score?: number | null;
  summary?: string;
  recommendation?: string;
  motivation?: string;
};

export default function FeedbackPanel({ score, summary, recommendation, motivation }: Props) {
  if (score == null && !summary) return null;

  return (
    <Card title="Resultado de tu actividad" subtitle="Retroalimentación general">
      <div className="space-y-4">
        {score != null && (
          <div>
            <p className="text-xs text-slate-500">Puntaje de comprensión</p>
            <p className="text-3xl font-bold text-indigo-600">{score}%</p>
            <ProgressBar value={score} color="emerald" className="mt-2 max-w-xs" />
          </div>
        )}
        {summary && (
          <p className="text-sm text-slate-700">
            <span className="font-semibold">Resumen: </span>
            {summary}
          </p>
        )}
        {recommendation && (
          <div className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
            <span className="font-semibold">Recomendación: </span>
            {recommendation}
          </div>
        )}
        {motivation && (
          <div className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">
            {motivation}
          </div>
        )}
      </div>
    </Card>
  );
}
