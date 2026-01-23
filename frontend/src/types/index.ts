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
