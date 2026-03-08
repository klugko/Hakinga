/**
 * Private Session Service for multiplayer typing races.
 */
import { apiClient } from './api';
import type { Player } from '@/types';

export interface PrivateSession {
  id: string;
  code: string;
  hostId: string;
  hostName: string;
  textId: string;
  textContent: string;
  textDifficulty: string;
  status: 'waiting' | 'countdown' | 'racing' | 'finished';
  maxPlayers: number;
  players: Player[];
  createdAt: string;
}

interface PrivateSessionResponse {
  id: string;
  code: string;
  host_id: string;
  host_name: string;
  text_id: string;
  text_content: string;
  text_difficulty: string;
  status: string;
  max_players: number;
  players: Array<{
    id: string;
    username: string;
    avatar: string | null;
    is_host: boolean;
    is_ready: boolean;
    progress: number;
    wpm: number;
    accuracy: number;
    position: number | null;
    finished_at: string | null;
  }>;
  created_at: string;
}

function mapSessionResponse(response: PrivateSessionResponse): PrivateSession {
  return {
    id: response.id,
    code: response.code,
    hostId: response.host_id,
    hostName: response.host_name,
    textId: response.text_id,
    textContent: response.text_content,
    textDifficulty: response.text_difficulty,
    status: response.status as PrivateSession['status'],
    maxPlayers: response.max_players,
    players: response.players.map((p) => ({
      id: p.id,
      username: p.username,
      avatar: p.avatar || undefined,
      isHost: p.is_host,
      isReady: p.is_ready,
      progress: p.progress,
      wpm: p.wpm,
      accuracy: p.accuracy,
      position: p.position || undefined,
      finishedAt: p.finished_at || undefined,
    })),
    createdAt: response.created_at,
  };
}

export interface CreateSessionOptions {
  difficulty?: 'easy' | 'medium' | 'hard';
  length?: 'short' | 'medium' | 'long';
  maxPlayers?: number;
}

export type WebSocketMessage =
  | { type: 'player_joined'; player: Player }
  | { type: 'player_left'; player_id: string }
  | { type: 'player_ready'; player_id: string; is_ready: boolean }
  | { type: 'race_starting'; countdown: number }
  | { type: 'race_started' }
  | { type: 'player_progress'; player_id: string; progress: number; wpm: number; accuracy: number }
  | { type: 'player_finished'; player_id: string; position: number; wpm: number; accuracy: number }
  | { type: 'race_ended'; results: Player[] };

export class PrivateSessionWebSocket {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: number | null = null;
  private messageHandlers: ((message: WebSocketMessage) => void)[] = [];
  private connectionHandlers: ((connected: boolean) => void)[] = [];
  private code: string;
  private token: string;

  constructor(code: string, token: string) {
    this.code = code;
    this.token = token;
  }

  connect(): void {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = import.meta.env.VITE_API_URL?.replace(/^https?:\/\//, '') || 'localhost:8000';
    const wsUrl = `${protocol}//${host}/api/v1/private-sessions/${this.code}/ws?token=${this.token}`;

    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      this.connectionHandlers.forEach((h) => h(true));
    };

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as WebSocketMessage;
        this.messageHandlers.forEach((h) => h(message));
      } catch (e) {
        console.error('Failed to parse WebSocket message:', e);
      }
    };

    this.ws.onclose = () => {
      this.connectionHandlers.forEach((h) => h(false));
      this.attemptReconnect();
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);

    this.reconnectTimeout = window.setTimeout(() => {
      this.connect();
    }, delay);
  }

  disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  sendProgress(progress: number, wpm: number, accuracy: number): void {
    this.send({ type: 'progress', progress, wpm, accuracy });
  }

  sendFinished(wpm: number, accuracy: number): void {
    this.send({ type: 'finished', wpm, accuracy });
  }

  private send(data: object): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  onMessage(handler: (message: WebSocketMessage) => void): () => void {
    this.messageHandlers.push(handler);
    return () => {
      this.messageHandlers = this.messageHandlers.filter((h) => h !== handler);
    };
  }

  onConnectionChange(handler: (connected: boolean) => void): () => void {
    this.connectionHandlers.push(handler);
    return () => {
      this.connectionHandlers = this.connectionHandlers.filter((h) => h !== handler);
    };
  }
}

export const privateSessionService = {
  async createSession(options: CreateSessionOptions = {}): Promise<PrivateSession> {
    const response = await apiClient.post<PrivateSessionResponse>('/private-sessions/create', {
      difficulty: options.difficulty || 'medium',
      length: options.length || 'medium',
      max_players: options.maxPlayers || 4,
    });
    return mapSessionResponse(response);
  },

  async getSession(code: string): Promise<PrivateSession> {
    const response = await apiClient.get<PrivateSessionResponse>(`/private-sessions/${code}`);
    return mapSessionResponse(response);
  },

  async joinSession(code: string): Promise<PrivateSession> {
    const response = await apiClient.post<PrivateSessionResponse>(`/private-sessions/${code}/join`);
    return mapSessionResponse(response);
  },

  async toggleReady(code: string): Promise<{ isReady: boolean }> {
    const response = await apiClient.post<{ is_ready: boolean }>(`/private-sessions/${code}/ready`);
    return { isReady: response.is_ready };
  },

  async startRace(code: string): Promise<void> {
    await apiClient.post(`/private-sessions/${code}/start`);
  },

  createWebSocket(code: string, token: string): PrivateSessionWebSocket {
    return new PrivateSessionWebSocket(code, token);
  },
};
