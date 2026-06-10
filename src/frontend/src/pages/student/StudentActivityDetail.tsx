import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  fetchActivityDetail,
  generateActivityQuestions,
  saveActivityDraft,
  submitActivity,
} from '../../services/studentService';
import { getFeedback } from '../../services/aiService';
import type { QuestionAnswer, StudentActivityDetail as ActivityData } from '../../types/student';
import AIAnalysisPanel from '../../components/student/AIAnalysisPanel';
import QuestionList from '../../components/student/QuestionList';
import FeedbackPanel from '../../components/student/FeedbackPanel';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import ProgressBar from '../../components/ui/ProgressBar';
import LoadingState from '../../components/ui/LoadingState';
import { STATUS_LABELS, STATUS_STYLES } from '../../utils/statusHelpers';
import { formatDate } from '../../utils/formatDate';

export default function StudentActivityDetail() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const [data, setData] = useState<ActivityData | null>(null);
  const [answers, setAnswers] = useState<QuestionAnswer[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadingFeedback, setLoadingFeedback] = useState<number | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const d = await fetchActivityDetail(id, token);
      setData(d);
      const qs = d.questions?.length ?? 0;
      const initial: QuestionAnswer[] = Array.from({ length: qs }, (_, i) => ({
        questionIndex: i,
        answer: d.questionAnswers?.[i]?.answer ?? '',
        feedback: d.questionAnswers?.[i]?.feedback ?? '',
        isCorrect: d.questionAnswers?.[i]?.isCorrect ?? '',
      }));
      setAnswers(initial);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo cargar la actividad');
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    load();
  }, [load]);

  const submitted = data?.status === 'submitted';
  const overdue = data?.displayStatus === 'vencida' && !submitted;

  const handleGenerate = async () => {
    if (!id || !data) return;
    setGenerating(true);
    setError(null);
    try {
      const res = await generateActivityQuestions(id, token);
      setData((prev) =>
        prev
          ? {
              ...prev,
              questions: res.questions,
              aiAnalysis: res.aiAnalysis,
              questionsGenerated: true,
              progressPercent: res.progressPercent,
            }
          : prev
      );
      setAnswers(
        res.questions.map((_, i) => ({
          questionIndex: i,
          answer: answers[i]?.answer ?? '',
          feedback: '',
          isCorrect: '',
        }))
      );
      setMsg(res.alreadyGenerated ? 'Las preguntas ya estaban generadas.' : 'Preguntas generadas con IA.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al generar preguntas');
    } finally {
      setGenerating(false);
    }
  };

  const handleAnswerChange = (index: number, value: string) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], questionIndex: index, answer: value };
      return next;
    });
  };

  const handleSaveDraft = async () => {
    if (!id) return;
    setSaving(true);
    setMsg(null);
    try {
      const res = await saveActivityDraft(id, answers, token);
      setMsg(`Borrador guardado (${res.progressPercent}%)`);
      setData((prev) => (prev ? { ...prev, progressPercent: res.progressPercent } : prev));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleFeedback = async (index: number) => {
    if (!data || !answers[index]?.answer?.trim()) return;
    setLoadingFeedback(index);
    try {
      const res = await getFeedback(
        data.text,
        data.questions[index].questionText,
        answers[index].answer,
        token
      );
      setAnswers((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], feedback: res.feedback };
        return next;
      });
    } catch {
      setError('No se pudo obtener retroalimentación');
    } finally {
      setLoadingFeedback(null);
    }
  };

  const handleSubmit = async () => {
    if (!id || !data) return;
    const answered = answers.some((a) => a.answer?.trim());
    if (!answered) {
      setError('Responde al menos una pregunta antes de enviar.');
      return;
    }
    if (!window.confirm('¿Enviar la actividad? No podrás editarla después.')) return;

    setSubmitting(true);
    setError(null);
    try {
      const res = await submitActivity(id, answers, token);
      setData((prev) =>
        prev
          ? {
              ...prev,
              status: 'submitted',
              displayStatus: 'entregada',
              progressPercent: 100,
              score: res.score,
              feedbackSummary: res.feedbackSummary,
              recommendation: res.recommendation,
              motivation: res.motivation,
              questionAnswers: res.questionAnswers,
            }
          : prev
      );
      setAnswers(res.questionAnswers);
      setMsg('¡Actividad entregada correctamente!');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al enviar');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <LoadingState label="Cargando actividad…" rows={4} />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <p className="text-red-600">{error || 'Actividad no encontrada'}</p>
        <Link to="/student/activities" className="mt-4 inline-block text-indigo-600">
          ← Volver a mis actividades
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <nav className="mb-3 text-xs text-slate-500">
        <Link to="/student/home" className="hover:text-slate-700">Inicio</Link>
        <span className="mx-2">/</span>
        <Link to="/student/activities" className="hover:text-slate-700">Mis actividades</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-700">Detalle</span>
      </nav>

      <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{data.title}</h1>
          {data.instructions && (
            <p className="mt-1 text-sm text-slate-600">{data.instructions}</p>
          )}
          <p className="mt-2 text-xs text-slate-500">
            Fecha límite: {formatDate(data.dueAt)}
          </p>
        </div>
        <div className="flex flex-col items-start gap-2 lg:items-end">
          <Badge className={STATUS_STYLES[data.displayStatus]}>
            {STATUS_LABELS[data.displayStatus]}
          </Badge>
          <div className="w-full min-w-[200px] lg:w-48">
            <p className="mb-1 text-[11px] text-slate-500">Progreso {data.progressPercent}%</p>
            <ProgressBar
              value={data.progressPercent}
              color={submitted ? 'emerald' : 'blue'}
            />
          </div>
        </div>
      </header>

      {overdue && (
        <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          Esta actividad está vencida, pero aún puedes completarla y enviarla.
        </p>
      )}
      {error && (
        <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}
      {msg && (
        <p className="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{msg}</p>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <Card title="Texto asignado" subtitle="Lectura del docente">
            <div className="rounded-xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-800 whitespace-pre-wrap">
              {data.text}
            </div>
            {!submitted && !data.questionsGenerated && (
              <button
                type="button"
                onClick={handleGenerate}
                disabled={generating}
                className="mt-4 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
              >
                {generating ? 'Generando con IA…' : 'Generar preguntas con IA'}
              </button>
            )}
          </Card>

          {(data.questions.length > 0 || data.questionsGenerated) && (
            <Card
              title="Preguntas de comprensión"
              subtitle={`${data.questions.length} preguntas generadas por IA`}
            >
              <QuestionList
                questions={data.questions}
                answers={answers}
                onAnswerChange={handleAnswerChange}
                onFeedback={submitted ? undefined : handleFeedback}
                loadingFeedback={loadingFeedback}
                readOnly={submitted}
                showFeedback
              />
              {!submitted && data.questions.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    disabled={saving || submitting}
                    className="rounded-xl bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-900 disabled:opacity-60"
                  >
                    {saving ? 'Guardando…' : 'Guardar borrador'}
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={saving || submitting}
                    className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
                  >
                    {submitting ? 'Enviando…' : 'Enviar actividad'}
                  </button>
                </div>
              )}
            </Card>
          )}

          {submitted && (
            <FeedbackPanel
              score={data.score}
              summary={data.feedbackSummary}
              recommendation={data.recommendation}
              motivation={data.motivation}
            />
          )}
        </div>

        <aside className="space-y-4">
          <AIAnalysisPanel
            analysis={data.aiAnalysis}
            biases={data.aiAnalysis?.biases}
            loading={generating}
          />
        </aside>
      </div>
    </div>
  );
}
