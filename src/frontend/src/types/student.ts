export type ActivityDisplayStatus =
  | 'pendiente'
  | 'en_progreso'
  | 'entregada'
  | 'vencida';

export type QuestionType =
  | 'literal'
  | 'inferential'
  | 'critical'
  | 'vocabulary'
  | 'main_idea';

export interface ActivityQuestion {
  questionText: string;
  type: QuestionType;
  order: number;
  difficulty?: string;
}

export interface QuestionAnswer {
  questionIndex: number;
  answer: string;
  feedback?: string;
  isCorrect?: 'correcta' | 'parcial' | 'incorrecta' | '';
}

export interface AiAnalysis {
  mainIdea?: string;
  keywords?: string[];
  difficulty?: string;
  biases?: string[];
  readingTip?: string;
}

export type SkillScores = Partial<Record<QuestionType, number | null>>;

export interface SkillRecommendation {
  skill: string;
  label: string;
  level: 'alto' | 'medio' | 'bajo';
  message: string;
}

export interface AreaGroupStats {
  total: number;
  pendiente: number;
  en_progreso: number;
  entregada: number;
  vencida: number;
}

export interface AreaGroup {
  area: string;
  activities: StudentActivityRow[];
  stats: AreaGroupStats;
}

export interface StudentActivityRow {
  _id: string;
  titulo: string;
  area?: string;
  tema?: string;
  descripcion?: string;
  docente?: string;
  dueAt?: string;
  progreso: number;
  status: 'draft' | 'submitted';
  displayStatus: ActivityDisplayStatus;
  preguntasCount?: number;
  questionsGenerated?: boolean;
  actualizada: string;
  lastSavedAt?: string;
  score?: number | null;
}

export interface StudentActivityDetail {
  _id: string;
  title: string;
  area?: string;
  topic?: string;
  instructions?: string;
  text: string;
  sourceType?: 'text' | 'pdf' | 'markdown';
  originalFileName?: string;
  teacherName?: string;
  dueAt?: string;
  progressPercent: number;
  status: 'draft' | 'submitted';
  displayStatus: ActivityDisplayStatus;
  currentStep?: number;
  lastSavedAt?: string;
  answer?: string;
  questions: ActivityQuestion[];
  questionAnswers: QuestionAnswer[];
  aiAnalysis: AiAnalysis;
  questionsGenerated: boolean;
  score?: number | null;
  skillScores?: SkillScores;
  skillRecommendations?: SkillRecommendation[];
  feedbackSummary?: string;
  recommendation?: string;
  motivation?: string;
}

export interface StudentProgressSummary {
  totalActivities: number;
  pending: number;
  inProgress: number;
  completed: number;
  overdue: number;
  avgProgress: number;
  avgScore: number | null;
  skillScores?: SkillScores;
  skillRecommendations?: SkillRecommendation[];
  lastActivity: StudentActivityRow | null;
  activities: StudentActivityRow[];
  groupedByArea?: AreaGroup[];
}

export interface PracticeAnalysis {
  mainIdea: string;
  keywords: string[];
  difficulty: string;
  readingTip: string;
}
