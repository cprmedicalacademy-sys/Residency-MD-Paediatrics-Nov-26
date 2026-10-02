import React, { useState } from 'react';
import { ExamResult, LeaderboardEntry } from '../types/quiz';
import { UserProfile } from '../utils/storage';
import {
  Activity,
  Award,
  Calculator,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Edit3,
  Flame,
  GraduationCap,
  Play,
  Share2,
  Sparkles,
  Target,
  Trophy,
  User,
} from 'lucide-react';

interface DashboardProps {
  userProfile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  examHistory: ExamResult[];
  leaderboard: LeaderboardEntry[];
  onStartExam: (mode?: 'exam' | 'practice') => void;
  onReviewExam: (result: ExamResult) => void;
  onShareResult: (result: ExamResult) => void;
  onViewLeaderboard: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  userProfile,
  onUpdateProfile,
  examHistory,
  leaderboard,
  onStartExam,
  onReviewExam,
  onShareResult,
  onViewLeaderboard,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(userProfile.name);
  const [tempInstitute, setTempInstitute] = useState(userProfile.institute);

  const handleSaveInline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempName.trim()) return;
    onUpdateProfile({
      ...userProfile,
      name: tempName.trim(),
      institute: tempInstitute.trim() || 'CPR Medical Academy',
    });
    setIsEditingName(false);
  };

  // Find user standing on Leaderboard
  const userRankIdx = leaderboard.findIndex(
    (e) => e.isCurrentUser || e.name.toLowerCase() === userProfile.name.toLowerCase()
  );
  const userRank = userRankIdx >= 0 ? userRankIdx + 1 : null;

  // Latest and best results
  const latestResult = examHistory[0];
  const bestResult = examHistory.reduce<ExamResult | null>((best, curr) => {
    if (!best || curr.formula.finalScore > best.formula.finalScore) return curr;
    return best;
  }, null);

  // Aggregate Subject Statistics across attempts
  const subjects = ['Neurology', 'Endocrinology', 'Rheumatology', 'Emergency & General'] as const;
  const subjectAggregates = subjects.map((sub) => {
    let totalQuestions = 0;
    let totalCorrect = 0;
    examHistory.forEach((ex) => {
      const breakdown = ex.topicBreakdown[sub as keyof typeof ex.topicBreakdown];
      if (breakdown) {
        totalQuestions += breakdown.total;
        totalCorrect += breakdown.correct;
      }
    });
    const pct = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;
    return {
      name: sub,
      totalCorrect,
      totalQuestions,
      percentage: pct,
    };
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-150">
      {/* Profile & Hero Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 text-white flex items-center justify-center text-2xl font-bold shadow-md shrink-0">
              {userProfile.name.replace('Dr. ', '').charAt(0) || 'D'}
            </div>

            <div className="space-y-1">
              {isEditingName ? (
                <form onSubmit={handleSaveInline} className="space-y-2 mt-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="text"
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      placeholder="Doctor Name"
                      className="px-3 py-1.5 border border-teal-500 rounded-lg text-base font-bold text-slate-900 bg-teal-50/30 focus:outline-hidden"
                      autoFocus
                    />
                    <input
                      type="text"
                      value={tempInstitute}
                      onChange={(e) => setTempInstitute(e.target.value)}
                      placeholder="Institute"
                      className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-700 focus:outline-hidden"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingName(false)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                      {userProfile.name}
                    </h1>
                    <button
                      onClick={() => {
                        setTempName(userProfile.name);
                        setTempInstitute(userProfile.institute);
                        setIsEditingName(true);
                      }}
                      className="p-1 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-md transition-colors"
                      title="Edit candidate name & institute"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm text-slate-600 font-medium">
                    {userProfile.institute} · ID:{' '}
                    <span className="font-mono text-xs text-slate-500">{userProfile.candidateId}</span>
                  </p>
                  <div className="flex items-center gap-3 pt-1 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1 font-semibold text-teal-700">
                      <GraduationCap className="w-3.5 h-3.5" /> MD Paediatrics Faculty Nov-26
                    </span>
                    <span>·</span>
                    <span>Standard CPR Formula Grading</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Practice Mode vs Exam Mode Entry Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            <button
              onClick={() => onStartExam('exam')}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-sm transition-colors whitespace-nowrap"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start Exam Mode</span>
            </button>
            <button
              onClick={() => onStartExam('practice')}
              className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl border border-slate-300 hover:border-teal-400 hover:bg-teal-50/50 text-slate-700 text-sm font-semibold transition-colors whitespace-nowrap"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Practice Mode</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Leaderboard Standing */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Faculty Standing</span>
            <Trophy className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 font-mono">
              {userRank ? `#${userRank}` : '—'}
            </span>
            <span className="text-xs text-slate-500">
              of {leaderboard.length} Candidates
            </span>
          </div>
          <button
            onClick={onViewLeaderboard}
            className="text-[11px] text-teal-700 hover:text-teal-900 mt-2 font-bold block"
          >
            View Leaderboard &rarr;
          </button>
        </div>

        {/* Card 2: Highest Final Score */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Best Final Score</span>
            <Flame className="w-4 h-4 text-rose-500" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-slate-900 font-mono">
              {bestResult ? bestResult.formula.finalScore.toFixed(2) : '0.00'}
            </span>
            <span className="text-xs text-slate-500 font-mono">/ 40.0</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            {bestResult && bestResult.passed ? 'Qualified (Pass ≥ 24.0)' : 'Passing score: 24.0 Marks'}
          </p>
        </div>

        {/* Card 3: Total Attempts */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Completed Tests</span>
            <Activity className="w-4 h-4 text-teal-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 font-mono">
              {examHistory.length}
            </span>
            <span className="text-xs text-slate-500">sessions</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 font-medium">
            {examHistory.length > 0 ? 'Formula logs preserved' : 'Start your first attempt'}
          </p>
        </div>

        {/* Card 4: Latest Result */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Latest Status</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 font-mono">
              {latestResult ? (latestResult.passed ? 'PASSED' : 'RETRY') : 'PENDING'}
            </span>
            {latestResult && (
              <span className="text-xs text-teal-700 font-bold font-mono">
                {latestResult.formula.finalScore.toFixed(2)}/40
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            {latestResult ? latestResult.date : 'Awaiting first test'}
          </p>
        </div>
      </div>

      {/* Formula Guide Card */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-teal-950 text-white rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-teal-300 font-bold text-xs uppercase tracking-wider">
            <Calculator className="w-4 h-4 text-amber-400" />
            <span>Residency MD Paediatrics Scoring Rules</span>
          </div>
          <p className="text-xs text-slate-300 max-w-xl">
            1. MCQ (True/False): <span className="text-white font-mono">(Correct - Wrong) × 0.2</span>
            <br />
            2. Add correct SBA score: <span className="text-white font-mono">+ SBA Correct</span>
            <br />
            3. Negative Marking: <span className="text-rose-300 font-mono">- (Wrong MCQ × 0.05)</span>
          </p>
        </div>
        <button
          onClick={() => onStartExam('exam')}
          className="px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-xl text-xs font-bold transition-colors shrink-0"
        >
          Launch Timed Exam
        </button>
      </div>

      {/* Main Content Grid: Subject Mastery & High-Yield Review */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Subject Accuracy & Mastery
              </h2>
              <p className="text-xs text-slate-500">
                Performance across syllabus topics in Neurology, Endocrinology, and Rheumatology
              </p>
            </div>
            <span className="text-xs font-semibold text-teal-700">Residency Syllabus</span>
          </div>

          <div className="space-y-5">
            {subjectAggregates.map((sub) => {
              const displayPct = sub.totalQuestions > 0 ? sub.percentage : 0;
              return (
                <div key={sub.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">{sub.name}</span>
                    <span className="font-mono text-slate-600 font-semibold">
                      {sub.totalQuestions > 0
                        ? `${sub.totalCorrect} / ${sub.totalQuestions} (${displayPct.toFixed(1)}%)`
                        : 'Not attempted yet'}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        displayPct >= 80
                          ? 'bg-emerald-500'
                          : displayPct >= 60
                          ? 'bg-teal-500'
                          : displayPct > 0
                          ? 'bg-amber-500'
                          : 'bg-slate-200'
                      }`}
                      style={{ width: `${Math.max(displayPct, sub.totalQuestions > 0 ? 5 : 0)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Diagnostic Pearls */}
        <div className="bg-gradient-to-br from-slate-900 to-teal-950 text-white rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-teal-300">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider">Exam Board Pearls</h2>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
              <span className="font-bold text-teal-300 block">GBS vs Transverse Myelitis</span>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Transverse Myelitis has a distinct sensory level & early bladder retention. GBS has ascending paralysis with albuminocytological dissociation.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
              <span className="font-bold text-teal-300 block">CAH 21-Hydroxylase Deficiency</span>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Accounts for 80% cases. Presents with atypical genitalia, low cortisol, and high ACTH.
              </p>
            </div>
          </div>

          <button
            onClick={() => onStartExam('practice')}
            className="w-full py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Practice High-Yield Cases</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Previous Exam Attempts Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Exam History & Formula Logs
            </h2>
            <p className="text-xs text-slate-500">
              Computed final scores, negative marks, and answer key reviews
            </p>
          </div>
          {examHistory.length > 0 && (
            <span className="text-xs font-medium text-slate-500 font-mono">
              {examHistory.length} total attempts
            </span>
          )}
        </div>

        {examHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-y border-slate-200">
                  <th className="py-3 px-4">Date & Mode</th>
                  <th className="py-3 px-4 text-center">Final Computed Score</th>
                  <th className="py-3 px-4 text-center">Formula Breakdown</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {examHistory.map((res) => (
                  <tr key={res.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{res.date}</span>
                        </div>
                        <span className="text-[10px] uppercase font-bold text-teal-700 block">
                          {res.examMode === 'practice' ? 'Practice Mode' : 'Exam Mode (Timed)'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono">
                      <span className="text-base font-bold text-teal-800">
                        {res.formula.finalScore.toFixed(2)}
                      </span>
                      <span className="text-xs text-slate-400"> / {res.formula.maxMarks.toFixed(1)}</span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-xs text-slate-600">
                      <span>MCQ: {res.formula.mcqIntermediateScore.toFixed(2)}</span>
                      <span className="text-slate-400 mx-1">·</span>
                      <span>SBA: +{res.formula.sbaCorrect}</span>
                      <span className="text-slate-400 mx-1">·</span>
                      <span className="text-rose-600">Neg: -{res.formula.negativeDeduction.toFixed(2)}</span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          res.passed
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {res.passed ? 'PASSED' : 'RETRY'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => onReviewExam(res)}
                        className="text-xs font-semibold text-teal-700 hover:text-teal-900 px-2.5 py-1 rounded-md hover:bg-teal-50 transition-colors"
                      >
                        Review
                      </button>
                      <button
                        onClick={() => onShareResult(res)}
                        className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-2.5 py-1 rounded-md hover:bg-slate-100 transition-colors inline-flex items-center gap-1"
                      >
                        <Share2 className="w-3 h-3" />
                        <span>Share</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">No Exam Attempts Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Start your first Residency MD Paediatrics Mock Exam now to generate your score, certificate, and faculty rank.
            </p>
            <button
              onClick={() => onStartExam('exam')}
              className="mt-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 shadow-xs"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Begin Exam</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
