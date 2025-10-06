import { useState } from "react";

export default function Questions() {
  const [text, setText] = useState<string>("");
  const [questions, setQuestions] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [answers, setAnswers] = useState<string[]>([]);
  const [feedbacks, setFeedbacks] = useState<string[]>([]);
  const [savedMessages, setSavedMessages] = useState<string[]>([]);
  const [loadingFeedback, setLoadingFeedback] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setQuestions([]);
    setAnswers([]);
    setFeedbacks([]);
    setSavedMessages([]);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/ai/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/ai/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
