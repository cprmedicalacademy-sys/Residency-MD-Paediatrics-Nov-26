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
  mcqCorrect: number;
  mcqWrong: number;
  mcqUnattempted: number;
  mcqIntermediateScore: number; // (mcqCorrect - mcqWrong) * 0.2
  sbaCorrect: number;
  sbaWrong: number;
  sbaUnattempted: number;
  negativeDeduction: number; // mcqWrong * 0.05
  finalScore: number; // mcqIntermediateScore + sbaCorrect - negativeDeduction
  maxMarks: number; // 40.0 (35 MCQ marks + 5 SBA marks)
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
