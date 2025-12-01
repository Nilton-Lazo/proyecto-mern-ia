import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../config/env";

export default function StudentActivityDetail() {
  const { id } = useParams();
  const { token } = useAuth();
  const API = API_URL ?? "http://localhost:3000";

  const [data, setData] = useState<any>(null);
  const [answer, setAnswer] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch(`${API}/api/student/activities/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const d = await res.json();
      setData(d);
      setAnswer(d.answer || "");
    })();
  }, [API, id, token]);

  const saveDraft = async () => {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch(`${API}/api/student/progress`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          activityId: id,
          answer,
          progressPercent: Math.min(
            99,
            answer.trim().length > 0 ? 60 : 10
          ),
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Error al guardar");
      setMsg(`Borrador guardado (${d.progressPercent}%)`);
      setData((prev: any) => ({
        ...prev,
        progressPercent: d.progressPercent,
        status: "draft",
      }));
    } catch (e: any) {
      setMsg(e.message);
    } finally {
      setSaving(false);
    }
  };

  const submit = async () => {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch(`${API}/api/student/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ activityId: id }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "No se pudo enviar");
      setMsg("¡Entregada!");
      setData((prev: any) => ({
        ...prev,
        progressPercent: 100,
        status: "submitted",
      }));
    } catch (e: any) {
      setMsg(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (!data) {
    return (
      <div className="mx-auto max-w-6xl p-6">
        <div className="h-6 w-40 rounded-md bg-slate-200 animate-pulse mb-4" />
        <div className="h-32 rounded-2xl bg-slate-100 animate-pulse" />
      </div>
    );
  }

  const submitted = data.status === "submitted";
  const progress = Number(data.progressPercent ?? 0);

  return (
    <div className="mx-auto max-w-6xl p-6">
      {/* Migas */}
      <nav className="mb-3 text-xs text-slate-500">
        <span className="hover:text-slate-700">Inicio</span>
        <span className="mx-2">/</span>
        <span className="hover:text-slate-700">Mis actividades</span>
        <span className="mx-2">/</span>
        <span className="text-slate-700">Detalle</span>
      </nav>

      {/* Encabezado de la actividad */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{data.title}</h1>
          {data.instructions && (
            <p className="mt-1 text-sm text-slate-600">{data.instructions}</p>
          )}
        </div>

        <div className="flex flex-col items-start gap-2 sm:items-end">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium border ${
              submitted
                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                : "bg-amber-50 text-amber-700 border-amber-100"
            }`}
          >
            <span
              className={`mr-1 h-1.5 w-1.5 rounded-full ${
                submitted ? "bg-emerald-500" : "bg-amber-500"
              }`}
            />
            {submitted ? "Entregada" : "En progreso"}
          </span>

          <div className="w-full min-w-[220px]">
            <p className="text-[11px] text-slate-500 mb-1">
              Progreso: {progress}%
            </p>
            <div className="h-1.5 w-full rounded-full bg-slate-100">
              <div
                className={`h-1.5 rounded-full ${
                  submitted ? "bg-emerald-500" : "bg-blue-600"
                }`}
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Texto de la lectura */}
      <section className="mt-6 rounded-2xl border bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">
            Texto de la lectura
          </h2>
          {data.dueAt && (
            <p className="text-xs text-slate-500">
              Fecha límite:{" "}
              {new Date(data.dueAt).toLocaleDateString(undefined, {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </p>
          )}
        </div>
        <div className="rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3 text-sm leading-relaxed text-slate-800 whitespace-pre-wrap">
          {data.text}
        </div>
      </section>

      {/* Respuesta del estudiante */}
      <section className="mt-6 rounded-2xl border bg-white p-5 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <div>
            <label className="block text-sm font-semibold text-slate-900">
              Tu respuesta / notas
            </label>
            <p className="mt-1 text-xs text-slate-500">
              Puedes escribir ideas, respuestas o un borrador antes de enviar
              definitivamente la actividad.
            </p>
          </div>
        </div>

        <textarea
          className="mt-3 w-full rounded-xl border border-slate-200 bg-slate-50/60 p-3 text-sm text-slate-800 outline-none focus:border-blue-400 focus:bg-white"
          rows={10}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          disabled={submitted}
          placeholder={
            submitted
              ? "La actividad ya fue enviada."
              : "Escribe aquí tu respuesta o notas…"
          }
        />

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <button
              onClick={saveDraft}
              disabled={saving || submitted}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-black disabled:opacity-60"
            >
              {saving ? "Guardando…" : "Guardar borrador"}
            </button>
            <button
              onClick={submit}
              disabled={saving || submitted}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
            >
              {submitted ? "Actividad enviada" : "Enviar actividad"}
            </button>
          </div>

          <p className="text-xs text-slate-600">
            Progreso actual:{" "}
            <span className="font-semibold text-slate-900">
              {progress}%{" "}
            </span>
            — {submitted ? "Entregada" : "En progreso"}
          </p>
        </div>

        {msg && (
          <p className="mt-3 text-sm text-slate-700">
            {msg}
          </p>
        )}
      </section>
    </div>
  );
}