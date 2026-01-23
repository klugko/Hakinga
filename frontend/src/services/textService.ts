/**
 * Typing Text Service
 */
import { apiClient } from './api';
import type { TypingText } from '@/types';

interface TypingTextResponse {
  id: string;
  content: string;
  difficulty: string;
  length: string;
  word_count: number;
  category: string | null;
  author: string | null;
}

interface TextListResponse {
  texts: TypingTextResponse[];
  total: number;
  page: number;
  pages: number;
}

function mapTextResponse(response: TypingTextResponse): TypingText {
  return {
    id: response.id,
    content: response.content,
    difficulty: response.difficulty as 'easy' | 'medium' | 'hard',
    length: response.length as 'short' | 'medium' | 'long',
    wordCount: response.word_count,
    category: response.category || undefined,
  };
}

export const textService = {
  async getRandomText(options?: { difficulty?: string; length?: string }): Promise<TypingText> {
    const params = new URLSearchParams();
    if (options?.difficulty) params.append('difficulty', options.difficulty);
    if (options?.length) params.append('length', options.length);

    const queryString = params.toString();
    const endpoint = queryString ? `/texts/random?${queryString}` : '/texts/random';

    const response = await apiClient.get<TypingTextResponse>(endpoint);
    return mapTextResponse(response);
  },

  async listTexts(options?: {
    page?: number;
    limit?: number;
    difficulty?: string;
    length?: string;
  }): Promise<{ texts: TypingText[]; total: number; page: number; pages: number }> {
    const params = new URLSearchParams();
    if (options?.page) params.append('page', options.page.toString());
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.difficulty) params.append('difficulty', options.difficulty);
    if (options?.length) params.append('length', options.length);

    const queryString = params.toString();
    const endpoint = queryString ? `/texts?${queryString}` : '/texts';

    const response = await apiClient.get<TextListResponse>(endpoint);
    return {
      texts: response.texts.map(mapTextResponse),
      total: response.total,
      page: response.page,
      pages: response.pages,
    };
  },

  async getText(textId: string): Promise<TypingText> {
    const response = await apiClient.get<TypingTextResponse>(`/texts/${textId}`);
    return mapTextResponse(response);
  },
};
