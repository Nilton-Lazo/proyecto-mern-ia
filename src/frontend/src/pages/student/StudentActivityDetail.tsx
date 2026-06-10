import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  fetchActivityDetail,
  generateActivityQuestions,
  analyzeActivityText,
  saveActivityDraft,
  submitActivity,
} from '../../services/studentService';
import { getFeedback } from '../../services/aiService';
import type { QuestionAnswer, StudentActivityDetail as ActivityData } from '../../types/student';
import AIAnalysisPanel from '../../components/student/AIAnalysisPanel';
import QuestionList from '../../components/student/QuestionList';
import FeedbackPanel from '../../components/student/FeedbackPanel';
import AutoSaveStatus from '../../components/student/AutoSaveStatus';
import SkillProgressMap from '../../components/student/SkillProgressMap';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import ProgressBar from '../../components/ui/ProgressBar';
import LoadingState from '../../components/ui/LoadingState';
import { STATUS_LABELS, STATUS_STYLES } from '../../utils/statusHelpers';
import { formatDate } from '../../utils/formatDate';
import { useAutoSave, loadLocalDraft } from '../../hooks/useAutoSave';

export default function StudentActivityDetail() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const [data, setData] = useState<ActivityData | null>(null);
  const [answers, setAnswers] = useState<QuestionAnswer[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadingFeedback, setLoadingFeedback] = useState<number | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submitted = data?.status === 'submitted';
  const overdue = data?.displayStatus === 'vencida' && !submitted;

  const { status: autoStatus, lastSavedAt, errorMsg, markDirty, saveNow } = useAutoSave({
    activityId: id,
    token,
    answers,
    currentStep: data?.currentStep ?? 4,
    enabled: !submitted && !!data?.questionsGenerated,
  });

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const d = await fetchActivityDetail(id, token);
      setData(d);

      const qs = d.questions?.length ?? 0;
      const serverAnswers: QuestionAnswer[] = Array.from({ length: qs }, (_, i) => ({
        questionIndex: i,
        answer: d.questionAnswers?.[i]?.answer ?? '',
        feedback: d.questionAnswers?.[i]?.feedback ?? '',
        isCorrect: d.questionAnswers?.[i]?.isCorrect ?? '',
      }));

      const local = loadLocalDraft(id);
      if (local?.length && d.status !== 'submitted') {
        const merged = serverAnswers.map((sa, i) => ({
          ...sa,
          answer: local[i]?.answer?.trim() ? local[i].answer : sa.answer,
        }));
        setAnswers(merged);
      } else {
        setAnswers(serverAnswers);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo cargar la actividad');
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    load();
  }, [load]);

  const handleAnalyze = async () => {
    if (!id) return;
    setAnalyzing(true);
    setError(null);
    try {
      const res = await analyzeActivityText(id, token);
      setData((prev) =>
        prev ? { ...prev, aiAnalysis: res.aiAnalysis, currentStep: 2 } : prev
      );
      setMsg('Análisis de lectura completado.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al analizar');
    } finally {
      setAnalyzing(false);
    }
  };

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
              aiAnalysis: res.aiAnalysis ?? prev.aiAnalysis,
              questionsGenerated: true,
              progressPercent: res.progressPercent,
              currentStep: 3,
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
    markDirty();
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], questionIndex: index, answer: value };
      return next;
    });
  };

  const handleAnswerBlur = () => {
    markDirty();
    saveNow();
  };

  const handleSaveDraft = async () => {
    if (!id) return;
    setSaving(true);
    setMsg(null);
    try {
      const res = await saveActivityDraft(id, answers, token, data?.currentStep);
      setMsg(`Borrador guardado (${res.progressPercent}%)`);
      setData((prev) =>
        prev
          ? { ...prev, progressPercent: res.progressPercent, lastSavedAt: res.lastSavedAt }
          : prev
      );
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
              skillScores: res.skillScores,
              skillRecommendations: res.skillRecommendations,
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

  const hasAnalysis =
    data.aiAnalysis?.mainIdea ||
    (data.aiAnalysis?.keywords?.length ?? 0) > 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <nav className="mb-3 text-xs text-slate-500 dark:text-slate-400">
        <Link to="/student/home" className="hover:text-slate-700 dark:hover:text-slate-200">
          Inicio
        </Link>
        <span className="mx-2">/</span>
        <Link to="/student/activities" className="hover:text-slate-700 dark:hover:text-slate-200">
          Mis actividades
        </Link>
        <span className="mx-2">/</span>
        <span>{data.area || 'Área'}</span>
        <span className="mx-2">/</span>
        <span className="text-slate-700 dark:text-slate-200">{data.title}</span>
      </nav>

      <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{data.title}</h1>
          {(data.area || data.topic) && (
            <p className="mt-1 text-sm text-indigo-600 dark:text-indigo-400">
              {data.area}
              {data.topic ? ` · ${data.topic}` : ''}
            </p>
          )}
          {data.instructions && (
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{data.instructions}</p>
          )}
          <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400">
            {data.teacherName && <span>Docente: {data.teacherName}</span>}
            <span>Fecha límite: {formatDate(data.dueAt)}</span>
            {data.originalFileName && <span>Archivo: {data.originalFileName}</span>}
          </div>
        </div>
        <div className="flex flex-col items-start gap-2 lg:items-end">
          <Badge className={STATUS_STYLES[data.displayStatus]}>
            {STATUS_LABELS[data.displayStatus]}
          </Badge>
          <div className="w-full min-w-[200px] lg:w-48">
            <p className="mb-1 text-[11px] text-slate-500">Progreso {data.progressPercent}%</p>
            <ProgressBar value={data.progressPercent} color={submitted ? 'emerald' : 'blue'} />
          </div>
          <AutoSaveStatus
            status={autoStatus}
            lastSavedAt={lastSavedAt ?? (data.lastSavedAt ? new Date(data.lastSavedAt) : null)}
            errorMsg={errorMsg}
          />
        </div>
      </header>

      {overdue && (
        <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300">
          Esta actividad está vencida, pero aún puedes completarla y enviarla.
        </p>
      )}
      {error && (
        <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300">
          {error}
        </p>
      )}
      {msg && (
        <p className="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
          {msg}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          {/* Sección 1: Lectura */}
          <Card title="Lectura asignada" subtitle="Texto del docente">
            <div className="rounded-xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-800 whitespace-pre-wrap dark:bg-slate-900/50 dark:text-slate-200">
              {data.text}
            </div>
          </Card>

          {/* Sección 2: Análisis IA */}
          {!submitted && !hasAnalysis && (
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={analyzing}
                className="rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-900 disabled:opacity-60 dark:bg-slate-700"
              >
                {analyzing ? 'Analizando…' : 'Analizar lectura con IA'}
              </button>
            </div>
          )}

          {/* Sección 3: Preguntas */}
          {!submitted && !data.questionsGenerated && (
            <button
              type="button"
              onClick={handleGenerate}
              disabled={generating}
              className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {generating ? 'Generando con IA…' : 'Generar preguntas'}
            </button>
          )}

          {(data.questions.length > 0 || data.questionsGenerated) && (
            <Card
              title="Preguntas generadas por IA"
              subtitle={`${data.questions.length} preguntas clasificadas por habilidad lectora`}
            >
              <QuestionList
                questions={data.questions}
                answers={answers}
                onAnswerChange={handleAnswerChange}
                onAnswerBlur={handleAnswerBlur}
                onFeedback={submitted ? undefined : handleFeedback}
                loadingFeedback={loadingFeedback}
                readOnly={submitted}
                showFeedback
              />
              {!submitted && data.questions.length > 0 && (
                <div className="mt-6 flex flex-wrap items-center gap-3">
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
                  <AutoSaveStatus status={autoStatus} lastSavedAt={lastSavedAt} errorMsg={errorMsg} />
                </div>
              )}
            </Card>
          )}

          {submitted && (
            <>
              <FeedbackPanel
                score={data.score}
                summary={data.feedbackSummary}
                recommendation={data.recommendation}
                motivation={data.motivation}
              />
              <Link
                to="/student/practice"
                className="inline-block rounded-xl bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:text-indigo-300"
              >
                Practicar más sobre este tema con IA →
              </Link>
            </>
          )}
        </div>

        <aside className="space-y-4">
          <AIAnalysisPanel
            analysis={data.aiAnalysis}
            biases={data.aiAnalysis?.biases}
            loading={analyzing || generating}
          />
          <SkillProgressMap
            skillScores={data.skillScores}
            recommendations={data.skillRecommendations}
          />
        </aside>
      </div>
    </div>
  );
}
