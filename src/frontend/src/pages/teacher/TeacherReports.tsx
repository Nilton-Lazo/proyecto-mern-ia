import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/ui/PageHeader';
import LoadingState from '../../components/ui/LoadingState';
import ReportFilters from '../../components/reports/ReportFilters';
import SummaryCards from '../../components/reports/SummaryCards';
import SkillMap from '../../components/reports/SkillMap';
import StudentRankingTable from '../../components/reports/StudentRankingTable';
import TeacherAreaTopicTable from '../../components/reports/TeacherAreaTopicTable';
import ActivityDifficultyTable from '../../components/reports/ActivityDifficultyTable';
import TeacherAnswersTable from '../../components/reports/TeacherAnswersTable';
import PedagogicalAlerts from '../../components/reports/PedagogicalAlerts';
import RecommendationsPanel from '../../components/reports/RecommendationsPanel';
import LearningEvidencePanel from '../../components/reports/LearningEvidencePanel';
import ExportButtons from '../../components/reports/ExportButtons';
import EmptyReportState from '../../components/reports/EmptyReportState';
import { summaryCardItemsTeacher } from '../../utils/reportCalculations';
import { formatReportPeriod } from '../../utils/reportFormatters';
import {
  fetchTeacherReportSummary,
  fetchTeacherReportSkills,
  fetchTeacherReportStudents,
  fetchTeacherReportAreas,
  fetchTeacherReportDifficulty,
  fetchTeacherReportAnswers,
  fetchTeacherReportAlerts,
  fetchTeacherReportRecommendations,
  downloadTeacherReportPdf,
  downloadTeacherReportCsv,
} from '../../services/reportService';
import type {
  ReportFilters as ReportFilterState,
  TeacherReportSummary,
  SkillReportItem,
  StudentRankingRow,
  AreaTopicReport,
  ActivityDifficulty,
  TeacherAnswerRow,
  PedagogicalAlert,
  EvidenceItem,
} from '../../types/reports';

export default function TeacherReports() {
  const { user, token } = useAuth();
  const [filters, setFilters] = useState<ReportFilterState>({ period: 'all', area: 'todas', status: 'all' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<TeacherReportSummary | null>(null);
  const [skills, setSkills] = useState<SkillReportItem[]>([]);
  const [students, setStudents] = useState<StudentRankingRow[]>([]);
  const [areas, setAreas] = useState<AreaTopicReport[]>([]);
  const [difficulty, setDifficulty] = useState<ActivityDifficulty[]>([]);
  const [answers, setAnswers] = useState<TeacherAnswerRow[]>([]);
  const [alerts, setAlerts] = useState<PedagogicalAlert[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [evidence, setEvidence] = useState<EvidenceItem[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, sk, st, ar, diff, ans, al, rec] = await Promise.all([
        fetchTeacherReportSummary(token, filters),
        fetchTeacherReportSkills(token, filters),
        fetchTeacherReportStudents(token, filters),
        fetchTeacherReportAreas(token, filters),
        fetchTeacherReportDifficulty(token, filters),
        fetchTeacherReportAnswers(token, filters),
        fetchTeacherReportAlerts(token, filters),
        fetchTeacherReportRecommendations(token, filters),
      ]);
      setSummary(s.summary);
      setSkills(sk.skills);
      setStudents(st.students);
      setAreas(ar.areas);
      setDifficulty(diff.activities);
      setAnswers(ans.answers);
      setAlerts(al.alerts);
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

  const teacherName = user ? `${user.nombres}` : '';

  return (
    <div className="space-y-8">
      <PageHeader
        badge="Seguimiento pedagógico"
        title="Reportes del grupo"
        subtitle="Analiza el avance de tus estudiantes, identifica dificultades y toma decisiones pedagógicas con apoyo de IA."
        crumbs={[
          { label: 'Inicio', to: '/teacher/dashboard' },
          { label: 'Reportes' },
        ]}
        action={
          <ExportButtons
            onPdf={() => downloadTeacherReportPdf(token, filters)}
            onCsv={() => downloadTeacherReportCsv(token, filters)}
          />
        }
      />

      <div className="rounded-xl border border-slate-100 bg-white/60 px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-900/40">
        <span className="font-medium text-slate-800 dark:text-slate-100">{teacherName}</span>
        <span className="text-slate-500 dark:text-slate-400"> · Docente · </span>
        <span className="text-slate-500 dark:text-slate-400">
          {formatReportPeriod(filters.period || 'all')}
        </span>
      </div>

      <ReportFilters
        filters={filters}
        onChange={setFilters}
        role="teacher"
        students={students}
      />

      {loading && <LoadingState />}
      {error && (
        <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </p>
      )}

      {!loading && !error && summary && !summary.hasData && (
        <EmptyReportState message="Aún no hay entregas suficientes para generar análisis del grupo." />
      )}

      {!loading && !error && summary?.hasData && (
        <>
          <SummaryCards cards={summaryCardItemsTeacher(summary)} />
          <SkillMap
            skills={skills}
            title="Mapa grupal de habilidades lectoras"
            subtitle="Promedio del grupo en cada habilidad lectora evaluada por IA"
          />
          <PedagogicalAlerts alerts={alerts} />
          <StudentRankingTable students={students} />
          <TeacherAreaTopicTable areas={areas} />
          <ActivityDifficultyTable activities={difficulty} />
          <TeacherAnswersTable answers={answers} />
          <RecommendationsPanel
            recommendations={recommendations}
            emptyMessage="Las recomendaciones pedagógicas aparecerán cuando haya más evidencias del grupo."
          />
          <LearningEvidencePanel evidence={evidence} role="teacher" />
        </>
      )}
    </div>
  );
}
