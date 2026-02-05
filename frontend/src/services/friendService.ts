/**
 * Friend Service
 */
import { apiClient } from './api';
import type { Friend, FriendRequest } from '@/types';

interface FriendResponse {
  id: string;
  username: string;
  avatar: string | null;
  status: string;
  last_seen: string | null;
  stats: {
    avg_wpm: number;
    total_sessions: number;
  };
}

interface FriendRequestResponse {
  id: string;
  from_user: {
    id: string;
    username: string;
    avatar: string | null;
  };
  status: string;
  created_at: string;
}

function mapFriendResponse(response: FriendResponse): Friend {
  return {
    id: response.id,
    username: response.username,
    avatar: response.avatar || undefined,
    status: response.status as 'online' | 'offline' | 'in-game',
    lastSeen: response.last_seen || undefined,
    stats: {
      avgWpm: response.stats.avg_wpm,
      totalSessions: response.stats.total_sessions,
    },
  };
}

function mapFriendRequestResponse(response: FriendRequestResponse): FriendRequest {
  return {
    id: response.id,
    from: {
      id: response.from_user.id,
      username: response.from_user.username,
      avatar: response.from_user.avatar || undefined,
    },
    status: response.status as 'pending' | 'accepted' | 'rejected',
    createdAt: response.created_at,
  };
}

export const friendService = {
  async getFriends(): Promise<Friend[]> {
    const response = await apiClient.get<FriendResponse[]>('/friends');
    return response.map(mapFriendResponse);
  },

  async getFriendRequests(): Promise<FriendRequest[]> {
    const response = await apiClient.get<FriendRequestResponse[]>('/friends/requests');
    return response.map(mapFriendRequestResponse);
  },

  async sendFriendRequest(username: string): Promise<void> {
    await apiClient.post('/friends/requests', { username });
  },

  async acceptFriendRequest(requestId: string): Promise<void> {
    await apiClient.post(`/friends/requests/${requestId}/accept`);
  },

  async rejectFriendRequest(requestId: string): Promise<void> {
    await apiClient.post(`/friends/requests/${requestId}/reject`);
  },

  async removeFriend(friendId: string): Promise<void> {
    await apiClient.delete(`/friends/${friendId}`);
  },
};
