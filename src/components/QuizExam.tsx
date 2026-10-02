import React, { useEffect, useState } from 'react';
import {
  ExamFormulaBreakdown,
  ExamResult,
  MCQQuestion,
  Question,
  SBAQuestion,
  Topic,
  UserAnswers,
} from '../types/quiz';
import { EXAM_METADATA, QUIZ_QUESTIONS } from '../data/quizData';
import { UserProfile } from '../utils/storage';
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  Calculator,
  Check,
  CheckCircle2,
  Clock,
  Eye,
  Filter,
  GraduationCap,
  Pause,
  Play,
  RotateCcw,
  Send,
  Sparkles,
  X,
  XCircle,
} from 'lucide-react';

interface QuizExamProps {
  userProfile: UserProfile;
  initialMode?: 'exam' | 'practice';
  reviewExamResult?: ExamResult | null;
  onFinishExam: (result: ExamResult) => void;
  onExitReview?: () => void;
}

export const QuizExam: React.FC<QuizExamProps> = ({
  userProfile,
  initialMode = 'exam',
  reviewExamResult,
  onFinishExam,
  onExitReview,
}) => {
  const [selectedTopic, setSelectedTopic] = useState<'All' | Topic>('All');
  const [selectedType, setSelectedType] = useState<'all' | 'mcq' | 'sba'>('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswers>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());
  const [examMode, setExamMode] = useState<'exam' | 'practice'>(initialMode);
  const [isSubmitConfirmOpen, setIsSubmitConfirmOpen] = useState(false);

  // Timer states
  const [timeRemaining, setTimeRemaining] = useState(EXAM_METADATA.defaultDurationMinutes * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [timeSpent, setTimeSpent] = useState(0);

  // Filter questions based on topic and type
  const filteredQuestions = QUIZ_QUESTIONS.filter((q) => {
    if (selectedTopic !== 'All' && q.topic !== selectedTopic) return false;
    if (selectedType !== 'all' && q.type !== selectedType) return false;
    return true;
  });

  const currentQuestion: Question | undefined = filteredQuestions[currentIndex] || filteredQuestions[0];
  const isReviewMode = Boolean(reviewExamResult);

  // Timer tick effect
  useEffect(() => {
    if (isReviewMode || examMode === 'practice') return;
    if (!isTimerRunning) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
      setTimeSpent((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerRunning, isReviewMode, examMode]);

  // Answer handlers
  const handleMCQAnswer = (stemId: 'A' | 'B' | 'C' | 'D' | 'E', value: boolean) => {
    if (isReviewMode) return;
    if (!currentQuestion || currentQuestion.type !== 'mcq') return;

    setUserAnswers((prev) => {
      const qAnswers = prev[currentQuestion.id]?.mcq || {};
      return {
        ...prev,
        [currentQuestion.id]: {
          ...prev[currentQuestion.id],
          mcq: {
            ...qAnswers,
            [stemId]: value,
          },
        },
      };
    });
  };

  const handleSBAAnswer = (optionId: 'A' | 'B' | 'C' | 'D' | 'E') => {
    if (isReviewMode) return;
    if (!currentQuestion || currentQuestion.type !== 'sba') return;

    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        ...prev[currentQuestion.id],
        sba: optionId,
      },
    }));
  };

  const toggleFlag = (id: number) => {
    setFlaggedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Status check for question navigation
  const getQuestionStatus = (q: Question) => {
    const ans = userAnswers[q.id];
    if (!ans) return 'unanswered';
    if (q.type === 'mcq') {
      const mcqAns = ans.mcq || {};
      const count = Object.keys(mcqAns).length;
      if (count === 5) return 'completed';
      if (count > 0) return 'partial';
      return 'unanswered';
    } else {
      return ans.sba ? 'completed' : 'unanswered';
    }
  };

  // Precise Scoring Calculation following official formula:
  // Step 1: MCQ (True/False) Calculation: Total Correct MCQs minus Wrong MCQs. Then multiply by 0.2.
  // Step 2: Adding SBA Score: Add the correct SBA score to the intermediate result.
  // Step 3: Negative Marking Deduction: Subtract (Wrong MCQ count * 0.05) from the total.
  // Final Result: The final computed value displayed as final score/result!
  const calculateScore = (): ExamResult => {
    let mcqCorrect = 0;
    let mcqWrong = 0;
    let mcqUnattempted = 0;

    let sbaCorrect = 0;
    let sbaWrong = 0;
    let sbaUnattempted = 0;

    const topicStats: Record<Topic, { correct: number; wrong: number; total: number; percentage: number }> = {
      Neurology: { correct: 0, wrong: 0, total: 0, percentage: 0 },
      Endocrinology: { correct: 0, wrong: 0, total: 0, percentage: 0 },
      Rheumatology: { correct: 0, wrong: 0, total: 0, percentage: 0 },
      'Emergency & General': { correct: 0, wrong: 0, total: 0, percentage: 0 },
    };

    QUIZ_QUESTIONS.forEach((q) => {
      const ans = userAnswers[q.id];
      const topic = q.topic;

      if (q.type === 'mcq') {
        const mcqAns = ans?.mcq || {};
        q.options.forEach((stem) => {
          topicStats[topic].total += 1;
          const userChoice = mcqAns[stem.id];
          if (userChoice === undefined) {
            mcqUnattempted += 1;
          } else if (userChoice === stem.isTrue) {
            mcqCorrect += 1;
            topicStats[topic].correct += 1;
          } else {
            mcqWrong += 1;
            topicStats[topic].wrong += 1;
          }
        });
      } else if (q.type === 'sba') {
        topicStats[topic].total += 1;
        const userChoice = ans?.sba;
        if (userChoice === undefined) {
          sbaUnattempted += 1;
        } else if (userChoice === q.correctOption) {
          sbaCorrect += 1;
          topicStats[topic].correct += 1;
        } else {
          sbaWrong += 1;
          topicStats[topic].wrong += 1;
        }
      }
    });

    Object.keys(topicStats).forEach((k) => {
      const t = k as Topic;
      if (topicStats[t].total > 0) {
        topicStats[t].percentage = (topicStats[t].correct / topicStats[t].total) * 100;
      }
    });

    // Step 1: MCQ (True/False) Calculation: Total Correct MCQs minus Wrong MCQs. Then multiply by 0.2.
    const mcqIntermediateScore = Number(((mcqCorrect - mcqWrong) * 0.2).toFixed(2));

    // Step 2 & 3: Adding SBA Score & Negative Marking Deduction
    const negativeDeduction = Number((mcqWrong * 0.05).toFixed(2));
    const rawFinalScore = mcqIntermediateScore + sbaCorrect - negativeDeduction;
    const finalScore = Number(rawFinalScore.toFixed(2));
    const maxMarks = 40.0; // 35 MCQ marks (175 stems * 0.2) + 5 SBA marks
    const percentage = Number(Math.max(0, (finalScore / maxMarks) * 100).toFixed(1));

    const formula: ExamFormulaBreakdown = {
      mcqCorrect,
      mcqWrong,
      mcqUnattempted,
      mcqIntermediateScore,
      sbaCorrect,
      sbaWrong,
      sbaUnattempted,
      negativeDeduction,
      finalScore,
      maxMarks,
    };

    const now = new Date();
    const dateFormatted = now.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    return {
      id: `exam-${Date.now()}`,
      userName: userProfile.name,
      userInstitute: userProfile.institute,
      date: dateFormatted,
      timestamp: Date.now(),
      examMode,
      formula,
      scoreMarks: finalScore,
      totalMarks: maxMarks,
      percentage,
      timeSpentSeconds: timeSpent,
      topicBreakdown: topicStats,
      passed: finalScore >= 24.0, // 60% of 40 marks = 24.0 marks
    };
  };

  const handleSubmitExam = () => {
    setIsSubmitConfirmOpen(false);
    const result = calculateScore();
    onFinishExam(result);
  };

  const handleResetExam = () => {
    if (confirm('Clear all marked answers and restart?')) {
      setUserAnswers({});
      setFlaggedQuestions(new Set());
      setCurrentIndex(0);
      setTimeRemaining(EXAM_METADATA.defaultDurationMinutes * 60);
      setTimeSpent(0);
      setIsTimerRunning(true);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  let answeredCount = 0;
  QUIZ_QUESTIONS.forEach((q) => {
    const st = getQuestionStatus(q);
    if (st === 'completed') answeredCount++;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner & Mode Switcher */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-teal-800 uppercase tracking-wider">
              {EXAM_METADATA.faculty}
            </span>
            <span>·</span>
            <span className="text-xs font-semibold text-slate-500">
              35 MCQs (175 T/F stems) + 5 SBAs · Max: 40.0 Marks
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
            {isReviewMode ? 'Answer Key & Formula Review' : 'Residency MD Assessment'}
          </h1>
        </div>

        {/* Controls: Mode Switch, Timer, Submit */}
        <div className="flex flex-wrap items-center gap-2.5">
          {!isReviewMode && (
            <>
              {/* Practice Mode vs Exam Mode Segmented Toggle */}
              <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setExamMode('exam')}
                  className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                    examMode === 'exam'
                      ? 'bg-teal-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Exam Mode (Timed)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setExamMode('practice')}
                  className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                    examMode === 'practice'
                      ? 'bg-teal-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Practice Mode (Instant Feedback)</span>
                </button>
              </div>

              {/* Timer in Exam Mode */}
              {examMode === 'exam' && (
                <div
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-mono font-bold text-sm ${
                    timeRemaining <= 300
                      ? 'bg-rose-50 border-rose-300 text-rose-700 animate-pulse'
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <Clock className="w-4 h-4 text-teal-600" />
                  <span>{formatTimer(timeRemaining)}</span>
                  <button
                    type="button"
                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                    className="p-1 hover:bg-slate-200/60 rounded-md text-slate-500 transition-colors"
                    title={isTimerRunning ? 'Pause timer' : 'Resume timer'}
                  >
                    {isTimerRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                  </button>
                </div>
              )}

              {/* Submit Exam Button */}
              <button
                type="button"
                onClick={() => setIsSubmitConfirmOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Calculate & Submit</span>
              </button>
            </>
          )}

          {isReviewMode && (
            <button
              type="button"
              onClick={onExitReview}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </button>
          )}
        </div>
      </div>

      {/* Official Grading Formula Explanation Ribbon */}
      <div className="bg-teal-900 text-teal-50 rounded-2xl p-3 sm:p-4 text-xs shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Calculator className="w-4 h-4 text-amber-300 shrink-0" />
          <span className="font-bold text-white uppercase tracking-wider">
            Official CPR Faculty Scoring Formula:
          </span>
        </div>
        <div className="font-mono text-[11px] bg-teal-950/60 px-3 py-1.5 rounded-lg border border-teal-700/50 leading-relaxed text-teal-200">
          Final Score = [(Correct MCQ - Wrong MCQ) × 0.2] + Correct SBA - (Wrong MCQ × 0.05)
        </div>
      </div>

      {/* Filter / Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-100/80 p-2.5 rounded-xl border border-slate-200">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="font-bold text-slate-500 uppercase tracking-wider mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Topic:
          </span>
          {(['All', 'Neurology', 'Endocrinology', 'Rheumatology', 'Emergency & General'] as const).map(
            (topic) => (
              <button
                key={topic}
                onClick={() => {
                  setSelectedTopic(topic);
                  setCurrentIndex(0);
                }}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                  selectedTopic === topic
                    ? 'bg-white text-teal-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                {topic}
              </button>
            )
          )}
        </div>

        <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200">
          <button
            onClick={() => {
              setSelectedType('all');
              setCurrentIndex(0);
            }}
            className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
              selectedType === 'all' ? 'bg-teal-600 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Questions (40)
          </button>
          <button
            onClick={() => {
              setSelectedType('mcq');
              setCurrentIndex(0);
            }}
            className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
              selectedType === 'mcq' ? 'bg-teal-600 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            MCQ True/False (35)
          </button>
          <button
            onClick={() => {
              setSelectedType('sba');
              setCurrentIndex(0);
            }}
            className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
              selectedType === 'sba' ? 'bg-teal-600 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            SBA Cases (5)
          </button>
        </div>
      </div>

      {/* Main Two-Zone Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Question Canvas */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {currentQuestion ? (
            <div className="p-6 sm:p-8 space-y-6">
              {/* Question Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 font-bold text-sm flex items-center justify-center font-mono">
                    {currentIndex + 1}
                  </span>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
                      {currentQuestion.type === 'mcq'
                        ? 'Multiple Choice (5 True/False Stems · 0.2 marks each)'
                        : 'Single Best Answer (Clinical Case · 1.0 mark)'}
                    </span>
                    <div className="text-xs text-slate-500 font-medium">
                      Module: {currentQuestion.topic} · Q#{currentQuestion.id} of {QUIZ_QUESTIONS.length}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => toggleFlag(currentQuestion.id)}
                  className={`p-2 rounded-xl border transition-colors flex items-center gap-1.5 text-xs font-semibold ${
                    flaggedQuestions.has(currentQuestion.id)
                      ? 'bg-amber-50 border-amber-300 text-amber-800'
                      : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                  title="Flag question for review"
                >
                  {flaggedQuestions.has(currentQuestion.id) ? (
                    <>
                      <BookmarkCheck className="w-4 h-4 text-amber-600" />
                      <span className="hidden sm:inline">Flagged</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-4 h-4 text-slate-400" />
                      <span className="hidden sm:inline">Flag</span>
                    </>
                  )}
                </button>
              </div>

              {/* Question Stem Text */}
              <div className="space-y-1">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                  {currentQuestion.stem}
                </h2>
                {currentQuestion.type === 'mcq' && (
                  <p className="text-xs text-slate-500 italic">
                    Select <strong>True (T)</strong> or <strong>False (F)</strong> for each of the 5 statements below:
                  </p>
                )}
              </div>

              {/* MCQ True/False Options Block */}
              {currentQuestion.type === 'mcq' && (
                <div className="space-y-3 pt-2">
                  {(currentQuestion as MCQQuestion).options.map((stem) => {
                    const currentAnswer = userAnswers[currentQuestion.id]?.mcq?.[stem.id];
                    const showFeedback = examMode === 'practice' || isReviewMode;
                    const isCorrect = currentAnswer === stem.isTrue;

                    return (
                      <div
                        key={stem.id}
                        className={`p-3.5 sm:p-4 rounded-xl border transition-all ${
                          showFeedback && currentAnswer !== undefined
                            ? isCorrect
                              ? 'bg-emerald-50/60 border-emerald-300'
                              : 'bg-rose-50/60 border-rose-300'
                            : currentAnswer !== undefined
                            ? 'bg-teal-50/40 border-teal-300'
                            : 'bg-slate-50/60 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-start gap-2.5 flex-1">
                            <span className="font-bold text-slate-700 text-sm font-mono mt-0.5">
                              {stem.id}.
                            </span>
                            <span className="text-sm font-medium text-slate-800 leading-relaxed">
                              {stem.text}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                            {/* TRUE BUTTON */}
                            <button
                              type="button"
                              disabled={isReviewMode}
                              onClick={() => handleMCQAnswer(stem.id, true)}
                              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                                currentAnswer === true
                                  ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-200'
                                  : 'bg-white border border-slate-200 text-slate-700 hover:border-emerald-500 hover:bg-emerald-50/50'
                              }`}
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>True</span>
                            </button>

                            {/* FALSE BUTTON */}
                            <button
                              type="button"
                              disabled={isReviewMode}
                              onClick={() => handleMCQAnswer(stem.id, false)}
                              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                                currentAnswer === false
                                  ? 'bg-rose-600 text-white shadow-xs ring-2 ring-rose-200'
                                  : 'bg-white border border-slate-200 text-slate-700 hover:border-rose-500 hover:bg-rose-50/50'
                              }`}
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>False</span>
                            </button>
                          </div>
                        </div>

                        {/* Instant Feedback indicator line if answered or in review */}
                        {showFeedback && (
                          <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-700">
                                Official Key:{' '}
                                <span
                                  className={
                                    stem.isTrue
                                      ? 'text-emerald-700 font-black'
                                      : 'text-rose-700 font-black'
                                  }
                                >
                                  {stem.isTrue ? 'True (T)' : 'False (F)'}
                                </span>
                              </span>
                            </div>

                            {currentAnswer !== undefined ? (
                              <div
                                className={`font-semibold flex items-center gap-1 ${
                                  isCorrect ? 'text-emerald-700' : 'text-rose-700'
                                }`}
                              >
                                {isCorrect ? (
                                  <>
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Correct (+0.2 marks)</span>
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="w-3.5 h-3.5" />
                                    <span>Wrong (Penalty: -0.25 effective)</span>
                                  </>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-400">Not answered yet</span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* SBA Single Best Answer Options Block */}
              {currentQuestion.type === 'sba' && (
                <div className="space-y-3 pt-2">
                  {(currentQuestion as SBAQuestion).options.map((opt) => {
                    const currentAnswer = userAnswers[currentQuestion.id]?.sba;
                    const isSelected = currentAnswer === opt.id;
                    const isCorrect = (currentQuestion as SBAQuestion).correctOption === opt.id;
                    const showFeedback = examMode === 'practice' || isReviewMode;

                    return (
                      <button
                        type="button"
                        key={opt.id}
                        disabled={isReviewMode}
                        onClick={() => handleSBAAnswer(opt.id)}
                        className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3 ${
                          showFeedback
                            ? isCorrect
                              ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-semibold'
                              : isSelected
                              ? 'bg-rose-50 border-rose-300 text-rose-950'
                              : 'bg-white border-slate-200 opacity-70'
                            : isSelected
                            ? 'bg-teal-50 border-teal-500 shadow-xs'
                            : 'bg-white border-slate-200 hover:border-teal-300 hover:bg-slate-50'
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                            showFeedback && isCorrect
                              ? 'bg-emerald-600 text-white'
                              : isSelected
                              ? 'bg-teal-600 text-white'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {opt.id}
                        </div>
                        <div className="flex-1">
                          <span className="text-sm text-slate-900 font-medium leading-relaxed">
                            {opt.text}
                          </span>
                        </div>
                        {showFeedback && isCorrect && (
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                            Correct (+1.0 Mark)
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Faculty Clinical Explanation Box */}
              {(examMode === 'practice' || isReviewMode) && currentQuestion.explanation && (
                <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-950 space-y-1 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>Faculty Clinical Note:</span>
                  </div>
                  <p className="text-slate-800 leading-relaxed font-sans">
                    {currentQuestion.explanation}
                  </p>
                </div>
              )}

              {/* Navigation Controls */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <div className="text-xs text-slate-500 font-mono">
                  Question {currentIndex + 1} of {filteredQuestions.length}
                </div>

                <button
                  type="button"
                  disabled={currentIndex === filteredQuestions.length - 1}
                  onClick={() =>
                    setCurrentIndex((prev) => Math.min(filteredQuestions.length - 1, prev + 1))
                  }
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs disabled:opacity-40 disabled:pointer-events-none transition-colors shadow-xs"
                >
                  <span>Next Question</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500">No questions found for this topic.</div>
          )}
        </div>

        {/* Right Zone: Interactive Question Navigator & Scoring Status */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Question Navigator</h3>
                <p className="text-xs text-slate-500">
                  {answeredCount} of {QUIZ_QUESTIONS.length} Questions Completed
                </p>
              </div>
              <span className="text-sm font-bold font-mono text-teal-700">
                {Math.round((answeredCount / QUIZ_QUESTIONS.length) * 100)}%
              </span>
            </div>

            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-teal-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${(answeredCount / QUIZ_QUESTIONS.length) * 100}%` }}
              />
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1 border-t border-slate-100">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-teal-600" />
                <span>Completed</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-amber-200" />
                <span>Partial (MCQ)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-white border border-slate-300" />
                <span>Unanswered</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-amber-500" />
                <span>Flagged</span>
              </div>
            </div>

            {/* 40-Question Button Grid */}
            <div className="grid grid-cols-5 sm:grid-cols-8 lg:grid-cols-5 gap-1.5 pt-2 max-h-[320px] overflow-y-auto pr-1">
              {filteredQuestions.map((q, idx) => {
                const status = getQuestionStatus(q);
                const isCurrent = idx === currentIndex;
                const isFlagged = flaggedQuestions.has(q.id);

                let btnClass = 'bg-white border-slate-200 text-slate-700 hover:border-teal-400';
                if (status === 'completed') {
                  btnClass = 'bg-teal-600 border-teal-600 text-white';
                } else if (status === 'partial') {
                  btnClass = 'bg-amber-100 border-amber-300 text-amber-900';
                }

                if (isCurrent) {
                  btnClass += ' ring-2 ring-teal-500 ring-offset-1 font-black';
                }

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-9 rounded-lg border font-mono text-xs font-bold relative transition-all flex items-center justify-center ${btnClass}`}
                  >
                    <span>{idx + 1}</span>
                    {isFlagged && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500" />
                    )}
                  </button>
                );
              })}
            </div>

            {!isReviewMode && (
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={handleResetExam}
                  className="text-slate-500 hover:text-rose-600 flex items-center gap-1 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Clear Answers</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsSubmitConfirmOpen(true)}
                  className="font-bold text-teal-700 hover:text-teal-900"
                >
                  Calculate Final &rarr;
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal before Submit */}
      {isSubmitConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center">
                <Calculator className="w-5 h-5 text-teal-700" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Compute & Submit Exam?</h3>
                <p className="text-xs text-slate-500">CPR Medical Academy Grading Engine</p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Questions Answered:</span>
                <span className="font-bold text-slate-800">
                  {answeredCount} of {QUIZ_QUESTIONS.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Unanswered Questions:</span>
                <span className="font-bold text-amber-700">
                  {QUIZ_QUESTIONS.length - answeredCount}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Scoring Engine:</span>
                <span className="font-bold text-teal-700">
                  (Correct-Wrong)×0.2 + SBA - (Wrong×0.05)
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsSubmitConfirmOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Back to Questions
              </button>
              <button
                type="button"
                onClick={handleSubmitExam}
                className="px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs transition-colors"
              >
                Calculate Final Result
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
