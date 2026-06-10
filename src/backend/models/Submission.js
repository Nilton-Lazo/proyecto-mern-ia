const mongoose = require('mongoose');
const { Schema, Types } = mongoose;

const QuestionItemSchema = new Schema({
  questionText: { type: String, required: true },
  type: {
    type: String,
    enum: ['literal', 'inferential', 'critical', 'vocabulary', 'main_idea'],
    default: 'literal',
  },
  order: { type: Number, default: 0 },
  difficulty: { type: String, default: 'media' },
}, { _id: false });

const AnswerItemSchema = new Schema({
  questionIndex: { type: Number, required: true },
  answer: { type: String, default: '' },
  feedback: { type: String, default: '' },
  isCorrect: { type: String, enum: ['correcta', 'parcial', 'incorrecta', ''], default: '' },
}, { _id: false });

const AiAnalysisSchema = new Schema({
  mainIdea: { type: String, default: '' },
  keywords: { type: [String], default: [] },
  difficulty: { type: String, default: 'intermedio' },
  biases: { type: [String], default: [] },
  readingTip: { type: String, default: '' },
}, { _id: false });

const SkillScoresSchema = new Schema({
  literal: { type: Number, default: null },
  inferential: { type: Number, default: null },
  critical: { type: Number, default: null },
  vocabulary: { type: Number, default: null },
  main_idea: { type: Number, default: null },
}, { _id: false });

const SubmissionSchema = new Schema({
  activity: { type: Types.ObjectId, ref: 'Activity', required: true },
  student: { type: Types.ObjectId, ref: 'User', required: true },

  answer: { type: String, default: '' },
  questions: { type: [QuestionItemSchema], default: [] },
  questionAnswers: { type: [AnswerItemSchema], default: [] },
  aiAnalysis: { type: AiAnalysisSchema, default: () => ({}) },
  questionsGenerated: { type: Boolean, default: false },

  progressPercent: { type: Number, default: 0 },
  currentStep: { type: Number, default: 1 },
  lastSavedAt: { type: Date, default: null },

  score: { type: Number, default: null },
  skillScores: { type: SkillScoresSchema, default: () => ({}) },
  feedbackSummary: { type: String, default: '' },
  recommendation: { type: String, default: '' },
  motivation: { type: String, default: '' },

  status: { type: String, enum: ['draft', 'submitted'], default: 'draft' },
}, { timestamps: true });

SubmissionSchema.index({ activity: 1, student: 1 }, { unique: true });

module.exports = mongoose.models.Submission || mongoose.model('Submission', SubmissionSchema);
