import type { AiAnalysis } from '../../types/student';
import Card from '../ui/Card';
import Badge from '../ui/Badge';

type Props = {
  analysis: AiAnalysis;
  biases?: string[];
  loading?: boolean;
};

export default function AIAnalysisPanel({ analysis, biases = [], loading }: Props) {
  if (loading) {
    return (
      <Card title="Análisis de IA" subtitle="Procesando el texto…">
        <div className="h-24 animate-pulse rounded-xl bg-slate-100" />
      </Card>
    );
  }

  const hasContent =
    analysis.mainIdea ||
    (analysis.keywords?.length ?? 0) > 0 ||
    biases.length > 0;

  if (!hasContent) {
    return (
      <Card title="Análisis de IA" subtitle="Genera preguntas para analizar el texto.">
        <p className="text-sm text-slate-500">
          Aquí verás la idea principal, palabras clave y posibles sesgos detectados.
        </p>
      </Card>
    );
  }

  return (
    <Card title="Análisis de IA" subtitle="Comprensión y lectura crítica">
      <div className="space-y-4 text-sm">
        {analysis.mainIdea && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
              Idea principal
            </p>
            <p className="mt-1 text-slate-700">{analysis.mainIdea}</p>
          </div>
        )}
        {analysis.difficulty && (
          <p className="text-xs text-slate-500">
            Dificultad estimada:{' '}
            <span className="font-medium capitalize text-slate-700">{analysis.difficulty}</span>
          </p>
        )}
        {(analysis.keywords?.length ?? 0) > 0 && (
          <div>
            <p className="text-xs font-semibold text-slate-600">Palabras clave</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {analysis.keywords!.map((k) => (
                <Badge key={k} className="bg-sky-50 text-sky-700 border-sky-100">
                  {k}
                </Badge>
              ))}
            </div>
          </div>
        )}
        {biases.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-slate-600">Sesgos detectados</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {biases.map((b) => (
                <Badge key={b} className="bg-amber-50 text-amber-800 border-amber-100">
                  {b}
                </Badge>
              ))}
            </div>
          </div>
        )}
        {analysis.readingTip && (
          <div className="rounded-xl bg-indigo-50/80 p-3 text-xs text-indigo-900">
            <span className="font-semibold">Consejo: </span>
            {analysis.readingTip}
          </div>
        )}
      </div>
    </Card>
  );
}
