import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/ui/PageHeader';
import LoadingState from '../../components/ui/LoadingState';
import ReportFilters from '../../components/reports/ReportFilters';
import SummaryCards from '../../components/reports/SummaryCards';
import SkillMap from '../../components/reports/SkillMap';
import AreaPerformanceChart from '../../components/reports/AreaPerformanceChart';
import ProgressTimeline from '../../components/reports/ProgressTimeline';
import RecentActivitiesTable from '../../components/reports/RecentActivitiesTable';
import RecentFeedbackList from '../../components/reports/RecentFeedbackList';
import RecommendationsPanel from '../../components/reports/RecommendationsPanel';
import LearningEvidencePanel from '../../components/reports/LearningEvidencePanel';
import ExportButtons from '../../components/reports/ExportButtons';
import EmptyReportState from '../../components/reports/EmptyReportState';
import { summaryCardItemsStudent } from '../../utils/reportCalculations';
import { formatReportPeriod } from '../../utils/reportFormatters';
import {
  fetchStudentReportSummary,
  fetchStudentReportSkills,
  fetchStudentReportAreas,
  fetchStudentReportTimeline,
  fetchStudentReportFeedback,
  fetchStudentReportRecommendations,
  downloadStudentReportPdf,
} from '../../services/reportService';
import type {
  ReportFilters as ReportFilterState,
  StudentReportSummary,
  SkillReportItem,
  AreaPerformance,
  TimelinePoint,
  FeedbackItem,
  RecentActivityRow,
  EvidenceItem,
} from '../../types/reports';

export default function StudentReports() {
  const { user, token } = useAuth();
  const [filters, setFilters] = useState<ReportFilterState>({ period: 'all', area: 'todas', status: 'all' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<StudentReportSummary | null>(null);
  const [skills, setSkills] = useState<SkillReportItem[]>([]);
  const [areas, setAreas] = useState<AreaPerformance[]>([]);
  const [timeline, setTimeline] = useState<TimelinePoint[]>([]);
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [activities, setActivities] = useState<RecentActivityRow[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [evidence, setEvidence] = useState<EvidenceItem[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, sk, ar, tl, fb, rec] = await Promise.all([
        fetchStudentReportSummary(token, filters),
        fetchStudentReportSkills(token, filters),
        fetchStudentReportAreas(token, filters),
        fetchStudentReportTimeline(token, filters),
        fetchStudentReportFeedback(token, filters),
        fetchStudentReportRecommendations(token, filters),
      ]);
      setSummary(s.summary);
      setSkills(sk.skills);
      setAreas(ar.areas);
      setTimeline(tl.timeline);
      setFeedback(fb.feedback);
      setActivities(fb.activities);
      setRecommendations(rec.recommendations);
      setEvidence(rec.evidence);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudieron cargar los reportes.');
    } finally {
      setLoading(false);
    }
  }, [token, filters]);

  useEffect(() => {
    load();
  }, [load]);

  const studentName = user ? `${user.nombres}` : '';

  return (
    <div className="space-y-8">
      <PageHeader
        badge="Analítica educativa"
        title="Mis reportes de aprendizaje"
        subtitle="Revisa tu avance, tus habilidades lectoras y las recomendaciones generadas por IA."
        crumbs={[
          { label: 'Inicio', to: '/student/home' },
          { label: 'Reportes' },
        ]}
        action={
          <ExportButtons onPdf={() => downloadStudentReportPdf(token, filters)} />
        }
      />

      <div className="rounded-xl border border-slate-100 bg-white/60 px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-900/40">
        <span className="font-medium text-slate-800 dark:text-slate-100">{studentName}</span>
        <span className="text-slate-500 dark:text-slate-400"> · Estudiante · </span>
        <span className="text-slate-500 dark:text-slate-400">
          {formatReportPeriod(filters.period || 'all')}
        </span>
      </div>

      <ReportFilters filters={filters} onChange={setFilters} role="student" />

      {loading && <LoadingState />}
      {error && (
        <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </p>
      )}

      {!loading && !error && summary && !summary.hasData && (
        <EmptyReportState
          message="No hay reportes disponibles todavía. Completa actividades para generar evidencias de aprendizaje."
        />
      )}

      {!loading && !error && summary?.hasData && (
        <>
          <SummaryCards cards={summaryCardItemsStudent(summary)} />
          <SkillMap skills={skills} />
          <div className="grid gap-6 lg:grid-cols-2">
            <AreaPerformanceChart areas={areas} />
            <ProgressTimeline timeline={timeline} />
          </div>
          <RecentActivitiesTable activities={activities} />
          <RecentFeedbackList items={feedback} />
          <RecommendationsPanel recommendations={recommendations} />
          <LearningEvidencePanel evidence={evidence} role="student" />
        </>
      )}
    </div>
  );
}
