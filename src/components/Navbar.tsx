import React from 'react';
import { UserProfile } from '../utils/storage';
import { Award, BookOpen, Clock, LayoutDashboard, Stethoscope, Trophy, User } from 'lucide-react';

interface NavbarProps {
  activeTab: 'quiz' | 'dashboard' | 'leaderboard' | 'study';
  setActiveTab: (tab: 'quiz' | 'dashboard' | 'leaderboard' | 'study') => void;
  userProfile: UserProfile;
  onEditProfile: () => void;
  isExamInProgress?: boolean;
  timeRemaining?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  userProfile,
  onEditProfile,
  isExamInProgress,
  timeRemaining,
}) => {
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Wordmark with clinical insignia */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('quiz')}
              className="flex items-center gap-2.5 text-left group focus:outline-hidden"
            >
              <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-sm group-hover:bg-teal-700 transition-colors">
                <Stethoscope className="w-5 h-5 text-teal-50" />
              </div>
              <div>
                <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 block leading-tight">
                  CPR MEDICAL ACADEMY
                </span>
                <span className="text-xs text-slate-500 font-medium block">
                  Residency MD Paediatrics · Nov-26
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('quiz')}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg transition-colors ${
                activeTab === 'quiz'
                  ? 'bg-teal-50 text-teal-800'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Award className="w-4 h-4 text-teal-600" />
              <span>Quiz Exam</span>
              {isExamInProgress && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse ml-1" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-teal-50 text-teal-800'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-teal-600" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg transition-colors ${
                activeTab === 'leaderboard'
                  ? 'bg-teal-50 text-teal-800'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Leaderboard</span>
            </button>

            <button
              onClick={() => setActiveTab('study')}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg transition-colors ${
                activeTab === 'study'
                  ? 'bg-teal-50 text-teal-800'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BookOpen className="w-4 h-4 text-teal-600" />
              <span>Official Key</span>
            </button>
          </nav>

          {/* Zone 3: Actions & Active Candidate */}
          <div className="flex items-center gap-3">
            {isExamInProgress && timeRemaining !== undefined && (
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 font-mono text-xs sm:text-sm font-bold">
                <Clock className="w-4 h-4 text-amber-600 animate-spin-slow" />
                <span>{formatTime(timeRemaining)}</span>
              </div>
            )}

            <button
              onClick={onEditProfile}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg border border-slate-200 hover:border-teal-300 hover:bg-slate-50 transition-colors text-left"
              title="Click to edit candidate name & institute"
            >
              <div className="w-7 h-7 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs">
                <User className="w-3.5 h-3.5" />
              </div>
              <div className="hidden sm:block text-left">
                <span className="text-xs font-bold text-slate-800 block truncate max-w-[120px]">
                  {userProfile.name}
                </span>
                <span className="text-[10px] text-slate-500 block truncate max-w-[120px]">
                  {userProfile.institute}
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-100">
          <button
            onClick={() => setActiveTab('quiz')}
            className={`flex flex-col items-center gap-1 py-1 text-xs font-semibold ${
              activeTab === 'quiz' ? 'text-teal-700' : 'text-slate-500'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Quiz</span>
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center gap-1 py-1 text-xs font-semibold ${
              activeTab === 'dashboard' ? 'text-teal-700' : 'text-slate-500'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`flex flex-col items-center gap-1 py-1 text-xs font-semibold ${
              activeTab === 'leaderboard' ? 'text-teal-700' : 'text-slate-500'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Merit</span>
          </button>
          <button
            onClick={() => setActiveTab('study')}
            className={`flex flex-col items-center gap-1 py-1 text-xs font-semibold ${
              activeTab === 'study' ? 'text-teal-700' : 'text-slate-500'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Key</span>
          </button>
        </div>
      </div>
    </header>
  );
};
