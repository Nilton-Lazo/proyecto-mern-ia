import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

type Activity = {
  _id: string;
  titulo: string;
  estudiantesAsignados: number;
  entregas: number;           // cuántos enviaron respuesta
  progresoPromedio: number;   // 0..100
  creadaEn: string;
};

export default function TeacherDashboard() {
  const { token, user } = useAuth();
  const API = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Activity[]>([]);
  const [kpi, setKpi] = useState({
    actividades: 0,
    estudiantes: 0,
    progreso: 0,
  });

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        // Si aún no tienes backend, esto dejará valores demo visibles.
        const res = await fetch(`${API}/api/teacher/activities/summary`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }).catch(() => null);

        if (!cancel && res && res.ok) {
          const data = await res.json();
          setRows(data.activities ?? []);
          setKpi({
            actividades: data.countActivities ?? 0,
            estudiantes: data.countStudents ?? 0,
            progreso: data.avgProgress ?? 0,
          });
        } else if (!cancel) {
          // DEMO: datos de muestra para que se vea algo
          setRows([
            {
              _id: 'a1',
              titulo: 'Lectura: “Energía y cambio climático”',
              estudiantesAsignados: 24,
              entregas: 18,
              progresoPromedio: 72,
              creadaEn: '2025-10-15',
            },
            {
              _id: 'a2',
              titulo: 'Análisis crítico: “El papel de la IA en la educación”',
              estudiantesAsignados: 24,
              entregas: 11,
              progresoPromedio: 46,
              creadaEn: '2025-10-27',
            },
          ]);
          setKpi({ actividades: 2, estudiantes: 24, progreso: 59 });
        }
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => { cancel = true; };
  }, [API, token]);

  return (
    <div className="mx-auto max-w-6xl p-6">
      {/* Migas */}
      <nav className="mb-2 text-xs text-slate-500">
        <span className="hover:text-slate-700">Inicio</span>
        <span className="mx-2">/</span>
        <span className="text-slate-700">Panel docente</span>
      </nav>

      <h1 className="text-2xl font-bold text-slate-900">
        Hola{user?.nombres ? `, ${user.nombres}` : ''} — Panel docente
      </h1>
      <p className="mt-1 text-sm text-slate-600">
        Gestiona actividades, revisa avances y asigna nuevas lecturas.
      </p>

      {/* KPIs */}
      <section className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-xs text-slate-500">Actividades</p>
          <p className="mt-1 text-3xl font-semibold text-slate-900">
            {kpi.actividades}
          </p>
        </div>
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-xs text-slate-500">Estudiantes</p>
          <p className="mt-1 text-3xl font-semibold text-slate-900">
            {kpi.estudiantes}
          </p>
        </div>
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-xs text-slate-500">Progreso promedio</p>
          <div className="mt-2 flex items-end gap-2">
            <p className="text-3xl font-semibold text-slate-900">
              {Math.round(kpi.progreso)}%
            </p>
            <div className="h-2 flex-1 rounded-full bg-slate-100">
              <div
                className="h-2 rounded-full bg-blue-600"
                style={{ width: `${Math.min(100, Math.max(0, kpi.progreso))}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Acciones rápidas */}
      <div className="mt-6 flex flex-wrap gap-3">
        <a
          href="/teacher/assign"
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          + Asignar nueva actividad
        </a>
        <a
          href="/reports"
          className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-slate-700 hover:bg-slate-50"
        >
          Ver reportes
        </a>
      </div>

      {/* Tabla actividades */}
      <section className="mt-6 rounded-2xl border bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Actividades asignadas</h2>
          <span className="text-xs text-slate-500">
            {loading ? 'Cargando…' : rows.length ? `${rows.length} items` : 'Sin datos disponibles'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b text-slate-500">
                <th className="py-2 pr-4">Actividad</th>
                <th className="py-2 pr-4">Asignados</th>
                <th className="py-2 pr-4">Entregas</th>
                <th className="py-2 pr-4">Progreso</th>
                <th className="py-2">Creada</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-500">
                    Sin datos disponibles
                  </td>
                </tr>
              )}
              {rows.map((a) => (
                <tr key={a._id} className="border-b last:border-0">
                  <td className="py-3 pr-4">
                    <p className="font-medium text-slate-900">{a.titulo}</p>
                  </td>
                  <td className="py-3 pr-4">{a.estudiantesAsignados}</td>
                  <td className="py-3 pr-4">{a.entregas}</td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-28 rounded-full bg-slate-100">
                        <div
                          className="h-2 rounded-full bg-blue-600"
                          style={{ width: `${a.progresoPromedio}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-600">
                        {a.progresoPromedio}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3">{new Date(a.creadaEn).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}