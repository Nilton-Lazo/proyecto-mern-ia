import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

type Row = {
  _id: string;
  titulo: string;
  dueAt?: string;
  progreso: number;
  status: 'draft'|'submitted';
  actualizada: string;
};

export default function StudentActivities() {
  const { token } = useAuth();
  const API = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
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

  return (
    <div className="mx-auto max-w-6xl p-6">
      <h1 className="text-2xl font-bold text-slate-900">Mis actividades</h1>

      <section className="mt-6 rounded-2xl border bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Asignadas</h2>
          <span className="text-xs text-slate-500">{loading ? 'Cargando…' : `${rows.length} items`}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-slate-500">
                <th className="py-2 pr-4">Actividad</th>
                <th className="py-2 pr-4">Vence</th>
                <th className="py-2 pr-4">Progreso</th>
                <th className="py-2">Estado</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r._id} className="border-b last:border-0">
                  <td className="py-3 pr-4">
                    <Link className="text-blue-700 hover:underline" to={`/student/activities/${r._id}`}>
                      {r.titulo}
                    </Link>
                  </td>
                  <td className="py-3 pr-4">{r.dueAt ? new Date(r.dueAt).toLocaleDateString() : '—'}</td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-28 rounded-full bg-slate-100">
                        <div className="h-2 rounded-full bg-blue-600" style={{ width: `${r.progreso}%` }} />
                      </div>
                      <span className="text-xs text-slate-600">{r.progreso}%</span>
                    </div>
                  </td>
                  <td className="py-3">{r.status === 'submitted' ? 'Entregada' : 'En progreso'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}