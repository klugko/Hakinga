// User types
export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  createdAt: string;
  stats: UserStats;
}

export interface UserStats {
  avgWpm: number;
  avgAccuracy: number;
  bestWpm: number;
  totalSessions: number;
  totalTimeTyped: number; // in seconds
  totalCharactersTyped: number;
}

// Typing session types
export interface TypingText {
  id: string;
  content: string;
  difficulty: 'easy' | 'medium' | 'hard';
  length: 'short' | 'medium' | 'long';
  wordCount: number;
  category?: string;
}

export interface TypingSession {
  id: string;
  userId: string;
  textId: string;
  text: string;
  wpm: number;
  rawWpm: number;
  accuracy: number;
  errors: number;
  totalCharacters: number;
  correctCharacters: number;
  duration: number; // in seconds
  startedAt: string;
  completedAt: string;
  mode: 'solo' | 'private' | 'competition';
  wpmHistory: WpmDataPoint[];
}

export interface WpmDataPoint {
  time: number; // seconds from start
  wpm: number;
  accuracy: number;
}

// Character state for typing
export interface CharacterState {
  char: string;
  status: 'pending' | 'correct' | 'incorrect' | 'current';
}

// Session configuration
export interface SessionConfig {
  difficulty: 'easy' | 'medium' | 'hard';
  length: 'short' | 'medium' | 'long';
  mode: 'solo' | 'private' | 'competition';
}

// Private session types
export interface PrivateSession {
  id: string;
  code: string;
  hostId: string;
  hostName: string;
  textId: string;
  text: TypingText;
  players: Player[];
  status: 'waiting' | 'countdown' | 'racing' | 'finished';
  maxPlayers: number;
  createdAt: string;
}

export interface Player {
  id: string;
  username: string;
  avatar?: string;
  isHost: boolean;
  isReady: boolean;
  progress: number; // 0-100
  wpm: number;
  accuracy: number;
  position?: number; // final position after race
  finishedAt?: string;
}

// Leaderboard types
export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatar?: string;
  wpm: number;
  accuracy: number;
  sessionsPlayed: number;
}

// Achievement types
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  progress?: number;
  maxProgress?: number;
}

// History filter
export interface HistoryFilter {
  mode?: 'all' | 'solo' | 'private' | 'competition';
  dateRange?: 'all' | 'today' | 'week' | 'month';
  sortBy: 'date' | 'wpm' | 'accuracy';
  sortOrder: 'asc' | 'desc';
}

// Toast notification
export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Statistics for dashboard
export interface DashboardStats {
  totalSessions: number;
  avgWpm: number;
  avgAccuracy: number;
  bestWpm: number;
  totalTimeTyped: number;
  improvementPercent: number;
  recentSessions: TypingSession[];
  wpmTrend: WpmDataPoint[];
}

// Friends
export interface Friend {
  id: string;
  username: string;
  avatar?: string;
  status: 'online' | 'offline' | 'in-game';
  lastSeen?: string;
  stats: {
    avgWpm: number;
    totalSessions: number;
  };
}

export interface FriendRequest {
  id: string;
  from: {
    id: string;
    username: string;
    avatar?: string;
  };
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

// Progression types
export interface XPBreakdown {
  baseXp: number;
  difficultyMultiplier: number;
  modeMultiplier: number;
  streakBonus: number;
  perfectAccuracyBonus: number;
  personalBestBonus: number;
  totalXp: number;
}

export interface LevelInfo {
  level: number;
  currentXp: number;
  xpForCurrentLevel: number;
  xpForNextLevel: number;
  progressPercent: number;
  xpNeeded: number;
}

export interface UserProgress {
  userId: string;
  totalXp: number;
  currentLevel: number;
  currentStreak: number;
  bestStreak: number;
  lastSessionDate?: string;
  rankTier: RankTier;
  mmr: number;
  levelInfo: LevelInfo;
}

export type RankTier =
  | 'unranked'
  | 'bronze'
  | 'silver'
  | 'gold'
  | 'platinum'
  | 'diamond'
  | 'master'
  | 'grandmaster';

export const RANK_COLORS: Record<RankTier, string> = {
  unranked: '#808080',
  bronze: '#CD7F32',
  silver: '#C0C0C0',
  gold: '#FFD700',
  platinum: '#00CED1',
  diamond: '#B9F2FF',
  master: '#9400D3',
  grandmaster: '#FF4500',
};

// Combo system types
export interface ComboState {
  current: number;
  max: number;
  tier: ComboTier;
  isActive: boolean;
}

export type ComboTier =
  | 'none'
  | 'nice'
  | 'great'
  | 'amazing'
  | 'incredible'
  | 'unstoppable'
  | 'legendary';

export interface ComboTierConfig {
  threshold: number;
  color: string;
  animation: string;
  label: string;
}

export const COMBO_TIERS: Record<ComboTier, ComboTierConfig> = {
  none: { threshold: 0, color: '#888888', animation: 'none', label: '' },
  nice: { threshold: 10, color: '#22C55E', animation: 'pulse', label: 'NICE!' },
  great: { threshold: 25, color: '#3B82F6', animation: 'bounce', label: 'GREAT!' },
  amazing: { threshold: 50, color: '#8B5CF6', animation: 'scale', label: 'AMAZING!' },
  incredible: { threshold: 100, color: '#F97316', animation: 'shake', label: 'INCREDIBLE!' },
  unstoppable: { threshold: 250, color: '#EF4444', animation: 'fire', label: 'UNSTOPPABLE!' },
  legendary: { threshold: 500, color: '#EC4899', animation: 'rainbow', label: 'LEGENDARY!' },
};

// Session with XP response
export interface SessionWithXP extends TypingSession {
  maxCombo: number;
  xpEarned: number;
  xpBreakdown?: XPBreakdown;
  levelInfo?: LevelInfo;
  leveledUp: boolean;
  newLevel?: number;
  newStreak: number;
}

// Sound types
export type SoundPack = 'mechanical' | 'soft' | 'typewriter' | 'none';

export interface SoundSettings {
  enabled: boolean;
  volume: number;
  pack: SoundPack;
  keyboardSounds: boolean;
  feedbackSounds: boolean;
  progressionSounds: boolean;
}

export type SoundEffect =
  | 'keyDown'
  | 'keyUp'
  | 'space'
  | 'enter'
  | 'error'
  | 'comboMilestone'
  | 'comboBreak'
  | 'perfectAccuracy'
  | 'sessionComplete'
  | 'newRecord'
  | 'xpGain'
  | 'levelUp'
  | 'achievementUnlock'
  | 'rankUp';
