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

  // Fully guarded numeric values for the exact 5-step Bengali formula
  const rawMcqWrong = Number(result.formula?.mcqWrong ?? 0) || 0;
  const rawMcqCorrect = Number(result.formula?.mcqCorrect ?? (175 - rawMcqWrong)) || 0;
  const rawSbaCorrect = Number(result.formula?.sbaCorrect ?? 0) || 0;
  const step1Result = Number(result.formula?.step1Result ?? (175 - rawMcqWrong)) || 0;
  const step2Result = Number(result.formula?.step2Result ?? (step1Result * 0.2)) || 0;
  const step3Result = Number(result.formula?.step3Result ?? (step2Result + rawSbaCorrect)) || 0;
  const negativeDeduction = Number(result.formula?.negativeDeduction ?? (rawMcqWrong * 0.05)) || 0;
  const finalScore = Number(result.formula?.finalScore ?? result.scoreMarks ?? (step3Result - negativeDeduction)) || 0;
  const maxMarks = 40.0;
  const percentage = Number(result.percentage ?? ((finalScore / maxMarks) * 100)) || 0;
  const isPassed = Boolean(result.passed ?? (finalScore >= 24.0));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header Ribbon */}
        <div
          className={`p-6 text-white text-center relative ${
            isPassed
              ? 'bg-gradient-to-b from-teal-700 to-teal-900'
              : 'bg-gradient-to-b from-slate-800 to-slate-900'
          }`}
        >
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md mb-2 shadow-inner">
            {isPassed ? (
              <Trophy className="w-8 h-8 text-amber-300" />
            ) : (
              <Award className="w-8 h-8 text-slate-300" />
            )}
          </div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-teal-200">
            Residency MD Paediatrics Nov-26
          </h2>
          <h1 className="text-2xl font-black tracking-tight text-white mt-1">
            {isPassed ? 'অভিনন্দন! (Congratulations)' : 'পরীক্ষা সম্পন্ন হয়েছে (Exam Completed)'}
          </h1>
          <p className="text-xs text-teal-100 max-w-md mx-auto mt-0.5">
            {result.userName || 'Dr. Candidate'} · {result.userInstitute || 'CPR Medical Academy'}
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Main Final Result Block */}
          <div className="bg-teal-50/70 rounded-2xl p-5 border border-teal-200 text-center space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-widest text-teal-800 block">
              FINAL COMPUTED SCORE · চূড়ান্ত ফলাফল
            </span>
            <div className="flex items-baseline justify-center gap-1.5">
              <span className="text-4xl font-black text-teal-900 font-mono">
                {finalScore.toFixed(2)}
              </span>
              <span className="text-sm font-bold text-teal-700 font-mono">/ {maxMarks.toFixed(1)} Marks</span>
            </div>
            <div className="flex items-center justify-center gap-3 pt-1 text-xs">
              <span className="font-mono font-bold text-slate-700">
                Accuracy: {percentage.toFixed(1)}%
              </span>
              <span>·</span>
              <span
                className={`font-bold ${
                  isPassed ? 'text-emerald-700' : 'text-rose-700'
                }`}
              >
                {isPassed ? 'QUALIFIED (≥24.0)' : 'NEEDS REVISION (<24.0)'}
              </span>
            </div>
          </div>

          {/* Exact Required Bengali Scoring Formula Breakdown */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider pb-1 border-b border-slate-200">
              <Calculator className="w-4 h-4 text-teal-600" />
              <span>রেজাল্ট তৈরির নিয়ম অনুযায়ী হিসাব (Official CPR Formula):</span>
            </div>

            <div className="space-y-2 text-xs text-slate-700 font-mono">
              {/* Step 1: 175 - ভুল MCQ */}
              <div className="flex items-start justify-between gap-2 p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-900 block font-sans text-xs">
                    ১. ১৭৫ - ভুল MCQ (True/False):
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    175 - {rawMcqWrong} (ভুল MCQ সংখ্যা)
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-teal-800 text-sm">
                    = {step1Result}
                  </span>
                  <span className="text-[10px] text-slate-400 block font-sans">সঠিক স্টেম</span>
                </div>
              </div>

              {/* Step 2: প্রাপ্ত ফলাফল × 0.2 */}
              <div className="flex items-start justify-between gap-2 p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-900 block font-sans text-xs">
                    ২. প্রাপ্ত ফলাফল × ০.২:
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {step1Result} × 0.2
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-teal-800 text-sm">
                    = {step2Result.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-slate-400 block font-sans">MCQ নম্বর</span>
                </div>
              </div>

              {/* Step 3: প্রাপ্ত ফলাফল + সঠিক SBA */}
              <div className="flex items-start justify-between gap-2 p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-900 block font-sans text-xs">
                    ৩. প্রাপ্ত ফলাফল + সঠিক SBA:
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {step2Result.toFixed(2)} + {rawSbaCorrect} (সঠিক SBA)
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-emerald-700 text-sm">
                    = {step3Result.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-slate-400 block font-sans">মোট যোগফল</span>
                </div>
              </div>

              {/* Step 4: প্রাপ্ত ফলাফল - (ভুল MCQ সংখ্যা × 0.05) */}
              <div className="flex items-start justify-between gap-2 p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-900 block font-sans text-xs">
                    ৪. প্রাপ্ত ফলাফল - (ভুল MCQ সংখ্যা × ০.০৫):
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    বিয়োগ ({rawMcqWrong} × 0.05)
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-rose-600 text-sm">
                    - {negativeDeduction.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-rose-400 block font-sans">নেগেটিভ মার্কিং</span>
                </div>
              </div>

              {/* Step 5: প্রাপ্ত ফলাফলই সর্বশেষ রেজাল্ট */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-teal-50 border border-teal-300 font-bold text-teal-950 shadow-2xs">
                <div className="space-y-0.5 font-sans">
                  <span className="text-xs text-teal-900 font-bold block">
                    ৫. প্রাপ্ত ফলাফলই সর্বশেষ রেজাল্ট:
                  </span>
                  <span className="text-[11px] text-teal-700 font-medium">
                    = চূড়ান্ত পরীক্ষার ফলাফল (সর্বোচ্চ ৪০.০)
                  </span>
                </div>
                <div className="text-right font-mono">
                  <span className="text-xl text-teal-950 font-black">
                    {finalScore.toFixed(2)}
                  </span>
                  <span className="text-xs text-teal-700 font-medium"> / 40.0</span>
                </div>
              </div>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="space-y-2.5 pt-1 border-t border-slate-100">
            <button
              onClick={onOpenShareModal}
              className="w-full py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Result & Certificate Card</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onReviewExam}
                className="py-2.5 px-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Eye className="w-4 h-4 text-teal-600" />
                <span>Review Answers</span>
              </button>

              <button
                onClick={onViewLeaderboard}
                className="py-2.5 px-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>Leaderboard</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onGoToDashboard}
                className="py-2.5 px-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <LayoutDashboard className="w-4 h-4 text-slate-600" />
                <span>Candidate Dashboard</span>
              </button>

              <button
                onClick={onRetakeExam}
                className="py-2.5 px-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
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
