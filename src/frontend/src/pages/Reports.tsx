import { API_URL } from "../config/env";
import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

interface Report {
  total: number;
  correctas: number;
  incorrectas: number;
  parciales: number;
  ultimas: {
    _id: string;
    text: string;
    question: string;
    answer: string;
    feedback: string;
    createdAt: string;
  }[];
}

export default function Reports() {
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await fetch(
          `${API_URL}/api/ai/reports`
        );
        const data = await res.json();
        setReport(data);
      } catch (err) {
        console.error("Error al cargar reportes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-40 rounded bg-slate-200" />
          <div className="h-7 w-72 rounded bg-slate-200" />
          <div className="h-4 w-96 rounded bg-slate-100" />
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div className="h-24 rounded-2xl bg-white shadow-sm border border-slate-100" />
            <div className="h-24 rounded-2xl bg-white shadow-sm border border-slate-100" />
            <div className="h-24 rounded-2xl bg-white shadow-sm border border-slate-100" />
          </div>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          No se pudieron cargar los reportes. Intenta nuevamente más tarde.
        </p>
      </div>
    );
  }

  // Datos para gráficos
  const pieData = [
    { name: "Correctas", value: report.correctas },
    { name: "Incorrectas", value: report.incorrectas },
    { name: "Parciales", value: report.parciales },
  ];
  const COLORS = ["#22c55e", "#ef4444", "#eab308"];

  const barData = [
    { name: "Correctas", value: report.correctas },
    { name: "Incorrectas", value: report.incorrectas },
    { name: "Parciales", value: report.parciales },
  ];

  const safePercent = (value: number) =>
    report.total > 0 ? Math.round((value / report.total) * 100) : 0;

  const correctPct = safePercent(report.correctas);
  const incorrectPct = safePercent(report.incorrectas);
  const partialPct = safePercent(report.parciales);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-8">
      {/* Migas de pan */}
      <nav className="mb-1 text-xs text-slate-500">
        <span className="hover:text-slate-700">Inicio</span>
        <span className="mx-2">/</span>
        <span className="text-slate-700">Reportes</span>
      </nav>

      {/* Encabezado */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Reportes de respuestas
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Visualiza un resumen de las respuestas evaluadas por el tutor
            virtual.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs shadow-sm">
            <p className="text-slate-500">Total de respuestas</p>
            <p className="mt-1 text-base font-semibold text-slate-900">
              {report.total}
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-2 text-xs shadow-sm">
            <p className="text-emerald-700/80">Correctas</p>
            <p className="mt-1 text-base font-semibold text-emerald-700">
              {report.correctas}{" "}
              <span className="text-xs font-normal">({correctPct}%)</span>
            </p>
          </div>
          <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-2 text-xs shadow-sm">
            <p className="text-amber-700/80">Parciales</p>
            <p className="mt-1 text-base font-semibold text-amber-700">
              {report.parciales}{" "}
              <span className="text-xs font-normal">({partialPct}%)</span>
            </p>
          </div>
          <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-2 text-xs shadow-sm">
            <p className="text-rose-700/80">Incorrectas</p>
            <p className="mt-1 text-base font-semibold text-rose-700">
              {report.incorrectas}{" "}
              <span className="text-xs font-normal">({incorrectPct}%)</span>
            </p>
          </div>
        </div>
      </header>

      {/* Sección de gráficos */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_1fr]">
        {/* Pie Chart */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Distribución de resultados
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Proporción de respuestas correctas, parciales e incorrectas.
              </p>
            </div>
          </div>

          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={90}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      name={entry.name}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string) => [
                    `${value} respuestas`,
                    name,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Leyenda simple */}
          <div className="mt-3 flex flex-wrap gap-3 text-xs">
            <div className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-slate-600">
                Correctas ({correctPct}%)
              </span>
            </div>
            <div className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-rose-500" />
              <span className="text-slate-600">
                Incorrectas ({incorrectPct}%)
              </span>
            </div>
            <div className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              <span className="text-slate-600">
                Parciales ({partialPct}%)
              </span>
            </div>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Comparativa por tipo
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Conteo de respuestas según el resultado de la evaluación.
              </p>
            </div>
          </div>

          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                />
                <Tooltip
                  formatter={(value: number) => `${value} respuestas`}
                />
                <Bar
                  dataKey="value"
                  radius={[6, 6, 0, 0]}
                  fill="#3b82f6"
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Tabla de últimas respuestas */}
      <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Últimas respuestas evaluadas
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Detalle de las últimas interacciones entre el estudiante y el
              tutor virtual.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            <span>Las respuestas pueden descargarse en un informe PDF.</span>
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border border-slate-100">
          <div className="max-h-[380px] overflow-auto">
            <table className="min-w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 sticky top-0 z-10">
                <tr>
                  <th className="px-3 py-2 font-medium">Pregunta</th>
                  <th className="px-3 py-2 font-medium">Respuesta</th>
                  <th className="px-3 py-2 font-medium">Retroalimentación</th>
                  <th className="px-3 py-2 font-medium whitespace-nowrap">
                    Fecha
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {report.ultimas.map((a) => (
                  <tr
                    key={a._id}
                    className="border-t border-slate-100 align-top hover:bg-slate-50/60"
                  >
                    <td className="px-3 py-2 text-[11px] text-slate-800">
                      {a.question}
                    </td>
                    <td className="px-3 py-2 text-[11px] text-slate-700">
                      {a.answer}
                    </td>
                    <td className="px-3 py-2 text-[11px] text-blue-700">
                      {a.feedback}
                    </td>
                    <td className="px-3 py-2 text-[11px] text-slate-500 whitespace-nowrap">
                      {new Date(a.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}

                {report.ultimas.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-3 py-6 text-center text-xs text-slate-500"
                    >
                      Aún no hay respuestas registradas para mostrar en esta
                      tabla.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Botón para descargar informe */}
        <div className="mt-4 flex flex-col gap-2 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p className="text-slate-500">
            El informe PDF resume los resultados globales y las últimas
            respuestas analizadas.
          </p>
          <a
            href={`${API_URL}/api/ai/informe`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
          >
            <span className="text-base leading-none">📄</span>
            Descargar informe PDF
          </a>
        </div>
      </section>
    </div>
  );
}