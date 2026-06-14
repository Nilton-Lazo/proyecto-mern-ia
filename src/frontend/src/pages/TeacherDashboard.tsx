import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PageHeader from "../components/ui/PageHeader";

type Activity = {
  _id: string;
  titulo: string;
  estudiantesAsignados: number;
  entregas: number; // cuántos enviaron respuesta
  progresoPromedio: number; // 0..100
  creadaEn: string;
};

export default function TeacherDashboard() {
  const { token, user } = useAuth();
  const API = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Activity[]>([]);
  const [kpi, setKpi] = useState({
    actividades: 0,
    estudiantes: 0,
    progreso: 0,
  });
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
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
          // Datos demo si el backend no responde
          setRows([
            {
              _id: "a1",
              titulo: "Lectura: “Energía y cambio climático”",
              estudiantesAsignados: 24,
              entregas: 18,
              progresoPromedio: 72,
              creadaEn: "2025-10-15",
            },
            {
              _id: "a2",
              titulo: "Análisis crítico: “El papel de la IA en la educación”",
              estudiantesAsignados: 24,
              entregas: 11,
              progresoPromedio: 46,
              creadaEn: "2025-10-27",
            },
          ]);
          setKpi({ actividades: 2, estudiantes: 24, progreso: 59 });
        }
      } finally {
        if (!cancel) setLoading(false);
      }
    })();

    return () => {
      cancel = true;
    };
  }, [API, token]);

  // Derivados para mostrar en UI
  const totalEntregas = useMemo(
    () => rows.reduce((acc, a) => acc + (a.entregas || 0), 0),
    [rows]
  );
  const promedioPorActividad = useMemo(
    () =>
      kpi.actividades > 0
        ? Math.round((kpi.estudiantes / kpi.actividades) * 10) / 10
        : 0,
    [kpi.actividades, kpi.estudiantes]
  );

  const filteredRows = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.toLowerCase();
    return rows.filter((a) => a.titulo.toLowerCase().includes(q));
  }, [rows, search]);

  const progresoLabel = (value: number) => {
    if (value >= 70) return "Alto";
    if (value >= 40) return "Medio";
    return "Bajo";
  };

  const progresoBadgeClasses = (value: number) => {
    if (value >= 70)
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (value >= 40) return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-rose-50 text-rose-700 border-rose-200";
  };

  return (
    <div>
      <PageHeader
        badge="Panel docente"
        title={`Hola${user?.nombres ? `, ${user.nombres.split(" ")[0]}` : ""}`}
        subtitle="Gestiona actividades, revisa avances y asigna nuevas lecturas."
        crumbs={[{ label: "Inicio", to: "/" }, { label: "Panel docente" }]}
        action={
          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            Datos actualizados en tiempo real
          </div>
        }
      />

      {/* KPIs */}
      <section className="mt-6 grid gap-4 sm:grid-cols-3">
        {/* Actividades */}
        <div className="app-card relative overflow-hidden p-5">
          <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-blue-50 dark:bg-blue-950/40" />
          <div className="relative flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Actividades
              </p>
              <p className="mt-1 text-3xl font-semibold text-slate-900 dark:text-white">
                {kpi.actividades}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Promedio de {promedioPorActividad || 0} estudiantes por lectura
              </p>
            </div>
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.7}
              >
                <path
                  d="M4 5h9l1 2h6v11H4V5Z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Estudiantes */}
        <div className="app-card relative overflow-hidden p-5">
          <div className="absolute -right-8 -bottom-8 h-24 w-24 rounded-full bg-sky-50 dark:bg-sky-950/40" />
          <div className="relative flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Estudiantes
              </p>
              <p className="mt-1 text-3xl font-semibold text-slate-900">
                {kpi.estudiantes}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {totalEntregas} entregas recibidas
              </p>
            </div>
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.7}
              >
                <path
                  d="M5 20v-1a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v1"
                  strokeLinecap="round"
                />
                <circle cx="12" cy="8" r="3" />
              </svg>
            </div>
          </div>
        </div>

        {/* Progreso promedio */}
        <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-blue-600 to-indigo-600 p-5 text-white shadow-sm">
          <div className="absolute -right-10 -bottom-10 h-28 w-28 rounded-full bg-white/10" />
          <div className="relative">
            <p className="text-xs font-medium uppercase tracking-wide text-blue-100">
              Progreso promedio
            </p>
            <div className="mt-2 flex items-end gap-3">
              <p className="text-3xl font-semibold">
                {Math.round(kpi.progreso)}%
              </p>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-blue-100">
                {progresoLabel(kpi.progreso)}
              </span>
            </div>
            <div className="mt-3 h-2 w-full rounded-full bg-blue-500/40">
              <div
                className="h-2 rounded-full bg-white"
                style={{
                  width: `${Math.min(100, Math.max(0, kpi.progreso))}%`,
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Acciones rápidas */}
      <div className="mt-7 flex flex-wrap gap-3">
        <Link
          to="/teacher/assign"
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
        >
          <span className="text-lg leading-none">＋</span>
          Asignar nueva actividad
        </Link>
        <Link
          to="/reports"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          📊 Ver reportes
        </Link>
      </div>

      {/* Tabla actividades */}
      <section className="app-card mt-7 p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Actividades asignadas
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Revisa el avance de tus lecturas y entregas por grupo.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar actividad…"
                className="app-input w-48 py-1.5 pr-8 text-xs"
              />
              <span className="pointer-events-none absolute right-2 top-1.5 text-slate-400">
                🔍
              </span>
            </div>
            <span className="text-xs text-slate-500">
              {loading
                ? "Cargando…"
                : filteredRows.length
                ? `${filteredRows.length} ítems`
                : "Sin datos disponibles"}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800/80 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">Actividad</th>
                <th className="px-4 py-3 text-center">Asignados</th>
                <th className="px-4 py-3 text-center">Entregas</th>
                <th className="px-4 py-3">Progreso</th>
                <th className="px-4 py-3 text-center">Estado</th>
                <th className="px-4 py-3">Creada</th>
              </tr>
            </thead>
            <tbody>
              {loading && rows.length === 0 && (
                <>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="border-t border-slate-100 dark:border-slate-800">
                      <td className="px-4 py-4" colSpan={6}>
                        <div className="h-3 w-full animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                      </td>
                    </tr>
                  ))}
                </>
              )}

              {!loading && filteredRows.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-sm text-slate-500"
                  >
                    No se encontraron actividades que coincidan con la búsqueda.
                  </td>
                </tr>
              )}

              {filteredRows.map((a, idx) => (
                <tr
                  key={a._id}
                  className={`border-t border-slate-100 dark:border-slate-800 ${
                    idx % 2 === 0 ? "bg-white dark:bg-slate-900/50" : "bg-slate-50/30 dark:bg-slate-800/30"
                  }`}
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900 dark:text-white">{a.titulo}</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      ID: {a._id.slice(0, 6)}…
                    </p>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {a.estudiantesAsignados}
                  </td>
                  <td className="px-4 py-3 text-center">{a.entregas}</td>
                  <td className="px-4 py-3">
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
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${progresoBadgeClasses(
                        a.progresoPromedio
                      )}`}
                    >
                      {progresoLabel(a.progresoPromedio)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {new Date(a.creadaEn).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}