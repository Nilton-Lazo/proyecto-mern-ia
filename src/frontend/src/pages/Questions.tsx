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
        setBiasMsg(tags.length === 0 ? "No se detectaron sesgos en el fragmento." : "");
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
    <div className="mx-auto max-w-6xl p-6">
      {/* Migas simples */}
      <nav className="mb-2 text-xs text-slate-500">
        <span className="hover:text-slate-700">Inicio</span>
        <span className="mx-2">/</span>
        <span className="text-slate-700">Preguntas</span>
      </nav>

      <h1 className="text-2xl font-bold text-slate-900">Tutor de Lectura Crítica</h1>
      <p className="mt-1 text-sm text-slate-600">
        Pega un fragmento, genera preguntas y recibe retroalimentación inmediata.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Columna izquierda: ingreso de texto y preguntas */}
        <section className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="mb-3">
            <p className="font-medium text-slate-900">1) Ingresar texto</p>
            <p className="text-xs text-slate-500">
              Recomendación: entre 2 y 5 párrafos para mejores resultados.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              className="w-full rounded-xl border p-3 text-slate-800 outline-none focus:border-blue-400"
              rows={10}
              placeholder="Escribe o pega aquí el texto a analizar…"
              value={text}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setText(e.target.value)
              }
            />

            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500">
                Tip: evita listas de viñetas; usa texto continuo.
              </p>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
              >
                <span className="text-lg leading-none">↗</span>
                {loading ? "Generando…" : "Generar preguntas"}
              </button>
            </div>
          </form>

          {/* Preguntas generadas */}
          {questions.length > 0 && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-slate-900">Preguntas generadas</h2>
              <ul className="mt-3 space-y-6">
                {questions.map((q, i) => (
                  <li key={i} className="rounded-xl border bg-white p-4 shadow-sm">
                    <p className="font-medium text-slate-900">{q}</p>

                    <textarea
                      className="mt-2 w-full rounded-lg border p-2 text-slate-800 outline-none focus:border-blue-400"
                      rows={2}
                      placeholder="Escribe tu respuesta…"
                      value={answers[i] || ""}
                      onChange={(e) => handleAnswerChange(i, e.target.value)}
                    />

                    <button
                      onClick={() => handleFeedback(i)}
                      disabled={loadingFeedback === i}
                      className="mt-2 rounded-lg bg-emerald-600 px-3 py-1 text-white hover:bg-emerald-700 disabled:opacity-60"
                    >
                      {loadingFeedback === i ? "Evaluando…" : "Obtener retroalimentación"}
                    </button>

                    {feedbacks[i] && (
                      <p className="mt-2 rounded bg-blue-50 p-2 text-sm text-blue-700">
                        {feedbacks[i]}
                      </p>
                    )}

                    {savedMessages[i] && (
                      <p className="mt-1 text-sm text-emerald-600">{savedMessages[i]}</p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* Columna derecha: HU07 Sesgos */}
        <aside className="space-y-6">
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">Sesgos detectados</h3>

            {/* Estado vacío / mensaje */}
            {!biases.length && !biasMsg && (
              <p className="mt-2 text-sm text-slate-500">
                Genera preguntas para analizar el texto y detectar sesgos.
              </p>
            )}

            {biasMsg && (
              <p className="mt-2 text-sm text-slate-500">{biasMsg}</p>
            )}

            {biases.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {biases.map((b, i) => (
                  <span
                    key={i}
                    className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs text-blue-700"
                  >
                    {b}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-4 rounded-lg bg-slate-50 p-3">
              <p className="text-xs text-slate-600">
                Las etiquetas se basan en patrones lingüísticos (p. ej.,{" "}
                <em>ad hominem</em>, <em>generalización</em>, <em>hombre de paja</em>).
                Úsalas como guía para mejorar tu argumentación.
              </p>
            </div>
          </div>

          {/* Guía rápida */}
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">Guía rápida</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
              <li>Estudia el texto antes de responder.</li>
              <li>Responde con tus palabras y sé específico.</li>
              <li>Una idea por oración ayuda a la claridad.</li>
            </ul>
            <Link
              to="/reports"
              className="mt-3 inline-flex items-center gap-2 text-sm text-blue-700 hover:underline"
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
            <h3 className="text-lg font-semibold text-slate-900">
              Necesitas iniciar sesión
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Para generar preguntas debes iniciar sesión o crear una cuenta.
            </p>
            <div className="mt-4 flex gap-3">
              <Link
                to="/login"
                className="flex-1 rounded-lg bg-slate-900 px-4 py-2 text-center text-white hover:bg-black"
                onClick={() => setNeedLogin(false)}
              >
                Iniciar sesión
              </Link>
              <Link
                to="/register"
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-center text-white hover:bg-blue-700"
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
    </div>
  );
}