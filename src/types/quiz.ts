export type Topic = 'Neurology' | 'Endocrinology' | 'Rheumatology' | 'Emergency & General';

export interface MCQStem {
  id: 'A' | 'B' | 'C' | 'D' | 'E';
  text: string;
  isTrue: boolean;
}

export interface MCQQuestion {
  id: number;
  type: 'mcq';
  number: number;
  topic: Topic;
  stem: string;
  options: MCQStem[];
  explanation?: string;
}

export interface SBAOption {
  id: 'A' | 'B' | 'C' | 'D' | 'E';
  text: string;
}

export interface SBAQuestion {
  id: number;
  type: 'sba';
  number: number;
  topic: Topic;
  stem: string;
  options: SBAOption[];
  correctOption: 'A' | 'B' | 'C' | 'D' | 'E';
  explanation?: string;
}

export type Question = MCQQuestion | SBAQuestion;

export interface UserMCQAnswer {
  A?: boolean;
  B?: boolean;
  C?: boolean;
  D?: boolean;
  E?: boolean;
}

export interface UserAnswers {
  [questionId: number]: {
    mcq?: UserMCQAnswer;
    sba?: 'A' | 'B' | 'C' | 'D' | 'E';
  };
}

export interface ExamFormulaBreakdown {
  totalMCQStems: number; // 175
  mcqWrong: number; // ভুল MCQ
  step1Result: number; // 175 - ভুল MCQ
  step2Result: number; // প্রাপ্ত ফলাফল × 0.2
  sbaCorrect: number; // সঠিক SBA
  step3Result: number; // প্রাপ্ত ফলাফল + সঠিক SBA
  negativeDeduction: number; // ভুল MCQ সংখ্যা × 0.05
  finalScore: number; // প্রাপ্ত ফলাফলই সর্বশেষ রেজাল্ট
  maxMarks: number; // 40.0
  mcqCorrect?: number;
  mcqUnattempted?: number;
  sbaWrong?: number;
  sbaUnattempted?: number;
  mcqIntermediateScore?: number;
}

export interface ExamResult {
  id: string;
  userName: string;
  userInstitute: string;
  date: string;
  timestamp: number;
  examMode: 'exam' | 'practice';
  // Precise CPR formula scoring:
  formula: ExamFormulaBreakdown;
  scoreMarks: number; // finalScore
  totalMarks: number; // maxMarks (40.0)
  percentage: number;
  timeSpentSeconds: number;
  topicBreakdown: {
    [key in Topic]: {
      correct: number;
      wrong: number;
      total: number;
      percentage: number;
    };
  };
  passed: boolean;
  rank?: number;
  userAnswers?: UserAnswers;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  institute: string;
  finalScore: number;
  maxScore: number;
  percentage: number;
  mcqCorrect: number;
  mcqWrong: number;
  sbaCorrect: number;
  timeTaken: string;
  date: string;
  isCurrentUser?: boolean;
  badge?: string;
}
