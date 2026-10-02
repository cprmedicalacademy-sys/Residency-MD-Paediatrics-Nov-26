import { ExamResult, LeaderboardEntry, Topic } from '../types/quiz';

const USER_PROFILE_KEY = 'cpr_quiz_user_profile';
const EXAM_HISTORY_KEY = 'cpr_quiz_exam_history';
const LEADERBOARD_KEY = 'cpr_quiz_leaderboard';

export interface UserProfile {
  name: string;
  institute: string;
  candidateId: string;
  avatarSeed?: string;
}

const DEFAULT_PROFILE: UserProfile = {
  name: 'Dr. Candidate',
  institute: 'CPR Medical Academy',
  candidateId: 'CPR-MD-2601',
};

// Seed leaderboard calculated strictly with the CPR Residency Formula:
// 1. 175 - ভুল MCQ
// 2. ফলাফল × 0.2
// 3. ফলাফল + সঠিক SBA
// 4. ফলাফল - (ভুল MCQ × 0.05)
// 5. ফলাফল = সর্বশেষ রেজাল্ট (Max marks: 40.0)
const SEED_LEADERBOARD: LeaderboardEntry[] = [
  {
    id: 'seed-1',
    name: 'Dr. Nusrat Jahan',
    institute: 'Dhaka Medical College',
    finalScore: 38.75,
    maxScore: 40.0,
    percentage: 96.9,
    mcqCorrect: 170,
    mcqWrong: 5,
    sbaCorrect: 5,
    timeTaken: '28m 42s',
    date: 'Today',
    badge: '1st Merit - Gold',
  },
  {
    id: 'seed-2',
    name: 'Dr. Tanvir Rahman',
    institute: 'Sir Salimullah Medical College',
    finalScore: 37.75,
    maxScore: 40.0,
    percentage: 94.4,
    mcqCorrect: 166,
    mcqWrong: 9,
    sbaCorrect: 5,
    timeTaken: '31m 15s',
    date: 'Today',
    badge: '2nd Merit - Silver',
  },
  {
    id: 'seed-3',
    name: 'Dr. Farhana Akter',
    institute: 'Chittagong Medical College',
    finalScore: 36.00,
    maxScore: 40.0,
    percentage: 90.0,
    mcqCorrect: 163,
    mcqWrong: 12,
    sbaCorrect: 4,
    timeTaken: '34m 02s',
    date: 'Yesterday',
    badge: '3rd Merit - Bronze',
  },
  {
    id: 'seed-4',
    name: 'Dr. Mahmudul Hasan',
    institute: 'Mymensingh Medical College',
    finalScore: 35.00,
    maxScore: 40.0,
    percentage: 87.5,
    mcqCorrect: 159,
    mcqWrong: 16,
    sbaCorrect: 4,
    timeTaken: '32m 45s',
    date: 'Yesterday',
    badge: 'Honours',
  },
  {
    id: 'seed-5',
    name: 'Dr. Sabrina Yesmin',
    institute: 'CPR Medical Academy',
    finalScore: 34.00,
    maxScore: 40.0,
    percentage: 85.0,
    mcqCorrect: 155,
    mcqWrong: 20,
    sbaCorrect: 4,
    timeTaken: '36m 10s',
    date: '2 days ago',
    badge: 'Honours',
  },
  {
    id: 'seed-6',
    name: 'Dr. Shahriar Kabir',
    institute: 'Rajshahi Medical College',
    finalScore: 31.50,
    maxScore: 40.0,
    percentage: 78.8,
    mcqCorrect: 149,
    mcqWrong: 26,
    sbaCorrect: 3,
    timeTaken: '38m 20s',
    date: '2 days ago',
    badge: 'Passed',
  },
  {
    id: 'seed-7',
    name: 'Dr. Ananya Roy',
    institute: 'Sylhet MAG Osmani Medical College',
    finalScore: 30.00,
    maxScore: 40.0,
    percentage: 75.0,
    mcqCorrect: 143,
    mcqWrong: 32,
    sbaCorrect: 3,
    timeTaken: '40m 18s',
    date: '3 days ago',
    badge: 'Passed',
  },
  {
    id: 'seed-8',
    name: 'Dr. Imtiaz Ahmed',
    institute: 'Rangpur Medical College',
    finalScore: 27.00,
    maxScore: 40.0,
    percentage: 67.5,
    mcqCorrect: 135,
    mcqWrong: 40,
    sbaCorrect: 2,
    timeTaken: '41m 55s',
    date: '3 days ago',
    badge: 'Passed',
  },
];

export const getStoredUserProfile = (): UserProfile => {
  try {
    const raw = localStorage.getItem(USER_PROFILE_KEY);
    if (!raw) return DEFAULT_PROFILE;
    const parsed = JSON.parse(raw);
    return {
      name: parsed.name || DEFAULT_PROFILE.name,
      institute: parsed.institute || DEFAULT_PROFILE.institute,
      candidateId: parsed.candidateId || DEFAULT_PROFILE.candidateId,
      avatarSeed: parsed.avatarSeed,
    };
  } catch {
    return DEFAULT_PROFILE;
  }
};

export const saveStoredUserProfile = (profile: UserProfile): void => {
  try {
    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save profile', e);
  }
};

export const getStoredExamHistory = (): ExamResult[] => {
  try {
    const raw = localStorage.getItem(EXAM_HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.map((res: any, idx: number): ExamResult => {
      // Reconstruct formula safely
      const rawMcqWrong = Number(res.formula?.mcqWrong ?? res.mcqWrong ?? 12) || 0;
      const rawMcqCorrect = Number(res.formula?.mcqCorrect ?? (175 - rawMcqWrong)) || 0;
      const rawSbaCorrect = Number(res.formula?.sbaCorrect ?? res.sbaCorrect ?? 4) || 0;
      const rawSbaWrong = Number(res.formula?.sbaWrong ?? (5 - rawSbaCorrect)) || 0;

      const step1Result = Number(res.formula?.step1Result ?? (175 - rawMcqWrong)) || 0;
      const step2Result = Number(res.formula?.step2Result ?? (step1Result * 0.2)) || 0;
      const step3Result = Number(res.formula?.step3Result ?? (step2Result + rawSbaCorrect)) || 0;
      const negativeDeduction = Number(res.formula?.negativeDeduction ?? (rawMcqWrong * 0.05)) || 0;
      const computedFinal = Number((step3Result - negativeDeduction).toFixed(2));

      const finalScore = Number(res.formula?.finalScore ?? res.scoreMarks ?? computedFinal) || 0;
      const maxMarks = 40.0;
      const percentage = Number(res.percentage ?? ((finalScore / maxMarks) * 100)) || 0;

      const formula = {
        totalMCQStems: 175,
        mcqWrong: rawMcqWrong,
        step1Result,
        step2Result: Number(step2Result.toFixed(2)),
        sbaCorrect: rawSbaCorrect,
        step3Result: Number(step3Result.toFixed(2)),
        negativeDeduction: Number(negativeDeduction.toFixed(2)),
        finalScore: Number(finalScore.toFixed(2)),
        maxMarks: 40.0,
        mcqCorrect: rawMcqCorrect,
        mcqUnattempted: Number(res.formula?.mcqUnattempted ?? 0) || 0,
        sbaWrong: rawSbaWrong,
        sbaUnattempted: Number(res.formula?.sbaUnattempted ?? 0) || 0,
        mcqIntermediateScore: Number(step2Result.toFixed(2)),
      };

      const defaultTopic = { correct: 0, wrong: 0, total: 0, percentage: 0 };
      const safeBreakdown: Record<Topic, { correct: number; wrong: number; total: number; percentage: number }> = {
        Neurology: {
          correct: Number(res.topicBreakdown?.Neurology?.correct ?? 0) || 0,
          wrong: Number(res.topicBreakdown?.Neurology?.wrong ?? 0) || 0,
          total: Number(res.topicBreakdown?.Neurology?.total ?? 0) || 0,
          percentage: Number(res.topicBreakdown?.Neurology?.percentage ?? 0) || 0,
        },
        Endocrinology: {
          correct: Number(res.topicBreakdown?.Endocrinology?.correct ?? 0) || 0,
          wrong: Number(res.topicBreakdown?.Endocrinology?.wrong ?? 0) || 0,
          total: Number(res.topicBreakdown?.Endocrinology?.total ?? 0) || 0,
          percentage: Number(res.topicBreakdown?.Endocrinology?.percentage ?? 0) || 0,
        },
        Rheumatology: {
          correct: Number(res.topicBreakdown?.Rheumatology?.correct ?? 0) || 0,
          wrong: Number(res.topicBreakdown?.Rheumatology?.wrong ?? 0) || 0,
          total: Number(res.topicBreakdown?.Rheumatology?.total ?? 0) || 0,
          percentage: Number(res.topicBreakdown?.Rheumatology?.percentage ?? 0) || 0,
        },
        'Emergency & General': {
          correct: Number(res.topicBreakdown?.['Emergency & General']?.correct ?? 0) || 0,
          wrong: Number(res.topicBreakdown?.['Emergency & General']?.wrong ?? 0) || 0,
          total: Number(res.topicBreakdown?.['Emergency & General']?.total ?? 0) || 0,
          percentage: Number(res.topicBreakdown?.['Emergency & General']?.percentage ?? 0) || 0,
        },
      };

      return {
        id: res.id || `exam-${idx}`,
        userName: res.userName || 'Dr. Candidate',
        userInstitute: res.userInstitute || 'CPR Medical Academy',
        date: res.date || 'Recent',
        timestamp: Number(res.timestamp) || Date.now(),
        examMode: res.examMode === 'practice' ? 'practice' : 'exam',
        formula,
        scoreMarks: finalScore,
        totalMarks: 40.0,
        percentage: Number(percentage.toFixed(1)),
        timeSpentSeconds: Number(res.timeSpentSeconds) || 1200,
        topicBreakdown: safeBreakdown,
        passed: typeof res.passed === 'boolean' ? res.passed : finalScore >= 24.0,
        userAnswers: res.userAnswers,
      };
    });
  } catch {
    return [];
  }
};

export const getStoredLeaderboard = (): LeaderboardEntry[] => {
  try {
    const raw = localStorage.getItem(LEADERBOARD_KEY);
    if (!raw) {
      localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(SEED_LEADERBOARD));
      return SEED_LEADERBOARD;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Normalize any older or legacy items to ensure finalScore and all fields are valid numbers
      const normalized: LeaderboardEntry[] = parsed.map((item: any, idx: number) => {
        const finalScore = Number(
          typeof item.finalScore === 'number'
            ? item.finalScore
            : typeof item.score === 'number' && typeof item.total === 'number' && item.total > 0
            ? (item.score / item.total) * 40
            : 30.0
        ) || 0;

        const maxScore = 40.0;
        const percentage = Number(
          typeof item.percentage === 'number' ? item.percentage : (finalScore / maxScore) * 100
        ) || 0;

        return {
          id: item.id || `entry-${idx}`,
          name: item.name || 'Dr. Candidate',
          institute: item.institute || 'CPR Medical Academy',
          finalScore: Number(finalScore.toFixed(2)),
          maxScore: 40.0,
          percentage: Number(percentage.toFixed(1)),
          mcqCorrect: Number(item.mcqCorrect ?? 150) || 0,
          mcqWrong: Number(item.mcqWrong ?? 15) || 0,
          sbaCorrect: Number(item.sbaCorrect ?? 4) || 0,
          timeTaken: item.timeTaken || '35m 00s',
          date: item.date || 'Recent',
          isCurrentUser: Boolean(item.isCurrentUser),
          badge: item.badge || (finalScore >= 24.0 ? 'Passed' : 'Needs Revision'),
        };
      });

      normalized.sort((a, b) => b.finalScore - a.finalScore);
      return normalized;
    }
    return SEED_LEADERBOARD;
  } catch {
    return SEED_LEADERBOARD;
  }
};

export const resetLeaderboardToDefault = (): LeaderboardEntry[] => {
  localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(SEED_LEADERBOARD));
  return SEED_LEADERBOARD;
};

export const saveExamResult = (result: ExamResult): void => {
  try {
    const history = getStoredExamHistory();
    history.unshift(result);
    localStorage.setItem(EXAM_HISTORY_KEY, JSON.stringify(history.slice(0, 50)));

    // Update leaderboard with player's calculated score
    const leaderboard = getStoredLeaderboard();
    const existingIndex = leaderboard.findIndex((item) => item.isCurrentUser);

    const minutes = Math.floor((result.timeSpentSeconds || 0) / 60);
    const seconds = (result.timeSpentSeconds || 0) % 60;
    const timeFormatted = `${minutes}m ${seconds.toString().padStart(2, '0')}s`;

    let badge = 'Passed';
    const finalScore = Number(result.formula?.finalScore ?? result.scoreMarks ?? 0) || 0;
    const percentage = Number(result.percentage ?? ((finalScore / 40.0) * 100)) || 0;

    if (percentage >= 85) badge = 'Honours with Distinction';
    else if (percentage >= 70) badge = 'Honours';
    else if (percentage < 60) badge = 'Needs Revision';

    const newEntry: LeaderboardEntry = {
      id: result.id,
      name: result.userName || 'Dr. Candidate',
      institute: result.userInstitute || 'CPR Medical Academy',
      finalScore: Number(finalScore.toFixed(2)),
      maxScore: 40.0,
      percentage: Number(percentage.toFixed(1)),
      mcqCorrect: Number(result.formula?.mcqCorrect ?? 0) || 0,
      mcqWrong: Number(result.formula?.mcqWrong ?? 0) || 0,
      sbaCorrect: Number(result.formula?.sbaCorrect ?? 0) || 0,
      timeTaken: timeFormatted,
      date: 'Just now',
      isCurrentUser: true,
      badge,
    };

    if (existingIndex >= 0) {
      if (newEntry.finalScore >= leaderboard[existingIndex].finalScore) {
        leaderboard[existingIndex] = newEntry;
      }
    } else {
      leaderboard.push(newEntry);
    }

    leaderboard.sort((a, b) => {
      if (b.finalScore !== a.finalScore) return b.finalScore - a.finalScore;
      return b.percentage - a.percentage;
    });

    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(leaderboard));
  } catch (e) {
    console.error('Failed to save exam result', e);
  }
};
