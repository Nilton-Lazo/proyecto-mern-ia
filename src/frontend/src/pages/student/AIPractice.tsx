import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { runPractice, detectBiases, getFeedback } from '../../services/aiService';
import type { ActivityQuestion, PracticeAnalysis, QuestionAnswer } from '../../types/student';
import AIAnalysisPanel from '../../components/student/AIAnalysisPanel';
import QuestionList from '../../components/student/QuestionList';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import { Textarea } from '../../components/ui/Input';

export default function AIPractice() {
  const { token } = useAuth();
  const [text, setText] = useState('');
  const [questions, setQuestions] = useState<ActivityQuestion[]>([]);
  const [answers, setAnswers] = useState<QuestionAnswer[]>([]);
  const [analysis, setAnalysis] = useState<PracticeAnalysis | null>(null);
  const [biases, setBiases] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingFeedback, setLoadingFeedback] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [needLogin, setNeedLogin] = useState(false);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setNeedLogin(true);
      return;
    }
    if (!text.trim()) return;

    setLoading(true);
    setError(null);
    setQuestions([]);
    setAnswers([]);
    setAnalysis(null);
    setBiases([]);

    try {
      const [practiceRes, biasRes] = await Promise.all([
        runPractice(text, token),
        detectBiases(text, token),
      ]);
      setQuestions(practiceRes.questions);
      setAnalysis(practiceRes.analysis);
      setBiases(biasRes.tags ?? []);
      setAnswers(
        practiceRes.questions.map((_, i) => ({
          questionIndex: i,
          answer: '',
          feedback: '',
        }))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No fue posible procesar el texto');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (index: number, value: string) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], questionIndex: index, answer: value };
      return next;
    });
  };

  const handleFeedback = async (index: number) => {
    if (!answers[index]?.answer?.trim()) return;
    setLoadingFeedback(index);
    try {
      const res = await getFeedback(
        text,
        questions[index].questionText,
        answers[index].answer,
        token
      );
      setAnswers((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], feedback: res.feedback };
        return next;
      });
    } catch {
      setError('Error al obtener retroalimentación');
    } finally {
      setLoadingFeedback(null);
    }
  };

  return (
    <div>
      <PageHeader
        badge="Práctica libre"
        title="Práctica con IA"
        subtitle="Pega un texto, genera preguntas y mejora tu comprensión lectora con apoyo de inteligencia artificial."
        crumbs={[
          { label: 'Inicio', to: '/student/home' },
          { label: 'Práctica con IA' },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card title="Ingresa tu texto" subtitle="Pega cualquier fragmento para practicar">
          <form onSubmit={handleAnalyze} className="space-y-4">
            <Textarea
              className="h-52 bg-slate-50 dark:bg-slate-900/50"
              placeholder="Escribe o pega aquí el texto que deseas analizar…"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {text.length > 0 ? `${text.length} caracteres` : 'Sin texto aún'}
              </span>
              <Button type="submit" disabled={!text.trim()} loading={loading}>
                {loading ? 'Analizando…' : 'Analizar y generar preguntas'}
              </Button>
            </div>
          </form>

          {error && (
            <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
          )}

          <div className="mt-8">
            {questions.length === 0 && !loading ? (
              <EmptyState
                title="Aún no hay preguntas"
                description="Pega un texto y haz clic en analizar para generar preguntas de comprensión."
              />
            ) : (
              <QuestionList
                questions={questions}
                answers={answers}
                onAnswerChange={handleAnswerChange}
                onFeedback={handleFeedback}
                loadingFeedback={loadingFeedback}
              />
            )}
          </div>
        </Card>

        <aside>
          <AIAnalysisPanel
            analysis={analysis ?? {}}
            biases={biases}
            loading={loading}
          />
          <div className="mt-4 rounded-2xl bg-slate-900 p-5 text-slate-50">
            <p className="text-sm font-semibold">Guía de práctica</p>
            <ul className="mt-3 space-y-1.5 text-xs text-slate-300">
              <li>• Lee el texto completo antes de responder.</li>
              <li>• Usa tus propias palabras, no copies el fragmento.</li>
              <li>• Solicita retroalimentación en cada pregunta.</li>
              <li>• Revisa sesgos y la idea principal del texto.</li>
            </ul>
            <Link
              to="/student/progress"
              className="mt-4 inline-block text-xs font-medium text-sky-300 hover:text-sky-200"
            >
              Ver mi progreso →
            </Link>
          </div>
        </aside>
      </div>

      {needLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold">Inicia sesión para practicar</h3>
            <p className="mt-2 text-sm text-slate-600">
              Necesitas una cuenta de estudiante para usar la práctica con IA.
            </p>
            <div className="mt-4 flex gap-3">
              <Link
                to="/login"
                className="flex-1 rounded-xl bg-slate-900 py-2 text-center text-sm font-semibold text-white"
                onClick={() => setNeedLogin(false)}
              >
                Iniciar sesión
              </Link>
              <button
                type="button"
                className="flex-1 text-sm text-slate-500"
                onClick={() => setNeedLogin(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
