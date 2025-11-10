import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function StudentActivityDetail() {
  const { id } = useParams();
  const { token } = useAuth();
  const API = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

  const [data, setData] = useState<any>(null);
  const [answer, setAnswer] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string| null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch(`${API}/api/student/activities/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const d = await res.json();
      setData(d);
      setAnswer(d.answer || '');
    })();
  }, [API, id, token]);

  const saveDraft = async () => {
    setSaving(true); setMsg(null);
    try {
      const res = await fetch(`${API}/api/student/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ activityId: id, answer, progressPercent: Math.min(99, (answer.trim().length>0?60:10)) })
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Error al guardar');
      setMsg(`Borrador guardado (${d.progressPercent}%)`);
      setData((prev:any)=>({ ...prev, progressPercent: d.progressPercent, status: 'draft' }));
    } catch(e:any) {
      setMsg(e.message);
    } finally { setSaving(false); }
  };

  const submit = async () => {
    setSaving(true); setMsg(null);
    try {
      const res = await fetch(`${API}/api/student/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ activityId: id })
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'No se pudo enviar');
      setMsg('¡Entregada!');
      setData((prev:any)=>({ ...prev, progressPercent: 100, status: 'submitted' }));
    } catch(e:any) { setMsg(e.message); }
    finally { setSaving(false); }
  };

  if (!data) return <div className="p-6">Cargando…</div>;

  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="text-2xl font-bold">{data.title}</h1>
      {data.instructions && <p className="mt-1 text-slate-600">{data.instructions}</p>}
      <div className="mt-4 p-4 rounded-xl border bg-white shadow-sm whitespace-pre-wrap">{data.text}</div>

      <div className="mt-6 rounded-xl border bg-white p-4 shadow-sm">
        <label className="block text-sm font-medium text-slate-700">Tu respuesta / notas</label>
        <textarea
          className="mt-1 w-full rounded-lg border p-2 outline-none focus:border-blue-400"
          rows={8}
          value={answer}
          onChange={e=>setAnswer(e.target.value)}
        />
        <div className="mt-3 flex items-center gap-3">
          <button onClick={saveDraft} disabled={saving || data.status==='submitted'} className="rounded-lg bg-slate-900 px-4 py-2 text-white disabled:opacity-60">
            Guardar borrador
          </button>
          <button onClick={submit} disabled={saving || data.status==='submitted'} className="rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-60">
            Enviar actividad
          </button>
          <span className="text-sm text-slate-600">Progreso: {data.progressPercent}% — {data.status==='submitted'?'Entregada':'En progreso'}</span>
        </div>
        {msg && <p className="mt-2 text-sm text-slate-700">{msg}</p>}
      </div>
    </div>
  );
}