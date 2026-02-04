import type { TypingText } from '@/types';
import { mockTexts } from '@/lib/utils';

// Type.fit API response type (supports CORS)
interface TypeFitQuote {
  text: string;
  author: string | null;
}

// Cache for quotes
interface QuoteCache {
  quotes: TypeFitQuote[];
  lastFetch: number;
  initialized: boolean;
}

let quoteCache: QuoteCache = {
  quotes: [],
  lastFetch: 0,
  initialized: false,
};

// Fetch all quotes from type.fit API (returns ~1600 quotes)
async function fetchAllQuotes(): Promise<TypeFitQuote[]> {
  try {
    const response = await fetch('https://type.fit/api/quotes');

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: TypeFitQuote[] = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch quotes:', error);
    return [];
  }
}

// Initialize cache with all quotes
async function initializeCache(): Promise<void> {
  if (quoteCache.initialized && quoteCache.quotes.length > 0) {
    return;
  }

  const quotes = await fetchAllQuotes();

  if (quotes.length > 0) {
    // Shuffle quotes for variety
    const shuffled = quotes.sort(() => Math.random() - 0.5);
    quoteCache = {
      quotes: shuffled,
      lastFetch: Date.now(),
      initialized: true,
    };
  }
}

// Get random quotes from cache
function getRandomQuotesFromCache(count: number): TypeFitQuote[] {
  if (quoteCache.quotes.length === 0) {
    return [];
  }

  const results: TypeFitQuote[] = [];
  const usedIndices = new Set<number>();

  while (results.length < count && usedIndices.size < quoteCache.quotes.length) {
    const index = Math.floor(Math.random() * quoteCache.quotes.length);
    if (!usedIndices.has(index)) {
      usedIndices.add(index);
      results.push(quoteCache.quotes[index]);
    }
  }

  return results;
}

// Calculate difficulty based on text complexity
function calculateDifficulty(text: string): 'easy' | 'medium' | 'hard' {
  const words = text.split(/\s+/);
  const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;

  // Check for special characters and punctuation density
  const specialCharsCount = (text.match(/[^a-zA-Z0-9\s]/g) || []).length;
  const specialCharsDensity = specialCharsCount / text.length;

  if (avgWordLength < 4.5 && specialCharsDensity < 0.05) {
    return 'easy';
  } else if (avgWordLength > 6 || specialCharsDensity > 0.1) {
    return 'hard';
  }
  return 'medium';
}

// Calculate length category based on word count
function calculateLength(wordCount: number): 'short' | 'medium' | 'long' {
  if (wordCount < 30) return 'short';
  if (wordCount < 80) return 'medium';
  return 'long';
}

// Convert quotes to TypingText format
function quotesToTypingText(quotes: TypeFitQuote[], targetLength: 'short' | 'medium' | 'long'): TypingText {
  // Target word counts for each length
  const targetWordCount = {
    short: 20,
    medium: 60,
    long: 120,
  };

  const target = targetWordCount[targetLength];
  let content = '';
  const authors: string[] = [];

  for (const quote of quotes) {
    if (content) {
      content += ' ';
    }
    content += quote.text;

    const author = quote.author || 'Unknown';
    if (!authors.includes(author)) {
      authors.push(author);
    }

    const currentWordCount = content.split(/\s+/).length;
    if (currentWordCount >= target) break;
  }

  const wordCount = content.split(/\s+/).length;

  return {
    id: `quote-${Date.now()}`,
    content,
    difficulty: calculateDifficulty(content),
    length: calculateLength(wordCount),
    wordCount,
    category: authors.length > 0
      ? `${authors.slice(0, 2).join(', ')}${authors.length > 2 ? ' & more' : ''}`
      : undefined,
  };
}

// Main function to get random text for typing
export async function getRandomQuote(
  _difficulty: 'easy' | 'medium' | 'hard',
  length: 'short' | 'medium' | 'long'
): Promise<TypingText> {
  try {
    // Ensure cache is initialized
    await initializeCache();

    // Determine how many quotes we need based on length
    const quotesNeeded = length === 'short' ? 2 : length === 'medium' ? 4 : 8;
    const quotes = getRandomQuotesFromCache(quotesNeeded);

    // If we got quotes, convert to TypingText
    if (quotes.length > 0) {
      return quotesToTypingText(quotes, length);
    }

    // Fallback to mock data if API fails
    throw new Error('No quotes available');
  } catch (error) {
    console.warn('Falling back to mock texts:', error);
    return getFallbackText(_difficulty, length);
  }
}

// Fallback to local mock texts
function getFallbackText(difficulty: string, length: string): TypingText {
  const filtered = mockTexts.filter(t => t.difficulty === difficulty && t.length === length);
  return filtered[Math.floor(Math.random() * filtered.length)] || mockTexts[0];
}

// Initialize the service (call this on app start)
export function initQuoteService(): void {
  initializeCache().catch(console.error);
}

// Export for testing
export { initializeCache, quoteCache };
