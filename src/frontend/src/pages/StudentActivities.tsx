import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

type Row = {
  _id: string;
  titulo: string;
  dueAt?: string;
  progreso: number;
  status: "draft" | "submitted";
  actualizada: string;
};

export default function StudentActivities() {
  const { token } = useAuth();
  const API = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API}/api/student/activities`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await res.json();
        setRows(data.activities ?? []);
      } finally {
        setLoading(false);
      }
    })();
  }, [API, token]);

  // Métricas derivadas para los pequeños KPIs
  const total = rows.length;
  const completadas = rows.filter((r) => r.status === "submitted").length;
  const pendientes = total - completadas;
  const progresoPromedio =
    total > 0
      ? Math.round(rows.reduce((acc, r) => acc + (r.progreso || 0), 0) / total)
      : 0;

  return (
    <div className="mx-auto max-w-6xl p-6">
      {/* Migas */}
      <nav className="mb-2 text-xs text-slate-500">
        <span className="hover:text-slate-700">Inicio</span>
        <span className="mx-2">/</span>
        <span className="text-slate-700">Mis actividades</span>
      </nav>

      <header className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mis actividades</h1>
          <p className="mt-1 text-sm text-slate-600">
            Revisa las lecturas asignadas, su fecha límite y tu avance.
          </p>
        </div>

        {!loading && total > 0 && (
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 border border-blue-100">
            <span className="inline-block h-2 w-2 rounded-full bg-blue-500" />
            {total} actividades asignadas
          </div>
        )}
      </header>

      {/* KPIs superiores */}
      <section className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500">Progreso promedio</p>
          <div className="mt-2 flex items-end gap-2">
            <p className="text-2xl font-semibold text-slate-900">
              {progresoPromedio}%
            </p>
            <div className="h-2 flex-1 rounded-full bg-slate-100">
              <div
                className="h-2 rounded-full bg-blue-600"
                style={{ width: `${progresoPromedio}%` }}
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500">Completadas</p>
          <p className="mt-2 text-2xl font-semibold text-emerald-600">
            {completadas}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Actividades marcadas como entregadas.
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500">En progreso</p>
          <p className="mt-2 text-2xl font-semibold text-amber-600">
            {pendientes < 0 ? 0 : pendientes}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Aún puedes seguir respondiendo.
          </p>
        </div>
      </section>

      {/* Lista principal */}
      <section className="mt-6 rounded-2xl border bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Asignadas</h2>
            <p className="text-xs text-slate-500">
              Revisa el detalle y completa las actividades pendientes.
            </p>
          </div>
          <span className="text-xs text-slate-500">
            {loading ? "Cargando…" : `${rows.length} items`}
          </span>
        </div>

        {loading ? (
          // Estado de carga sencillo
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-10 rounded-lg bg-slate-100/80 animate-pulse"
              />
            ))}
          </div>
        ) : rows.length === 0 ? (
          // Estado vacío
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-10 text-center">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path
                  fill="currentColor"
                  d="M7 3a2 2 0 0 0-2 2v13.5A1.5 1.5 0 0 0 6.5 20H18a2 2 0 0 0 2-2V7.414A2 2 0 0 0 19.414 6L16 2.586A2 2 0 0 0 14.586 2H7Zm0 2h6v3h3v10H7V5Z"
                />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-800">
              Aún no tienes actividades asignadas.
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Cuando tu docente te asigne una lectura, aparecerá en este
              apartado.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-slate-500">
                  <th className="py-2 pr-4 text-left">Actividad</th>
                  <th className="py-2 pr-4 text-left">Vence</th>
                  <th className="py-2 pr-4 text-left">Progreso</th>
                  <th className="py-2 text-left">Estado</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const isSubmitted = r.status === "submitted";
                  return (
                    <tr
                      key={r._id}
                      className="border-b last:border-0 hover:bg-slate-50/60"
                    >
                      <td className="py-3 pr-4 align-middle">
                        <Link
                          className="font-medium text-blue-700 hover:underline"
                          to={`/student/activities/${r._id}`}
                        >
                          {r.titulo}
                        </Link>
                        <p className="mt-1 text-[11px] text-slate-500">
                          Actualizada el{" "}
                          {new Date(r.actualizada).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="py-3 pr-4 align-middle">
                        {r.dueAt ? (
                          <span className="text-sm text-slate-800">
                            {new Date(r.dueAt).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">Sin fecha</span>
                        )}
                      </td>
                      <td className="py-3 pr-4 align-middle">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-28 rounded-full bg-slate-100">
                            <div
                              className={`h-2 rounded-full ${
                                r.progreso === 100
                                  ? "bg-emerald-500"
                                  : "bg-blue-600"
                              }`}
                              style={{ width: `${r.progreso}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-600">
                            {r.progreso}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 align-middle">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                            isSubmitted
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                              : "bg-amber-50 text-amber-700 border border-amber-100"
                          }`}
                        >
                          <span
                            className={`mr-1 h-1.5 w-1.5 rounded-full ${
                              isSubmitted ? "bg-emerald-500" : "bg-amber-500"
                            }`}
                          />
                          {isSubmitted ? "Entregada" : "En progreso"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}