import { clsx, type ClassValue } from 'clsx';

/**
 * Combines class names using clsx for conditional class handling
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

/**
 * Formats a number as WPM (Words Per Minute)
 */
export function formatWpm(wpm: number): string {
  return Math.round(wpm).toString();
}

/**
 * Formats accuracy as a percentage
 */
export function formatAccuracy(accuracy: number): string {
  return `${(accuracy * 100).toFixed(1)}%`;
}

/**
 * Formats duration in milliseconds to a readable string
 */
export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes === 0) {
    return `${remainingSeconds}s`;
  }

  return `${minutes}m ${remainingSeconds.toString().padStart(2, '0')}s`;
}

/**
 * Formats a date to a localized string
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Formats a date to a relative time string
 */
export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) {
    return "A l'instant";
  }
  if (diffMinutes < 60) {
    return `Il y a ${diffMinutes} min`;
  }
  if (diffHours < 24) {
    return `Il y a ${diffHours}h`;
  }
  if (diffDays < 7) {
    return `Il y a ${diffDays}j`;
  }

  return formatDate(d);
}

/**
 * Formats total practice time in hours
 */
export function formatPracticeTime(ms: number): string {
  const hours = ms / (1000 * 60 * 60);
  if (hours < 1) {
    const minutes = Math.round(ms / (1000 * 60));
    return `${minutes} min`;
  }
  return `${hours.toFixed(1)}h`;
}

/**
 * Formats a number with thousand separators
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('fr-FR');
}

/**
 * Calculates WPM from characters typed and time elapsed
 */
export function calculateWpm(correctChars: number, durationMs: number): number {
  if (durationMs === 0) return 0;
  const minutes = durationMs / (1000 * 60);
  const words = correctChars / 5;
  return words / minutes;
}

/**
 * Calculates accuracy from correct and total characters
 */
export function calculateAccuracy(correctChars: number, totalChars: number): number {
  if (totalChars === 0) return 1;
  return correctChars / totalChars;
}

/**
 * Debounces a function call
 */
export function debounce<T extends (...args: Parameters<T>) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttles a function call
 */
export function throttle<T extends (...args: Parameters<T>) => void>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Generates a random string of specified length
 */
export function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Validates email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates password strength
 */
export function isValidPassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Le mot de passe doit contenir au moins 8 caracteres');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une majuscule');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une minuscule');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un chiffre');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates username format
 */
export function isValidUsername(username: string): {
  isValid: boolean;
  error?: string;
} {
  if (username.length < 3) {
    return { isValid: false, error: 'Le username doit contenir au moins 3 caracteres' };
  }
  if (username.length > 20) {
    return { isValid: false, error: 'Le username ne peut pas depasser 20 caracteres' };
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return {
      isValid: false,
      error: 'Le username ne peut contenir que des lettres, chiffres et underscores',
    };
  }

  return { isValid: true };
}

/**
 * Gets the skill badge based on skill level
 */
export function getSkillBadge(skillLevel: number): {
  badge: string;
  label: string;
  color: string;
} {
  if (skillLevel <= 20) {
    return { badge: 'beginner', label: 'Debutant', color: 'text-gray-400' };
  }
  if (skillLevel <= 40) {
    return { badge: 'novice', label: 'Novice', color: 'text-green-400' };
  }
  if (skillLevel <= 60) {
    return { badge: 'intermediate', label: 'Intermediaire', color: 'text-blue-400' };
  }
  if (skillLevel <= 80) {
    return { badge: 'advanced', label: 'Avance', color: 'text-purple-400' };
  }
  return { badge: 'expert', label: 'Expert', color: 'text-gold' };
}

/**
 * Gets the rank color based on position
 */
export function getRankColor(rank: number): string {
  if (rank === 1) return 'text-gold';
  if (rank === 2) return 'text-silver';
  if (rank === 3) return 'text-bronze';
  return 'text-text-secondary';
}

/**
 * Gets points earned based on race rank
 */
export function getPointsForRank(rank: number): number {
  const points: Record<number, number> = {
    1: 50,
    2: 30,
    3: 20,
    4: 10,
    5: 5,
  };
  return points[rank] ?? 0;
}

/**
 * Copies text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/**
 * Detects device type from user agent
 */
export function getDeviceType(): 'desktop' | 'mobile' | 'tablet' {
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  if (
    /Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(
      ua
    )
  ) {
    return 'mobile';
  }
  return 'desktop';
}

/**
 * Detects keyboard layout (basic detection)
 */
export function detectKeyboardLayout(): 'QWERTY' | 'AZERTY' | 'unknown' {
  const lang = navigator.language.toLowerCase();
  if (lang.startsWith('fr')) {
    return 'AZERTY';
  }
  if (
    lang.startsWith('en') ||
    lang.startsWith('es') ||
    lang.startsWith('pt') ||
    lang.startsWith('it')
  ) {
    return 'QWERTY';
  }
  return 'unknown';
}
