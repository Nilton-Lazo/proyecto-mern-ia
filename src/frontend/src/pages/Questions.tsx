import { useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

/**
 * Página de Preguntas — diseño académico con Tailwind.
 * Mantiene tu misma lógica pero mejora la presentación.
 */
export default function Questions() {
  const { token } = useAuth();

  const [text, setText] = useState<string>("");
  const [questions, setQuestions] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [answers, setAnswers] = useState<string[]>([]);
  const [feedbacks, setFeedbacks] = useState<string[]>([]);
  const [savedMessages, setSavedMessages] = useState<string[]>([]);
  const [loadingFeedback, setLoadingFeedback] = useState<number | null>(null);

  const [needLogin, setNeedLogin] = useState(false);

  const API = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

  // --- Metrías simples para el resumen ---
  const metrics = useMemo(() => {
    const total = questions.length;
    const respondidas = answers.filter((a) => (a || "").trim().length > 0).length;
    const correctas = feedbacks.filter((f) => f?.toUpperCase().includes("CORRECTA")).length;
    const parciales = feedbacks.filter((f) => f?.toUpperCase().includes("PARCIAL")).length;
    const incorrectas = feedbacks.filter((f) => f?.toUpperCase().includes("INCORRECTA")).length;
    return { total, respondidas, correctas, parciales, incorrectas };
  }, [questions, answers, feedbacks]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setNeedLogin(true);
      return;
    }

    setLoading(true);
    setQuestions([]);
    setAnswers([]);
    setFeedbacks([]);
    setSavedMessages([]);

    try {
      const res = await fetch(`${API}/api/ai/questions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text }),
      });

      const data = await res.json();
      if (data.data?.questions) {
        setQuestions(data.data.questions as string[]);
        setAnswers(new Array(data.data.questions.length).fill(""));
        setFeedbacks(new Array(data.data.questions.length).fill(""));
        setSavedMessages(new Array(data.data.questions.length).fill(""));
        // scroll suave hacia el bloque de resultados
        setTimeout(() => {
          document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
        }, 50);
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (index: number, value: string) => {
    const updated = [...answers];
    updated[index] = value;
    setAnswers(updated);
  };

  const handleFeedback = async (index: number) => {
    setLoadingFeedback(index);
    try {
      const res = await fetch(`${API}/api/ai/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          text,
          question: questions[index],
          answer: answers[index],
        }),
      });

      const data = await res.json();

      const updatedFeedbacks = [...feedbacks];
      updatedFeedbacks[index] = data.feedback;
      setFeedbacks(updatedFeedbacks);

      const updatedMessages = [...savedMessages];
      updatedMessages[index] = "Respuesta guardada correctamente";
      setSavedMessages(updatedMessages);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoadingFeedback(null);
    }
  };

  // ---- UI helpers ----
  const StatusChip = ({ value }: { value?: string }) => {
    if (!value) return null;
    const upper = value.toUpperCase();
    let bg = "bg-slate-100 text-slate-700";
    let label = "Evaluado";
    if (upper.includes("CORRECTA")) {
      bg = "bg-green-100 text-green-800";
      label = "Correcta";
    } else if (upper.includes("PARCIAL")) {
      bg = "bg-amber-100 text-amber-800";
      label = "Parcial";
    } else if (upper.includes("INCORRECTA")) {
      bg = "bg-red-100 text-red-800";
      label = "Incorrecta";
    }
    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${bg}`}>
        {label}
      </span>
    );
  };

  return (
    <div className="mx-auto w-full max-w-6xl">
      {/* Breadcrumb + Título */}
      <div className="mb-6">
        <nav className="text-xs text-slate-500">
          <Link to="/" className="hover:text-slate-700">Inicio</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-700">Preguntas</span>
        </nav>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Tutor de Lectura Crítica</h1>
        <p className="mt-1 text-sm text-slate-600">
          Pega un fragmento de texto, genera preguntas de comprensión y recibe retroalimentación inmediata.
        </p>
      </div>

      {/* Editor + Ayuda */}
      <div className="grid gap-6 md:grid-cols-[2fr,1fr]">
        {/* Editor */}
        <section className="rounded-2xl border bg-white shadow-sm">
          <div className="border-b px-5 py-4">
            <h2 className="text-sm font-semibold text-slate-900">1) Ingresar texto</h2>
            <p className="text-xs text-slate-500">Recomendación: entre 2 y 5 párrafos para mejores resultados.</p>
          </div>

          <form onSubmit={handleSubmit} className="p-5">
            <textarea
              className="w-full rounded-xl border border-slate-200 bg-white p-4 text-slate-800 outline-none ring-blue-600/10 focus:ring-4"
              rows={8}
              placeholder="Escribe o pega aquí el texto a analizar…"
              value={text}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setText(e.target.value)}
            />
            <div className="mt-4 flex items-center justify-between">
              <div className="text-xs text-slate-500">
                Tip: evita listas de viñetas; usa texto continuo.
              </div>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" className="opacity-20"/>
                      <path d="M4 12a8 8 0 0 1 8-8" stroke="currentColor" strokeWidth="4" fill="none" />
                    </svg>
                    Generando…
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M5 12h9l-3.5-3.5 1.4-1.4L18.8 12l-6.9 6.9-1.4-1.4L14 13H5v-1Z" />
                    </svg>
                    Generar preguntas
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        {/* Ayuda / Lateral */}
        <aside className="space-y-4">
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">Guía rápida</h3>
            <ul className="mt-3 list-disc pl-5 text-sm text-slate-700 space-y-1">
              <li>Estudia el texto antes de responder.</li>
              <li>Responde con tus propias palabras.</li>
              <li>Una idea por oración ayuda a la claridad.</li>
            </ul>
          </div>
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">¿Qué evalúa el feedback?</h3>
            <p className="mt-2 text-sm text-slate-700">
              La IA indicará si tu respuesta es <span className="font-medium">Correcta</span>,{" "}
              <span className="font-medium">Parcial</span> o <span className="font-medium">Incorrecta</span>,
              y te sugerirá mejoras en una sola oración.
            </p>
            <Link
              to="/reports"
              className="mt-3 inline-flex items-center rounded-lg border px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
            >
              Ver reportes →
            </Link>
          </div>
        </aside>
      </div>

      {/* Modal: requiere login */}
      {needLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">Necesitas iniciar sesión</h3>
            <p className="mt-2 text-sm text-slate-600">
              Para generar preguntas debes iniciar sesión o crear una cuenta.
            </p>
            <div className="mt-4 flex gap-3">
              <Link
                to="/login"
                className="flex-1 rounded-lg bg-slate-900 px-4 py-2 text-white text-center hover:bg-black"
                onClick={() => setNeedLogin(false)}
              >
                Iniciar sesión
              </Link>
              <Link
                to="/register"
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-white text-center hover:bg-blue-700"
                onClick={() => setNeedLogin(false)}
              >
                Registrarme
              </Link>
            </div>
            <button
              className="mt-4 text-sm text-slate-500 hover:text-slate-700"
              onClick={() => setNeedLogin(false)}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Resultados */}
      <div id="results" className="mt-8 space-y-6">
        {questions.length > 0 && (
          <>
            {/* Resumen */}
            <section className="rounded-2xl border bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center gap-4">
                <h3 className="text-sm font-semibold text-slate-900">2) Responder y evaluar</h3>
                <div className="ml-auto flex gap-2">
                  <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs text-slate-700">
                    Total: <b>{metrics.total}</b>
                  </span>
                  <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs text-blue-700">
                    Respondidas: <b>{metrics.respondidas}</b>
                  </span>
                  <span className="rounded-lg bg-green-50 px-2.5 py-1 text-xs text-green-700">
                    Correctas: <b>{metrics.correctas}</b>
                  </span>
                  <span className="rounded-lg bg-amber-50 px-2.5 py-1 text-xs text-amber-700">
                    Parciales: <b>{metrics.parciales}</b>
                  </span>
                  <span className="rounded-lg bg-red-50 px-2.5 py-1 text-xs text-red-700">
                    Incorrectas: <b>{metrics.incorrectas}</b>
                  </span>
                </div>
              </div>
            </section>

            {/* Lista de preguntas */}
            <section className="space-y-4">
              {questions.map((q, i) => (
                <article
                  key={i}
                  className="rounded-2xl border bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium text-slate-900">{q}</p>
                        <StatusChip value={feedbacks[i]} />
                      </div>

                      <textarea
                        className="mt-3 w-full rounded-xl border border-slate-200 bg-white p-3 text-slate-800 outline-none ring-blue-600/10 focus:ring-4"
                        rows={3}
                        placeholder="Escribe tu respuesta…"
                        value={answers[i] || ""}
                        onChange={(e) => handleAnswerChange(i, e.target.value)}
                      />

                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        <button
                          onClick={() => handleFeedback(i)}
                          disabled={loadingFeedback === i}
                          className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                        >
                          {loadingFeedback === i ? (
                            <>
                              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" className="opacity-20"/>
                                <path d="M4 12a8 8 0 0 1 8-8" stroke="currentColor" strokeWidth="4" fill="none" />
                              </svg>
                              Evaluando…
                            </>
                          ) : (
                            <>
                              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M3 12.5 9 18l12-12-1.4-1.4L9 15.2 4.4 10.6 3 12.5Z" />
                              </svg>
                              Obtener retroalimentación
                            </>
                          )}
                        </button>

                        {savedMessages[i] && (
                          <span className="text-sm text-green-700">{savedMessages[i]}</span>
                        )}
                      </div>

                      {feedbacks[i] && (
                        <div className="mt-3 rounded-xl bg-blue-50 p-3 text-sm text-blue-800">
                          {feedbacks[i]}
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </section>

            {/* CTA final */}
            <div className="rounded-2xl border bg-white p-5 text-center shadow-sm">
              <p className="text-sm text-slate-700">
                ¿Quieres un resumen gráfico de tu avance?{" "}
                <Link to="/reports" className="font-semibold text-blue-700 hover:underline">
                  Ir a Reportes
                </Link>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}