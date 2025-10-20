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

  const [needLogin, setNeedLogin] = useState(false);

  const API = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 🔒 Si no hay sesión, mostramos modal y no llamamos al backend
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
          // listo para cuando protejas la ruta en backend:
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
          // opcional (igual que arriba)
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
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Tutor de Lectura Crítica</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          className="w-full border rounded-lg p-3 text-gray-800"
          rows={4}
          placeholder="Escribe o pega un texto..."
          value={text}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setText(e.target.value)
          }
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Generando preguntas..." : "Generar Preguntas"}
        </button>
      </form>

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

      <div className="mt-6">
        {questions.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-2">Preguntas generadas:</h2>
            <ul className="space-y-6">
              {questions.map((q, i) => (
                <li
                  key={i}
                  className="text-gray-700 border rounded-lg p-4 bg-white shadow"
                >
                  <p className="font-medium">{q}</p>

                  <textarea
                    className="w-full border rounded-lg p-2 mt-2 text-gray-800"
                    rows={2}
                    placeholder="Escribe tu respuesta..."
                    value={answers[i] || ""}
                    onChange={(e) => handleAnswerChange(i, e.target.value)}
                  />

                  <button
                    onClick={() => handleFeedback(i)}
                    disabled={loadingFeedback === i}
                    className="mt-2 bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    {loadingFeedback === i
                      ? "Evaluando..."
                      : "Obtener Retroalimentación"}
                  </button>

                  {feedbacks[i] && (
                    <p className="mt-2 text-sm text-blue-700 bg-blue-50 p-2 rounded">
                      {feedbacks[i]}
                    </p>
                  )}

                  {savedMessages[i] && (
                    <p className="mt-1 text-sm text-green-600">
                      {savedMessages[i]}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}