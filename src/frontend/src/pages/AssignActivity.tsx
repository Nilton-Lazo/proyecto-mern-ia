import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

type Student = { _id: string; nombres: string; apellidos: string; email: string };

export default function AssignActivity() {
  const { token, user } = useAuth();
  const API = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

  // Form state
  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [textBody, setTextBody] = useState(""); // texto de lectura (pegado o cargado)
  const [dueAt, setDueAt] = useState<string>("");
  const [selected, setSelected] = useState<string[]>([]);

  // UI state
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  // Catálogo de estudiantes (simple)
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    // Si aún no existe el endpoint, el UI sigue funcionando con lista vacía.
    const fetchStudents = async () => {
      try {
        const res = await fetch(`${API}/api/teacher/students`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error("No se pudieron obtener estudiantes");
        const data = await res.json();
        setStudents(Array.isArray(data?.students) ? data.students : []);
      } catch {
        setStudents([]); // fallback silencioso
      }
    };
    fetchStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onPick = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  const onFile = async (f: File | null) => {
    if (!f) return;
    setErr(null);
    // Aceptamos .txt / .md de forma nativa. PDF/Docs los dejaremos para iteración 2.
    if (!/\.(txt|md|markdown)$/i.test(f.name)) {
      setErr("Formato no soportado. Usa .txt o pega el texto manualmente.");
      return;
    }
    const content = await f.text();
    setTextBody(content);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setOkMsg(null);

    if (!title.trim()) return setErr("El título es obligatorio.");
    if (!textBody.trim()) return setErr("Debes incluir el texto de lectura.");
    if (!selected.length) return setErr("Selecciona al menos un estudiante.");

    try {
      setLoading(true);
      const payload = {
        title: title.trim(),
        instructions: instructions.trim(),
        text: textBody,
        dueAt: dueAt || null,
        assignees: selected, // array de _id de estudiantes
      };

      // Este endpoint lo conectamos en el backend en el siguiente paso de HU04:
      // POST /api/teacher/activities
      const res = await fetch(`${API}/api/teacher/activities`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "No se pudo asignar la actividad");
      }

      setOkMsg("Actividad asignada correctamente.");
      // Limpieza rápida
      setTitle("");
      setInstructions("");
      setTextBody("");
      setDueAt("");
      setSelected([]);
    } catch (e: any) {
      setErr(e?.message || "Error inesperado al asignar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      {/* Migas */}
      <nav className="mb-2 text-xs text-slate-500">
        <span>Inicio</span>
        <span className="mx-2">/</span>
        <span>Panel docente</span>
        <span className="mx-2">/</span>
        <span className="text-slate-700">Asignar actividad</span>
      </nav>

      <h1 className="text-2xl font-bold text-slate-900">Asignar actividad</h1>
      <p className="mt-1 text-sm text-slate-600">
        Crea una lectura, define instrucciones y asígnala a tus estudiantes.
      </p>

      {/* Aviso de rol */}
      {user?.role !== "teacher" && (
        <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800 border border-amber-200">
          Estás viendo una página de docente.
        </p>
      )}

      <form onSubmit={onSubmit} className="mt-6 grid gap-6 md:grid-cols-[1.3fr_1fr]">
        {/* Columna izquierda */}
        <section className="rounded-2xl border bg-white p-5 shadow-sm space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Título *
            </label>
            <input
              className="mt-1 w-full rounded-lg border p-2 outline-none focus:border-blue-400"
              placeholder='Ej.: "Energía y cambio climático"'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Instrucciones (opcional)
            </label>
            <textarea
              className="mt-1 w-full rounded-lg border p-2 outline-none focus:border-blue-400"
              rows={2}
              placeholder="Describe qué esperas que haga el estudiante…"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Texto de la lectura *
            </label>
            <textarea
              className="mt-1 w-full rounded-lg border p-2 outline-none focus:border-blue-400"
              rows={10}
              placeholder="Pega aquí el texto a analizar…"
              value={textBody}
              onChange={(e) => setTextBody(e.target.value)}
            />
            <div className="mt-2 flex items-center gap-3">
              <label className="inline-flex cursor-pointer items-center rounded-lg border px-3 py-2 text-sm hover:bg-slate-50">
                <input
                  type="file"
                  accept=".txt,.md,.markdown"
                  className="hidden"
                  onChange={(e) => onFile(e.target.files?.[0] || null)}
                />
                Subir archivo .txt / .md
              </label>
              <span className="text-xs text-slate-500">
                Si necesitas PDF/Word, lo integramos en la siguiente iteración.
              </span>
            </div>
          </div>
        </section>

        {/* Columna derecha */}
        <aside className="space-y-4">
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <label className="block text-sm font-medium text-slate-700">
              Fecha límite (opcional)
            </label>
            <input
              type="date"
              className="mt-1 w-full rounded-lg border p-2 outline-none focus:border-blue-400"
              value={dueAt}
              onChange={(e) => setDueAt(e.target.value)}
            />
            <p className="mt-1 text-xs text-slate-500">
              Los estudiantes verán el progreso hasta esta fecha.
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">
              Selecciona estudiantes *
            </p>
            {!students.length && (
              <p className="mt-2 text-sm text-slate-500">
                Aún no hay estudiantes cargados o no se pudo obtener la lista.
              </p>
            )}
            <ul className="mt-3 max-h-64 overflow-auto space-y-2">
              {students.map((s) => (
                <li key={s._id} className="flex items-center gap-2">
                  <input
                    id={s._id}
                    type="checkbox"
                    className="h-4 w-4"
                    checked={selected.includes(s._id)}
                    onChange={() => onPick(s._id)}
                  />
                  <label htmlFor={s._id} className="text-sm text-slate-700">
                    {s.nombres} {s.apellidos} — {s.email}
                  </label>
                </li>
              ))}
            </ul>
          </div>

          {err && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {err}
            </p>
          )}
          {okMsg && (
            <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {okMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Asignando…" : "Asignar actividad"}
          </button>
        </aside>
      </form>
    </div>
  );
}