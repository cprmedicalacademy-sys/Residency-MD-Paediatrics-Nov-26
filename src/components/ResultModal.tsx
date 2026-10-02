import React from 'react';
import { ExamResult } from '../types/quiz';
import confetti from 'canvas-confetti';
import {
  Award,
  Calculator,
  CheckCircle2,
  Clock,
  Eye,
  LayoutDashboard,
  MinusCircle,
  PlusCircle,
  RotateCcw,
  Share2,
  Trophy,
  XCircle,
} from 'lucide-react';

interface ResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: ExamResult | null;
  onReviewExam: () => void;
  onOpenShareModal: () => void;
  onRetakeExam: () => void;
  onGoToDashboard: () => void;
  onViewLeaderboard: () => void;
}

export const ResultModal: React.FC<ResultModalProps> = ({
  isOpen,
  onClose,
  result,
  onReviewExam,
  onOpenShareModal,
  onRetakeExam,
  onGoToDashboard,
  onViewLeaderboard,
}) => {
  React.useEffect(() => {
    if (isOpen && result && result.passed) {
      try {
        confetti({
          particleCount: 85,
          spread: 75,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }
    }
  }, [isOpen, result]);

  if (!isOpen || !result) return null;

  const { formula } = result;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header Ribbon */}
        <div
          className={`p-6 text-white text-center relative ${
            result.passed
              ? 'bg-gradient-to-b from-teal-700 to-teal-900'
              : 'bg-gradient-to-b from-slate-800 to-slate-900'
          }`}
        >
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md mb-2 shadow-inner">
            {result.passed ? (
              <Trophy className="w-8 h-8 text-amber-300" />
            ) : (
              <Award className="w-8 h-8 text-slate-300" />
            )}
          </div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-teal-200">
            Residency MD Paediatrics Nov-26
          </h2>
          <h1 className="text-2xl font-black tracking-tight text-white mt-1">
            {result.passed ? 'Congratulations, Doctor!' : 'Exam Completed'}
          </h1>
          <p className="text-xs text-teal-100 max-w-md mx-auto mt-0.5">
            {result.userName} · {result.userInstitute}
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Main Final Result Block */}
          <div className="bg-teal-50/70 rounded-2xl p-5 border border-teal-200 text-center space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-widest text-teal-800 block">
              FINAL COMPUTED SCORE
            </span>
            <div className="flex items-baseline justify-center gap-1.5">
              <span className="text-4xl font-black text-teal-900 font-mono">
                {formula.finalScore.toFixed(2)}
              </span>
              <span className="text-sm font-bold text-teal-700 font-mono">/ {formula.maxMarks.toFixed(1)} Marks</span>
            </div>
            <div className="flex items-center justify-center gap-3 pt-1 text-xs">
              <span className="font-mono font-bold text-slate-700">
                Accuracy: {result.percentage.toFixed(1)}%
              </span>
              <span>·</span>
              <span
                className={`font-bold ${
                  result.passed ? 'text-emerald-700' : 'text-rose-700'
                }`}
              >
                {result.passed ? 'QUALIFIED (≥24.0)' : 'NEEDS REVISION (<24.0)'}
              </span>
            </div>
          </div>

          {/* Exact Required Scoring Formula Breakdown */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider pb-1 border-b border-slate-200">
              <Calculator className="w-4 h-4 text-teal-600" />
              <span>Exact Formula Calculation Breakdown:</span>
            </div>

            <div className="space-y-2 text-xs text-slate-700 font-mono">
              {/* Step 1: MCQ (True/False) Calculation */}
              <div className="flex items-start justify-between gap-2 p-2 rounded-lg bg-white border border-slate-200/80">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-900 block font-sans">
                    1. MCQ (True/False) Score:
                  </span>
                  <span className="text-[11px] text-slate-500">
                    ({formula.mcqCorrect} Correct - {formula.mcqWrong} Wrong) × 0.2
                  </span>
                </div>
                <span className="font-bold text-teal-800 text-sm">
                  {formula.mcqIntermediateScore >= 0 ? `+${formula.mcqIntermediateScore.toFixed(2)}` : formula.mcqIntermediateScore.toFixed(2)}
                </span>
              </div>

              {/* Step 2: Adding SBA Score */}
              <div className="flex items-start justify-between gap-2 p-2 rounded-lg bg-white border border-slate-200/80">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-900 block font-sans">
                    2. SBA Clinical Cases Score:
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {formula.sbaCorrect} Correct of 5 SBAs (+1.0 each)
                  </span>
                </div>
                <span className="font-bold text-emerald-700 text-sm">
                  +{formula.sbaCorrect.toFixed(2)}
                </span>
              </div>

              {/* Step 3: Negative Marking Deduction */}
              <div className="flex items-start justify-between gap-2 p-2 rounded-lg bg-white border border-slate-200/80">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-900 block font-sans">
                    3. Negative Marking Penalty:
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Subtract ({formula.mcqWrong} Wrong MCQs × 0.05)
                  </span>
                </div>
                <span className="font-bold text-rose-600 text-sm">
                  -{formula.negativeDeduction.toFixed(2)}
                </span>
              </div>

              {/* Final Computed Value */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-teal-50 border border-teal-200 font-bold text-teal-950">
                <span className="font-sans text-xs">Final Computed Result:</span>
                <span className="text-base text-teal-900">
                  {formula.finalScore.toFixed(2)} / 40.0
                </span>
              </div>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="space-y-2.5 pt-1 border-t border-slate-100">
            <button
              onClick={onOpenShareModal}
              className="w-full py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition-colors flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Result & Certificate Card</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onReviewExam}
                className="py-2.5 px-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Eye className="w-4 h-4 text-teal-600" />
                <span>Review Answers</span>
              </button>

              <button
                onClick={onViewLeaderboard}
                className="py-2.5 px-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>Leaderboard</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onGoToDashboard}
                className="py-2.5 px-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <LayoutDashboard className="w-4 h-4 text-slate-600" />
                <span>Candidate Dashboard</span>
              </button>

              <button
                onClick={onRetakeExam}
                className="py-2.5 px-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retake Exam</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
