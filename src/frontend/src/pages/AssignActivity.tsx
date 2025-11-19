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

  const selectedCount = selected.length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 lg:py-8">
      {/* Migas */}
      <nav className="mb-3 text-xs text-slate-500">
        <span className="hover:text-slate-700">Inicio</span>
        <span className="mx-2">/</span>
        <span className="hover:text-slate-700">Panel docente</span>
        <span className="mx-2">/</span>
        <span className="font-medium text-slate-700">Asignar actividad</span>
      </nav>

      {/* Encabezado */}
      <header className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm">
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                aria-hidden="true"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 4h16v4H4zm2 6h12v10H6z"
                />
              </svg>
            </span>
            Asignar actividad
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Crea una lectura, define instrucciones y asígnala a tus estudiantes.
          </p>
        </div>

        {user && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Sesión:</span>
            <div className="inline-flex items-center rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white">
              {user.nombres?.split(" ")[0] || "Docente"}
              <span className="ml-2 rounded-full bg-blue-500/10 px-2 py-0.5 text-[11px] font-semibold text-blue-200">
                Docente
              </span>
            </div>
          </div>
        )}
      </header>

      {/* Aviso de rol */}
      {user?.role !== "teacher" && (
        <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Estás viendo una página pensada para docentes. Algunas acciones pueden
          requerir permisos adicionales.
        </p>
      )}

      {/* Mensajes globales */}
      <div className="mt-4 space-y-2">
        {err && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {err}
          </div>
        )}
        {okMsg && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {okMsg}
          </div>
        )}
      </div>

      {/* Formulario principal */}
      <form
        onSubmit={onSubmit}
        className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]"
      >
        {/* Columna izquierda */}
        <section className="space-y-4 rounded-3xl border border-slate-100 bg-white/90 p-5 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              1. Detalles de la actividad
            </p>
            <span className="rounded-full bg-slate-50 px-2.5 py-0.5 text-[11px] text-slate-500">
              Campos obligatorios marcados con *
            </span>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-800">
              Título *
            </label>
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white"
              placeholder='Ej.: "Energía y cambio climático"'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <p className="mt-1 text-xs text-slate-500">
              Usa un título claro y específico para que el estudiante reconozca la
              lectura fácilmente.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-800">
              Instrucciones (opcional)
            </label>
            <textarea
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white"
              rows={3}
              placeholder="Describe qué esperas que haga el estudiante (por ejemplo, responder todas las preguntas en una sola sesión)…"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-slate-800">
                Texto de la lectura *
              </label>
              <span className="text-xs text-slate-500">
                Recomendado: entre 2 y 5 párrafos.
              </span>
            </div>
            <textarea
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white"
              rows={10}
              placeholder="Pega aquí el texto que será utilizado para generar preguntas…"
              value={textBody}
              onChange={(e) => setTextBody(e.target.value)}
            />

            <div className="mt-3 flex items-start gap-3">
              <label className="group inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 px-3 py-2 text-xs font-medium text-slate-700 transition hover:border-blue-400 hover:bg-blue-50/60">
                <input
                  type="file"
                  accept=".txt,.md,.markdown"
                  className="hidden"
                  onChange={(e) => onFile(e.target.files?.[0] || null)}
                />
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-[11px] text-white">
                  ↑
                </span>
                Subir archivo <span className="font-semibold">.txt</span> /{" "}
                <span className="font-semibold">.md</span>
              </label>
              <p className="text-xs text-slate-500">
                Si necesitas PDF o Word, podemos integrarlo en una siguiente
                iteración. Por ahora, usa texto plano o archivos Markdown.
              </p>
            </div>
          </div>
        </section>

        {/* Columna derecha */}
        <aside className="space-y-4">
          {/* Configuración de fecha */}
          <div className="rounded-3xl border border-slate-100 bg-white/90 p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              2. Configuración
            </p>

            <div className="mt-3">
              <label className="block text-sm font-medium text-slate-800">
                Fecha límite (opcional)
              </label>
              <input
                type="date"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white"
                value={dueAt}
                onChange={(e) => setDueAt(e.target.value)}
              />
              <p className="mt-1 text-xs text-slate-500">
                Los estudiantes verán esta fecha como referencia para completar la
                actividad.
              </p>
            </div>

            <div className="mt-4 rounded-2xl bg-slate-50 px-3 py-3 text-xs text-slate-600">
              <p className="font-medium text-slate-700">Sugerencia rápida</p>
              <p className="mt-1">
                Puedes usar esta actividad como diagnóstico inicial o como refuerzo
                después de una clase de lectura crítica.
              </p>
            </div>
          </div>

          {/* Selección de estudiantes */}
          <div className="rounded-3xl border border-slate-100 bg-white/90 p-5 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-slate-900">
                Selecciona estudiantes *
              </p>
              <span className="rounded-full bg-slate-50 px-2 py-0.5 text-[11px] text-slate-600">
                {selectedCount} seleccionados
                {students.length > 0 && ` / ${students.length}`}
              </span>
            </div>

            {!students.length && (
              <p className="mt-3 text-sm text-slate-500">
                Aún no hay estudiantes cargados o no se pudo obtener la lista.
                Cuando estén disponibles, podrás asignar la lectura desde aquí.
              </p>
            )}

            {students.length > 0 && (
              <ul className="mt-3 max-h-72 space-y-2 overflow-auto rounded-2xl border border-slate-100 bg-slate-50/60 p-2">
                {students.map((s) => (
                  <li
                    key={s._id}
                    className="flex items-start gap-2 rounded-xl px-2 py-1.5 hover:bg-white"
                  >
                    <input
                      id={s._id}
                      type="checkbox"
                      className="mt-1 h-4 w-4 accent-blue-600"
                      checked={selected.includes(s._id)}
                      onChange={() => onPick(s._id)}
                    />
                    <label
                      htmlFor={s._id}
                      className="flex-1 text-xs text-slate-800 sm:text-sm"
                    >
                      <span className="font-medium">
                        {s.nombres} {s.apellidos}
                      </span>
                      <span className="block text-[11px] text-slate-500">
                        {s.email}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Botón principal */}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Asignando actividad…" : "Asignar actividad"}
          </button>

          <p className="text-xs text-slate-500">
            La actividad aparecerá en el panel de{" "}
            <span className="font-semibold">“Mis actividades”</span> de cada
            estudiante seleccionado.
          </p>
        </aside>
      </form>
    </div>
  );
}