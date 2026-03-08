/**
 * Services Index - Export all services
 */
export { apiClient, ApiError } from './api';
export { authService } from './authService';
export { userService } from './userService';
export { sessionService } from './sessionService';
export { textService } from './textService';
export { leaderboardService } from './leaderboardService';
export { achievementService } from './achievementService';
export { friendService } from './friendService';
export { settingsService } from './settingsService';
export { progressionService } from './progressionService';
export { getRandomQuote, initQuoteService } from './quoteService';
export { privateSessionService, PrivateSessionWebSocket } from './privateSessionService';
export type { UserSettings } from './settingsService';
export type { PrivateSession, CreateSessionOptions, WebSocketMessage } from './privateSessionService';
