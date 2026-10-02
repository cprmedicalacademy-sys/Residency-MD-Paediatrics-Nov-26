import React, { useState } from 'react';
import { LeaderboardEntry } from '../types/quiz';
import { Award, Calculator, Clock, Medal, RefreshCw, Search, Trophy, User, UserCheck } from 'lucide-react';
import { resetLeaderboardToDefault } from '../utils/storage';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentUserName: string;
  onRefreshLeaderboard: () => void;
  onStartExam: () => void;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
  entries,
  currentUserName,
  onRefreshLeaderboard,
  onStartExam,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'top'>('all');

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      (entry.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (entry.institute || '').toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (filterMode === 'top') {
      return (Number(entry.finalScore) || 0) >= 30.0;
    }
    return true;
  });

  const handleReset = () => {
    if (confirm('Reset leaderboard to official academy baseline?')) {
      resetLeaderboardToDefault();
      onRefreshLeaderboard();
    }
  };

  const currentUserRankIndex = entries.findIndex(
    (e) => e.isCurrentUser || (e.name || '').toLowerCase() === (currentUserName || '').toLowerCase()
  );
  const currentUserRank = currentUserRankIndex >= 0 ? currentUserRankIndex + 1 : null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-300">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Residency MD Paediatrics · Official Merit Board</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Faculty High Scores & Merit Standings
            </h1>
            <p className="text-slate-300 text-sm max-w-xl">
              অফিশিয়াল নিয়মে প্রস্তুতকৃত ফলাফল ও মেধাতালিকা (Official Formula):
              <span className="block font-mono text-xs text-amber-300 mt-1.5 bg-black/30 p-2.5 rounded-lg border border-white/10 leading-relaxed">
                ১. ১৭৫ - ভুল MCQ ➔ ২. প্রাপ্ত ফলাফল × ০.২ ➔ ৩. + সঠিক SBA ➔ ৪. - (ভুল MCQ × ০.০৫) ➔ ৫. সর্বশেষ রেজাল্ট
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {currentUserRank && (
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-3 text-center">
                <span className="text-xs text-slate-300 block font-medium">Your Standing</span>
                <span className="text-2xl font-black text-amber-300 block font-mono">
                  #{currentUserRank}
                </span>
                <span className="text-[10px] text-teal-200 uppercase tracking-wider">
                  of {entries.length} Candidates
                </span>
              </div>
            )}
            <button
              onClick={onStartExam}
              className="px-5 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm shadow-md transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Award className="w-4 h-4" />
              <span>Take Exam & Rank Up</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top 3 Podium Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {entries.slice(0, 3).map((entry, idx) => {
          const colors = [
            { bg: 'bg-amber-500/10 border-amber-300', text: 'text-amber-800', medal: 'text-amber-500', label: '1st Merit (Gold)' },
            { bg: 'bg-slate-200/50 border-slate-300', text: 'text-slate-800', medal: 'text-slate-400', label: '2nd Merit (Silver)' },
            { bg: 'bg-orange-500/10 border-orange-300', text: 'text-orange-800', medal: 'text-amber-700', label: '3rd Merit (Bronze)' },
          ][idx];

          const finalScore = Number(entry.finalScore) || 0;
          const percentage = Number(entry.percentage) || 0;

          return (
            <div
              key={entry.id}
              className={`rounded-2xl border p-5 relative overflow-hidden bg-white shadow-xs ${colors.bg}`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {colors.label}
                </span>
                <Medal className={`w-6 h-6 ${colors.medal}`} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 truncate">{entry.name}</h3>
              <p className="text-xs text-slate-500 truncate mb-4">{entry.institute}</p>

              <div className="flex items-end justify-between pt-3 border-t border-slate-100">
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">Final Computed Score</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-teal-800 font-mono">
                      {finalScore.toFixed(2)}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">/ 40.0</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-slate-700 font-mono block">
                    {percentage.toFixed(1)}%
                  </span>
                  <span className="text-[11px] text-emerald-700 font-medium">
                    SBA: {Number(entry.sbaCorrect) || 0}/5
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search candidate or medical college..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-teal-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                filterMode === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Candidates ({entries.length})
            </button>
            <button
              onClick={() => setFilterMode('top')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                filterMode === 'top'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Honours (≥30 Marks)
            </button>
          </div>

          <button
            onClick={handleReset}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            title="Reset default scores"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4 text-center w-16">Rank</th>
                <th className="py-3.5 px-4">Candidate & Institute</th>
                <th className="py-3.5 px-4 text-center">Final Computed Score</th>
                <th className="py-3.5 px-4 text-center">Formula Breakdown</th>
                <th className="py-3.5 px-4 text-center">Time Taken</th>
                <th className="py-3.5 px-4 text-right">Merit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredEntries.map((entry, index) => {
                const isUser =
                  entry.isCurrentUser ||
                  (entry.name || '').toLowerCase() === (currentUserName || '').toLowerCase();

                const finalScore = Number(entry.finalScore) || 0;

                return (
                  <tr
                    key={entry.id}
                    className={`transition-colors ${
                      isUser
                        ? 'bg-teal-50/80 font-medium'
                        : 'hover:bg-slate-50/80'
                    }`}
                  >
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center">
                        {index === 0 ? (
                          <span className="w-7 h-7 rounded-full bg-amber-100 text-amber-800 font-black text-xs flex items-center justify-center">
                            1
                          </span>
                        ) : index === 1 ? (
                          <span className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-black text-xs flex items-center justify-center">
                            2
                          </span>
                        ) : index === 2 ? (
                          <span className="w-7 h-7 rounded-full bg-amber-800/15 text-amber-900 font-black text-xs flex items-center justify-center">
                            3
                          </span>
                        ) : (
                          <span className="text-slate-500 font-mono text-xs font-semibold">
                            #{index + 1}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${
                            isUser
                              ? 'bg-teal-600 text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {isUser ? <UserCheck className="w-4 h-4" /> : <User className="w-4 h-4" />}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 truncate">
                              {entry.name}
                            </span>
                            {isUser && (
                              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                                You
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-500 truncate block">
                            {entry.institute}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-center">
                      <div className="inline-flex items-baseline gap-1">
                        <span className="font-mono font-bold text-lg text-teal-800 tabular-nums">
                          {finalScore.toFixed(2)}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">/ 40.0</span>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-center text-xs text-slate-600 font-mono">
                      <span>MCQ: {Number(entry.mcqCorrect) || 0}✓ {Number(entry.mcqWrong) || 0}✗</span>
                      <span className="text-slate-400 mx-1">·</span>
                      <span>SBA: {Number(entry.sbaCorrect) || 0}/5</span>
                    </td>

                    <td className="py-4 px-4 text-center text-xs text-slate-500 font-mono">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {entry.timeTaken || '—'}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-right">
                      <span
                        className={`text-xs font-semibold ${
                          finalScore >= 34.0
                            ? 'text-amber-700'
                            : finalScore >= 24.0
                            ? 'text-teal-700'
                            : 'text-slate-500'
                        }`}
                      >
                        {entry.badge || (finalScore >= 24.0 ? 'Passed' : 'Needs Revision')}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
