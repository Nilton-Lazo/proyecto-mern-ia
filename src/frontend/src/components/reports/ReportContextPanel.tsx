type Props = {
  isIndividual?: boolean;
  studentName?: string;
};

export default function ReportContextPanel({ isIndividual, studentName }: Props) {
  return (
    <section className="app-card border-indigo-100 bg-gradient-to-br from-indigo-50/80 to-white p-5 dark:border-indigo-900/40 dark:from-indigo-950/30 dark:to-slate-900/40">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
            Evidencia para certificación ICACIT
          </p>
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            {isIndividual && studentName
              ? `Seguimiento individual — ${studentName}`
              : 'Seguimiento pedagógico del grupo'}
          </h2>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            Este módulo consolida evidencias de aprendizaje generadas por el Tutor Virtual con IA:
            lecturas asignadas, preguntas clasificadas por habilidad lectora, evaluación automática
            y retroalimentación formativa. Los indicadores permiten tomar decisiones pedagógicas
            basadas en datos reales de aula.
          </p>
        </div>
        <dl className="grid min-w-[220px] gap-2 text-xs sm:grid-cols-2">
          <Metric label="Comprensión" desc="Promedio de entregas evaluadas por IA" />
          <Metric label="Participación" desc="% de estudiantes con al menos una entrega" />
          <Metric label="Habilidades" desc="Literal, inferencial, crítica, vocabulario, idea principal" />
          <Metric label="Trazabilidad" desc="Respuestas, feedback y fechas registradas" />
        </dl>
      </div>
    </section>
  );
}

function Metric({ label, desc }: { label: string; desc: string }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-white/70 px-3 py-2 dark:border-slate-800 dark:bg-slate-900/50">
      <dt className="font-semibold text-slate-800 dark:text-slate-100">{label}</dt>
      <dd className="mt-0.5 text-slate-500 dark:text-slate-400">{desc}</dd>
    </div>
  );
}
