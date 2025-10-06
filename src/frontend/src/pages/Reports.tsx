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
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/ai/reports`);
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

  if (loading) return <p className="p-6">Cargando reportes...</p>;
  if (!report) return <p className="p-6 text-red-600">No se pudieron cargar los reportes.</p>;

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

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold">Reportes de Respuestas</h1>
      <p className="text-gray-600">Total de respuestas: {report.total}</p>

      {/* Sección de gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Distribución</h2>
          <ResponsiveContainer width="100%" height={250}>
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
                <Cell key={`cell-${index}`} name={entry.name} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Comparativa</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabla minimalista */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-3">Últimas respuestas</h2>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-2">Pregunta</th>
              <th className="p-2">Respuesta</th>
              <th className="p-2">Feedback</th>
              <th className="p-2">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {report.ultimas.map((a) => (
              <tr key={a._id} className="border-b hover:bg-gray-50 text-sm">
                <td className="p-2">{a.question}</td>
                <td className="p-2">{a.answer}</td>
                <td className="p-2 text-blue-700">{a.feedback}</td>
                <td className="p-2">{new Date(a.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Botón para descargar informe */}
        <div className="mt-4 flex justify-end">
            <a
                href={`${import.meta.env.VITE_API_URL}/api/ai/informe`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
                📄 Descargar Informe PDF
            </a>
        </div>
      </div>
    </div>
  );
}
