import { ExamResult, LeaderboardEntry } from '../types/quiz';

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
// Formula: (MCQ Correct - MCQ Wrong) * 0.2 + SBA Correct - (MCQ Wrong * 0.05)
// Max marks: 40.0 (35.0 MCQ + 5.0 SBA)
const SEED_LEADERBOARD: LeaderboardEntry[] = [
  {
    id: 'seed-1',
    name: 'Dr. Nusrat Jahan',
    institute: 'Dhaka Medical College',
    finalScore: 37.15, // 168 correct, 4 wrong (164*0.2 = 32.8) + 5 SBA - (4*0.05 = 0.20) = 37.60
    maxScore: 40.0,
    percentage: 92.9,
    mcqCorrect: 167,
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
    finalScore: 35.40,
    maxScore: 40.0,
    percentage: 88.5,
    mcqCorrect: 161,
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
    finalScore: 34.05,
    maxScore: 40.0,
    percentage: 85.1,
    mcqCorrect: 156,
    mcqWrong: 11,
    sbaCorrect: 4,
    timeTaken: '34m 02s',
    date: 'Yesterday',
    badge: '3rd Merit - Bronze',
  },
  {
    id: 'seed-4',
    name: 'Dr. Mahmudul Hasan',
    institute: 'Mymensingh Medical College',
    finalScore: 32.10,
    maxScore: 40.0,
    percentage: 80.3,
    mcqCorrect: 150,
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
    finalScore: 30.50,
    maxScore: 40.0,
    percentage: 76.3,
    mcqCorrect: 145,
    mcqWrong: 18,
    sbaCorrect: 4,
    timeTaken: '36m 10s',
    date: '2 days ago',
    badge: 'Honours',
  },
  {
    id: 'seed-6',
    name: 'Dr. Shahriar Kabir',
    institute: 'Rajshahi Medical College',
    finalScore: 28.65,
    maxScore: 40.0,
    percentage: 71.6,
    mcqCorrect: 140,
    mcqWrong: 22,
    sbaCorrect: 4,
    timeTaken: '38m 20s',
    date: '2 days ago',
    badge: 'Passed',
  },
  {
    id: 'seed-7',
    name: 'Dr. Ananya Roy',
    institute: 'Sylhet MAG Osmani Medical College',
    finalScore: 26.25,
    maxScore: 40.0,
    percentage: 65.6,
    mcqCorrect: 133,
    mcqWrong: 27,
    sbaCorrect: 3,
    timeTaken: '40m 18s',
    date: '3 days ago',
    badge: 'Passed',
  },
  {
    id: 'seed-8',
    name: 'Dr. Imtiaz Ahmed',
    institute: 'Rangpur Medical College',
    finalScore: 24.80,
    maxScore: 40.0,
    percentage: 62.0,
    mcqCorrect: 129,
    mcqWrong: 30,
    sbaCorrect: 3,
    timeTaken: '41m 55s',
    date: '3 days ago',
    badge: 'Passed',
  },
];

export const getStoredUserProfile = (): UserProfile => {
  try {
    const raw = localStorage.getItem(USER_PROFILE_KEY);
    if (!raw) return DEFAULT_PROFILE;
    return JSON.parse(raw);
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
    return JSON.parse(raw);
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
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : SEED_LEADERBOARD;
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

    const minutes = Math.floor(result.timeSpentSeconds / 60);
    const seconds = result.timeSpentSeconds % 60;
    const timeFormatted = `${minutes}m ${seconds.toString().padStart(2, '0')}s`;

    let badge = 'Passed';
    if (result.percentage >= 85) badge = 'Honours with Distinction';
    else if (result.percentage >= 70) badge = 'Honours';
    else if (result.percentage < 60) badge = 'Needs Revision';

    const newEntry: LeaderboardEntry = {
      id: result.id,
      name: result.userName,
      institute: result.userInstitute,
      finalScore: result.formula.finalScore,
      maxScore: result.formula.maxMarks,
      percentage: result.percentage,
      mcqCorrect: result.formula.mcqCorrect,
      mcqWrong: result.formula.mcqWrong,
      sbaCorrect: result.formula.sbaCorrect,
      timeTaken: timeFormatted,
      date: 'Just now',
      isCurrentUser: true,
      badge,
    };

    if (existingIndex >= 0) {
      // keep the higher score
      if (result.formula.finalScore >= leaderboard[existingIndex].finalScore) {
        leaderboard[existingIndex] = newEntry;
      }
    } else {
      leaderboard.push(newEntry);
    }

    // Sort descending by finalScore, then ascending by time
    leaderboard.sort((a, b) => {
      if (b.finalScore !== a.finalScore) return b.finalScore - a.finalScore;
      return b.percentage - a.percentage;
    });

    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(leaderboard));
  } catch (e) {
    console.error('Failed to save exam result', e);
  }
};
