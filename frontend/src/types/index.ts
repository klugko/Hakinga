export interface User {
  id: string;
  email: string;
  username: string;
  createdAt: string;
  emailVerified: boolean;
  themePreference?: ThemePreference;
  tutorialCompleted?: boolean;
}

export interface UserStats {
  userId: string;
  totalPoints: number;
  rank: number;
  totalRaces: number;
  wins: number;
  avgWpm: number;
  avgAccuracy: number;
  bestWpm: number;
  totalPracticeTime: number;
  totalSessions: number;
  skillLevel: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  username: string;
  password: string;
  passwordConfirmation: string;
}

export interface Session {
  id: string;
  userId: string;
  sessionType: SessionType;
  textId: string;
  wpm: number;
  accuracy: number;
  duration: number;
  errorsCount: number;
  completedAt: string;
  status: SessionStatus;
  difficulty: Difficulty;
  textCategory: TextCategory;
}

export interface SessionResult {
  wpm: number;
  accuracy: number;
  duration: number;
  errorsCount: number;
  correctChars: number;
  totalChars: number;
  wpmOverTime: WpmDataPoint[];
  errorsByChar: CharacterError[];
}

export interface WpmDataPoint {
  time: number;
  wpm: number;
}

export interface CharacterError {
  char: string;
  count: number;
  rate: number;
}

export interface Keystroke {
  sessionId: string;
  timestamp: number;
  keyPressed: string;
  expectedKey: string;
  isCorrect: boolean;
  positionInText: number;
  wordIndex: number;
  timeSinceLastKey: number;
  isBackspace: boolean;
  errorType: ErrorType | null;
}

export interface Text {
  id: string;
  content: string;
  difficulty: Difficulty;
  category: TextCategory;
  wordCount: number;
  language: string;
}

export interface PrivateSession {
  id: string;
  hostUserId: string;
  sessionCode: string;
  textId: string;
  maxParticipants: number;
  status: PrivateSessionStatus;
  participants: SessionParticipant[];
  createdAt: string;
}

export interface SessionParticipant {
  sessionId: string;
  userId: string;
  username: string;
  joinedAt: string;
  readyStatus: boolean;
  status: ParticipantStatus;
  progress?: number;
  wpm?: number;
}

export interface PublicSession {
  id: string;
  difficulty: Difficulty;
  textId: string;
  participants: SessionParticipant[];
  status: PublicSessionStatus;
  startedAt?: string;
}

export interface RaceResult {
  sessionId: string;
  userId: string;
  username: string;
  rank: number;
  wpm: number;
  accuracy: number;
  duration: number;
  pointsEarned: number;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  totalPoints: number;
  racesCount: number;
  avgWpm: number;
  isCurrentUser?: boolean;
}

export interface Friend {
  id: string;
  username: string;
  status: FriendStatus;
  createdAt: string;
}

export interface FriendRequest {
  id: string;
  requesterId: string;
  requesterUsername: string;
  receiverId: string;
  status: FriendRequestStatus;
  createdAt: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: string;
  unlockedAt?: string;
  progress?: number;
  maxProgress?: number;
}

export interface TypingProfile {
  userId: string;
  skillLevel: number;
  skillBadge: SkillBadge;
  avgWpm: number;
  avgAccuracy: number;
  consistencyScore: number;
  problematicChars: CharacterError[];
  difficultSequences: DifficultSequence[];
  errorBreakdown: ErrorBreakdown;
  wpmProgression: WpmDataPoint[];
  fingerStrengthScores: FingerStrengthScore[];
}

export interface DifficultSequence {
  sequence: string;
  avgTime: number;
  errorRate: number;
  type: 'bigram' | 'trigram';
}

export interface ErrorBreakdown {
  speed: number;
  cognitive: number;
  motor: number;
  fatigue: number;
}

export interface FingerStrengthScore {
  finger: string;
  hand: 'left' | 'right';
  score: number;
}

export interface Drill {
  id: string;
  userId: string;
  drillType: DrillType;
  content: string;
  targetChar?: string;
  targetSequence?: string;
  objective: string;
  createdAt: string;
}

export interface TrainingPlan {
  userId: string;
  weekStart: string;
  days: TrainingDay[];
  completedDays: number;
}

export interface TrainingDay {
  dayNumber: number;
  activities: TrainingActivity[];
  completed: boolean;
}

export interface TrainingActivity {
  type: 'drill' | 'solo' | 'competition';
  description: string;
  drillType?: DrillType;
  difficulty?: Difficulty;
  completed: boolean;
}

export interface DailyInsight {
  id: string;
  userId: string;
  text: string;
  type: InsightType;
  date: string;
  dismissed: boolean;
}

export interface WpmPrediction {
  userId: string;
  predictedWpm: number;
  confidenceInterval: number;
  predictionDate: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  content: string;
  read: boolean;
  createdAt: string;
}

export type SessionType = 'solo' | 'private' | 'public';
export type SessionStatus = 'in_progress' | 'completed' | 'abandoned';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type TextCategory = 'prose' | 'code' | 'technical' | 'quote';
export type TextLength = 'short' | 'medium' | 'long';
export type ErrorType = 'substitution' | 'insertion' | 'deletion';
export type PrivateSessionStatus = 'waiting' | 'countdown' | 'in_progress' | 'finished';
export type PublicSessionStatus = 'matchmaking' | 'countdown' | 'in_progress' | 'finished';
export type ParticipantStatus = 'joined' | 'ready' | 'racing' | 'finished' | 'abandoned';
export type FriendStatus = 'online' | 'offline' | 'in_game';
export type FriendRequestStatus = 'pending' | 'accepted' | 'rejected';
export type SkillBadge = 'beginner' | 'novice' | 'intermediate' | 'advanced' | 'expert';
export type DrillType = 'character' | 'bigram' | 'speed' | 'accuracy';
export type InsightType = 'improvement' | 'focus' | 'pattern' | 'warning';
export type NotificationType = 'friend_request' | 'challenge' | 'race_found' | 'achievement' | 'insight';
export type LeaderboardPeriod = 'all_time' | 'weekly' | 'monthly';
export type LeaderboardType = 'global' | 'friends';

export interface ThemePreference {
  scheme: ThemeScheme;
  accentColor: AccentColor;
}

export type ThemeScheme = 'midnight_blue' | 'deep_purple' | 'carbon_black' | 'forest_green';
export type AccentColor = 'indigo' | 'cyan' | 'emerald' | 'amber';

export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface WebSocketMessage {
  type: WebSocketEventType;
  payload: unknown;
}

export type WebSocketEventType =
  | 'player_joined'
  | 'player_ready'
  | 'player_left'
  | 'race_starting'
  | 'race_started'
  | 'player_progress'
  | 'player_finished'
  | 'race_ended'
  | 'notification';
