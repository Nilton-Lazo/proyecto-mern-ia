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

export interface StudentActivityRow {
  _id: string;
  titulo: string;
  descripcion?: string;
  dueAt?: string;
  progreso: number;
  status: 'draft' | 'submitted';
  displayStatus: ActivityDisplayStatus;
  preguntasCount?: number;
  questionsGenerated?: boolean;
  actualizada: string;
  score?: number | null;
}

export interface StudentActivityDetail {
  _id: string;
  title: string;
  instructions?: string;
  text: string;
  dueAt?: string;
  progressPercent: number;
  status: 'draft' | 'submitted';
  displayStatus: ActivityDisplayStatus;
  answer?: string;
  questions: ActivityQuestion[];
  questionAnswers: QuestionAnswer[];
  aiAnalysis: AiAnalysis;
  questionsGenerated: boolean;
  score?: number | null;
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
  lastActivity: StudentActivityRow | null;
  activities: StudentActivityRow[];
}

export interface PracticeAnalysis {
  mainIdea: string;
  keywords: string[];
  difficulty: string;
  readingTip: string;
}
