import React, { useEffect, useState } from 'react';
import { ExamResult, LeaderboardEntry } from './types/quiz';
import {
  UserProfile,
  getStoredExamHistory,
  getStoredLeaderboard,
  getStoredUserProfile,
  saveExamResult,
  saveStoredUserProfile,
} from './utils/storage';
import { Navbar } from './components/Navbar';
import { QuizExam } from './components/QuizExam';
import { Dashboard } from './components/Dashboard';
import { Leaderboard } from './components/Leaderboard';
import { StudyGuide } from './components/StudyGuide';
import { ProfileModal } from './components/ProfileModal';
import { ResultModal } from './components/ResultModal';
import { ShareModal } from './components/ShareModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<'quiz' | 'dashboard' | 'leaderboard' | 'study'>('quiz');
  const [userProfile, setUserProfile] = useState<UserProfile>(getStoredUserProfile());
  const [examHistory, setExamHistory] = useState<ExamResult[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  // Modals & Active Review State
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [activeResultModal, setActiveResultModal] = useState<ExamResult | null>(null);
  const [activeShareModalResult, setActiveShareModalResult] = useState<ExamResult | null>(null);
  const [reviewExamResult, setReviewExamResult] = useState<ExamResult | null>(null);

  // Exam session key and mode
  const [examSessionKey, setExamSessionKey] = useState<number>(Date.now());
  const [initialExamMode, setInitialExamMode] = useState<'exam' | 'practice'>('exam');

  // Load stored state on mount
  useEffect(() => {
    setUserProfile(getStoredUserProfile());
    setExamHistory(getStoredExamHistory());
    setLeaderboard(getStoredLeaderboard());
  }, []);

  const handleUpdateProfile = (profile: UserProfile) => {
    setUserProfile(profile);
    saveStoredUserProfile(profile);
    setLeaderboard(getStoredLeaderboard());
  };

  const handleFinishExam = (result: ExamResult) => {
    saveExamResult(result);
    setExamHistory(getStoredExamHistory());
    setLeaderboard(getStoredLeaderboard());
    setActiveResultModal(result);
  };

  const handleStartExam = (mode: 'exam' | 'practice' = 'exam') => {
    setInitialExamMode(mode);
    setReviewExamResult(null);
    setExamSessionKey(Date.now());
    setActiveTab('quiz');
  };

  const handleReviewExam = (result: ExamResult) => {
    setReviewExamResult(result);
    setActiveResultModal(null);
    setActiveTab('quiz');
  };

  const handleShareResult = (result: ExamResult) => {
    setActiveShareModalResult(result);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 selection:bg-teal-100 selection:text-teal-900">
      {/* Universal Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userProfile={userProfile}
        onEditProfile={() => setIsProfileModalOpen(true)}
      />

      {/* Main App Content */}
      <main className="flex-1 pb-16">
        {activeTab === 'quiz' && (
          <QuizExam
            key={examSessionKey}
            userProfile={userProfile}
            initialMode={initialExamMode}
            reviewExamResult={reviewExamResult}
            onFinishExam={handleFinishExam}
            onExitReview={() => {
              setReviewExamResult(null);
              setActiveTab('dashboard');
            }}
          />
        )}

        {activeTab === 'dashboard' && (
          <Dashboard
            userProfile={userProfile}
            onUpdateProfile={handleUpdateProfile}
            examHistory={examHistory}
            leaderboard={leaderboard}
            onStartExam={handleStartExam}
            onReviewExam={handleReviewExam}
            onShareResult={handleShareResult}
            onViewLeaderboard={() => setActiveTab('leaderboard')}
          />
        )}

        {activeTab === 'leaderboard' && (
          <Leaderboard
            entries={leaderboard}
            currentUserName={userProfile.name}
            onRefreshLeaderboard={() => setLeaderboard(getStoredLeaderboard())}
            onStartExam={() => handleStartExam('exam')}
          />
        )}

        {activeTab === 'study' && <StudyGuide />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">CPR MEDICAL ACADEMY</span>
            <span>·</span>
            <span>Residency MD Paediatrics Faculty Nov-26</span>
          </div>
          <div className="flex items-center gap-4 text-slate-500 font-mono text-[11px]">
            <span>Formula: [(Correct-Wrong)×0.2] + SBA - (Wrong×0.05)</span>
            <span>·</span>
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="hover:text-teal-700 font-semibold transition-colors font-sans text-xs"
            >
              Candidate: {userProfile.name}
            </button>
          </div>
        </div>
      </footer>

      {/* Profile Name & College Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentProfile={userProfile}
        onSaveProfile={handleUpdateProfile}
      />

      {/* Exam Result Celebration Modal with Exact Formula Steps */}
      <ResultModal
        isOpen={Boolean(activeResultModal)}
        onClose={() => setActiveResultModal(null)}
        result={activeResultModal}
        onReviewExam={() => {
          if (activeResultModal) handleReviewExam(activeResultModal);
        }}
        onOpenShareModal={() => {
          if (activeResultModal) {
            const res = activeResultModal;
            setActiveResultModal(null);
            setActiveShareModalResult(res);
          }
        }}
        onRetakeExam={() => {
          setActiveResultModal(null);
          handleStartExam('exam');
        }}
        onGoToDashboard={() => {
          setActiveResultModal(null);
          setActiveTab('dashboard');
        }}
        onViewLeaderboard={() => {
          setActiveResultModal(null);
          setActiveTab('leaderboard');
        }}
      />

      {/* Share & Certificate Modal */}
      <ShareModal
        isOpen={Boolean(activeShareModalResult)}
        onClose={() => setActiveShareModalResult(null)}
        result={activeShareModalResult}
      />
    </div>
  );
}
