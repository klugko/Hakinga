import type { WebSocketMessage, WebSocketEventType } from '@/types';
import { getStoredToken } from './api';

type MessageHandler = (payload: unknown) => void;

const WS_BASE_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws';

/**
 * WebSocket manager for real-time communication
 */
class WebSocketManager {
  private socket: WebSocket | null = null;
  private handlers: Map<WebSocketEventType, Set<MessageHandler>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private pingInterval: ReturnType<typeof setInterval> | null = null;
  private sessionCode: string | null = null;

  /**
   * Connects to a session WebSocket
   */
  connect(sessionCode: string): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      if (this.sessionCode === sessionCode) {
        return;
      }
      this.disconnect();
    }

    this.sessionCode = sessionCode;
    const token = getStoredToken();
    const url = `${WS_BASE_URL}/${sessionCode}${token ? `?token=${token}` : ''}`;

    this.socket = new WebSocket(url);

    this.socket.onopen = () => {
      this.reconnectAttempts = 0;
      this.startPingInterval();
    };

    this.socket.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    this.socket.onclose = () => {
      this.stopPingInterval();
      if (this.sessionCode && this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        setTimeout(() => {
          if (this.sessionCode) {
            this.connect(this.sessionCode);
          }
        }, this.reconnectDelay * this.reconnectAttempts);
      }
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  /**
   * Disconnects from the WebSocket
   */
  disconnect(): void {
    this.sessionCode = null;
    this.stopPingInterval();
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.handlers.clear();
    this.reconnectAttempts = 0;
  }

  /**
   * Sends a message through the WebSocket
   */
  send(type: WebSocketEventType, payload: unknown): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type, payload }));
    }
  }

  /**
   * Registers a handler for a specific event type
   */
  on(type: WebSocketEventType, handler: MessageHandler): void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    this.handlers.get(type)!.add(handler);
  }

  /**
   * Unregisters a handler for a specific event type
   */
  off(type: WebSocketEventType, handler: MessageHandler): void {
    this.handlers.get(type)?.delete(handler);
  }

  /**
   * Returns the current connection state
   */
  isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  private handleMessage(message: WebSocketMessage): void {
    const handlers = this.handlers.get(message.type);
    if (handlers) {
      handlers.forEach((handler) => handler(message.payload));
    }
  }

  private startPingInterval(): void {
    this.pingInterval = setInterval(() => {
      if (this.socket?.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000);
  }

  private stopPingInterval(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }
}

export const wsManager = new WebSocketManager();

/**
 * Hook-friendly WebSocket utilities
 */
export function useWebSocket(sessionCode: string | null) {
  return {
    connect: () => sessionCode && wsManager.connect(sessionCode),
    disconnect: () => wsManager.disconnect(),
    send: (type: WebSocketEventType, payload: unknown) => wsManager.send(type, payload),
    on: (type: WebSocketEventType, handler: MessageHandler) => wsManager.on(type, handler),
    off: (type: WebSocketEventType, handler: MessageHandler) => wsManager.off(type, handler),
    isConnected: () => wsManager.isConnected(),
  };
}
