import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function Questions() {
  const { token } = useAuth();

  const [text, setText] = useState<string>("");
  const [questions, setQuestions] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [answers, setAnswers] = useState<string[]>([]);
  const [feedbacks, setFeedbacks] = useState<string[]>([]);
  const [savedMessages, setSavedMessages] = useState<string[]>([]);
  const [loadingFeedback, setLoadingFeedback] = useState<number | null>(null);

  // HU07
  const [biases, setBiases] = useState<string[]>([]);
  const [biasMsg, setBiasMsg] = useState<string>("");

  // Modal login
  const [needLogin, setNeedLogin] = useState(false);

  const API = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

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
    setBiases([]);
    setBiasMsg("");

    try {
      // Llamamos preguntas y sesgos en paralelo
      const [rQ, rB] = await Promise.all([
        fetch(`${API}/api/ai/questions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // cuando protejas
          },
          body: JSON.stringify({ text }),
        }),
        fetch(`${API}/api/ai/biases`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // cuando protejas
          },
          body: JSON.stringify({ text }),
        }),
      ]);

      const dataQ = await rQ.json();
      const dataB = await rB.json();

      if (dataQ.data?.questions) {
        setQuestions(dataQ.data.questions as string[]);
        setAnswers(new Array(dataQ.data.questions.length).fill(""));
        setFeedbacks(new Array(dataQ.data.questions.length).fill(""));
        setSavedMessages(new Array(dataQ.data.questions.length).fill(""));
      }

      // ACEPTA AMBOS: dataB.biases o dataB.tags
      const tags = (dataB?.biases ?? dataB?.tags) as string[] | undefined;
      if (Array.isArray(tags)) {
        setBiases(tags);
        setBiasMsg(
          tags.length === 0 ? "No se detectaron sesgos en el fragmento." : ""
        );
      } else {
        setBiases([]);
        setBiasMsg(dataB?.message ?? "No fue posible procesar este contenido");
      }
    } catch (err) {
      console.error("Error:", err);
      setBiasMsg("No fue posible procesar este contenido");
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

  return (
    <div className="min-h-screen bg-slate-50/80">
      <div className="mx-auto max-w-6xl px-4 pb-10 pt-6 lg:px-6">
        {/* Migas + encabezado */}
        <nav className="mb-3 flex items-center justify-between text-xs text-slate-500">
          <div>
            <span className="cursor-pointer hover:text-slate-700">Inicio</span>
            <span className="mx-2">/</span>
            <span className="font-medium text-slate-700">Preguntas</span>
          </div>

          {questions.length > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-900/90 px-3 py-1 text-[11px] font-medium text-slate-50">
              <span className="text-[10px]">●</span>
              {questions.length} pregunta
              {questions.length === 1 ? "" : "s"} generada
            </span>
          )}
        </nav>

        <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-[11px] font-medium text-blue-700 ring-1 ring-blue-100">
              <span className="text-xs">📚</span>
              Tutor virtual de lectura crítica
            </div>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
              Generador de preguntas y retroalimentación
            </h1>
            <p className="mt-1 max-w-xl text-sm text-slate-600">
              Pega un fragmento del texto, obtén preguntas automáticas, identifica sesgos
              argumentativos y recibe retroalimentación inmediata sobre tus respuestas.
            </p>
          </div>

          <div className="rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 px-4 py-3 text-xs text-slate-50 shadow-sm">
            <p className="font-semibold">Consejo rápido</p>
            <p className="mt-1">
              Usa entre 2 y 5 párrafos y evita listas de viñetas para obtener mejores
              resultados de IA.
            </p>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.55fr_1fr]">
          {/* Columna izquierda */}
          <section className="relative rounded-3xl border border-slate-100 bg-white/90 p-5 shadow-sm backdrop-blur-sm lg:p-6">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  1) Ingresar texto a analizar
                </p>
                <p className="text-xs text-slate-500">
                  Copia un fragmento de tu lectura. Puedes editarlo antes de generar
                  preguntas.
                </p>
              </div>
              <span className="hidden rounded-full bg-slate-900 px-3 py-1 text-[11px] font-medium text-slate-50 sm:inline-flex">
                Paso 1 de 3
              </span>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-3">
                <textarea
                  className="h-52 w-full resize-none rounded-xl bg-white/90 p-3 text-sm text-slate-800 outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-400/70"
                  placeholder="Escribe o pega aquí el texto a analizar…"
                  value={text}
                  onChange={(
                    e: React.ChangeEvent<HTMLTextAreaElement>
                  ) => setText(e.target.value)}
                />
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                  <span>
                    Tip: evita listas de viñetas; usa texto continuo y párrafos completos.
                  </span>
                  <span className="rounded-full bg-slate-900/5 px-2 py-0.5">
                    {text.length === 0
                      ? "Sin caracteres aún"
                      : `${text.length.toLocaleString()} caracteres`}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-slate-500">
                  Al generar preguntas también se analizarán posibles sesgos en el
                  fragmento.
                </p>
                <button
                  type="submit"
                  disabled={loading || !text.trim()}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 hover:shadow disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-50"
                >
                  {loading && (
                    <span className="inline-flex h-4 w-4 items-center justify-center">
                      <span className="h-3 w-3 animate-spin rounded-full border-[2px] border-white/70 border-t-transparent" />
                    </span>
                  )}
                  <span className="text-base leading-none">↗</span>
                  {loading ? "Generando…" : "Generar preguntas"}
                </button>
              </div>
            </form>

            {/* Preguntas generadas */}
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    2) Responde las preguntas generadas
                  </h2>
                  <p className="text-xs text-slate-500">
                    Escribe tus respuestas y solicita retroalimentación para cada una.
                  </p>
                </div>

                {questions.length > 0 && (
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-100">
                    {questions.length} ítem
                    {questions.length === 1 ? "" : "s"} disponibles
                  </span>
                )}
              </div>

              {questions.length === 0 && !loading && (
                <div className="mt-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-4 text-xs text-slate-500">
                  <p className="font-medium text-slate-700">Aún no hay preguntas.</p>
                  <p className="mt-1">
                    Genera tu primer conjunto pegando un texto y haciendo clic en{" "}
                    <span className="font-semibold">“Generar preguntas”.</span> Luego
                    podrás ver aquí los ítems y solicitar retroalimentación.
                  </p>
                </div>
              )}

              {questions.length > 0 && (
                <div className="mt-3 space-y-4">
                  {questions.map((q, i) => (
                    <article
                      key={i}
                      className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 shadow-sm"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
                          {i + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-900">{q}</p>

                          <textarea
                            className="mt-3 w-full resize-none rounded-xl bg-white p-3 text-sm text-slate-800 outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-400/70"
                            rows={3}
                            placeholder="Escribe tu respuesta…"
                            value={answers[i] || ""}
                            onChange={(e) =>
                              handleAnswerChange(i, e.target.value)
                            }
                          />

                          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                            <button
                              onClick={() => handleFeedback(i)}
                              disabled={
                                loadingFeedback === i ||
                                !answers[i] ||
                                !answers[i].trim()
                              }
                              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                            >
                              {loadingFeedback === i && (
                                <span className="inline-flex h-3 w-3 items-center justify-center">
                                  <span className="h-3 w-3 animate-spin rounded-full border-[2px] border-white/70 border-t-transparent" />
                                </span>
                              )}
                              {loadingFeedback === i
                                ? "Evaluando…"
                                : "Obtener retroalimentación"}
                            </button>

                            {savedMessages[i] && (
                              <p className="text-[11px] font-medium text-emerald-600">
                                {savedMessages[i]}
                              </p>
                            )}
                          </div>

                          {feedbacks[i] && (
                            <div className="mt-3 rounded-xl bg-blue-50/80 p-3 text-xs text-blue-800 ring-1 ring-blue-100">
                              <p className="font-semibold mb-1">
                                Comentario de la IA
                              </p>
                              <p>{feedbacks[i]}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Columna derecha: HU07 Sesgos + guía */}
          <aside className="space-y-4 lg:space-y-6">
            {/* Sesgos */}
            <div className="rounded-3xl border border-slate-100 bg-white/90 p-5 shadow-sm backdrop-blur-sm">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-slate-900">
                  3) Sesgos detectados en el texto
                </h3>
                <span className="rounded-full bg-slate-900/5 px-2 py-0.5 text-[11px] text-slate-600">
                  HU07
                </span>
              </div>

              {/* Estado vacío / mensaje */}
              {!biases.length && !biasMsg && (
                <p className="mt-3 text-sm text-slate-500">
                  Genera preguntas para analizar el texto y detectar posibles sesgos
                  argumentativos.
                </p>
              )}

              {biasMsg && (
                <p className="mt-3 text-sm text-slate-600">{biasMsg}</p>
              )}

              {biases.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {biases.map((b, i) => (
                    <span
                      key={i}
                      className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-medium text-blue-700 ring-1 ring-blue-100"
                    >
                      {b}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-4 rounded-2xl bg-slate-50 p-3 text-[11px] text-slate-600">
                <p className="font-semibold text-slate-800">
                  ¿Cómo se interpretan estas etiquetas?
                </p>
                <p className="mt-1">
                  Las etiquetas se basan en patrones lingüísticos (por ejemplo,{" "}
                  <em>ad hominem</em>, <em>generalización</em>,{" "}
                  <em>hombre de paja</em>). Úsalas como guía para discutir la calidad
                  del argumento, no como diagnóstico definitivo.
                </p>
              </div>
            </div>

            {/* Guía rápida */}
            <div className="rounded-3xl border border-slate-100 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 p-5 text-slate-50 shadow-sm">
              <p className="text-sm font-semibold">Guía rápida para responder</p>
              <ul className="mt-3 space-y-1.5 text-xs">
                <li>• Lee el texto completo antes de responder.</li>
                <li>• Responde con tus palabras, evita copiar el fragmento.</li>
                <li>• Usa ejemplos breves para justificar tu respuesta.</li>
                <li>• Una idea principal por oración mejora la claridad.</li>
              </ul>

              <Link
                to="/reports"
                className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-sky-300 hover:text-sky-200"
              >
                Ver reportes y progreso →
              </Link>
            </div>
          </aside>
        </div>
      </div>

      {/* Modal: requiere login */}
      {needLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">
              Necesitas iniciar sesión
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Para generar preguntas debes iniciar sesión o crear una cuenta. Esto nos
              permite guardar tu progreso y tus reportes.
            </p>
            <div className="mt-5 flex gap-3">
              <Link
                to="/login"
                className="flex-1 rounded-xl bg-slate-900 px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-black"
                onClick={() => setNeedLogin(false)}
              >
                Iniciar sesión
              </Link>
              <Link
                to="/register"
                className="flex-1 rounded-xl bg-blue-600 px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-blue-700"
                onClick={() => setNeedLogin(false)}
              >
                Registrarme
              </Link>
            </div>
            <button
              className="mt-4 w-full text-center text-xs font-medium text-slate-500 hover:text-slate-700"
              onClick={() => setNeedLogin(false)}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}