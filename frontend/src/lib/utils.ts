import type { TypingText, TypingSession, User, DashboardStats, Player, Achievement, LeaderboardEntry, Friend } from '@/types';

// Utility function to merge classnames
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

// Format time in mm:ss
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Format date
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// Format relative time
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(dateString);
}

// Calculate WPM
export function calculateWpm(characters: number, timeInSeconds: number): number {
  if (timeInSeconds === 0) return 0;
  // Average word length is 5 characters
  const words = characters / 5;
  const minutes = timeInSeconds / 60;
  return Math.round(words / minutes);
}

// Calculate accuracy
export function calculateAccuracy(correct: number, total: number): number {
  if (total === 0) return 100;
  return Math.round((correct / total) * 100);
}

// Generate random session code
export function generateSessionCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Mock data
export const mockUser: User = {
  id: '1',
  username: 'demo_user',
  email: 'demo@hakinga.com',
  avatar: undefined,
  createdAt: '2024-01-01T00:00:00Z',
  stats: {
    avgWpm: 75,
    avgAccuracy: 94,
    bestWpm: 98,
    totalSessions: 42,
    totalTimeTyped: 12600, // 3.5 hours
    totalCharactersTyped: 52000,
  },
};

export const mockTexts: TypingText[] = [
  // Short texts (around 50 words)
  {
    id: 'short-1',
    content: 'The quick brown fox jumps over the lazy dog. This simple sentence contains every letter of the alphabet, making it perfect for typing practice.',
    difficulty: 'easy',
    length: 'short',
    wordCount: 26,
    category: 'pangram',
  },
  {
    id: 'short-2',
    content: 'Programming is the art of telling a computer what to do. It requires patience, logic, and creativity. Every great application starts with a single line of code.',
    difficulty: 'medium',
    length: 'short',
    wordCount: 30,
    category: 'technology',
  },
  {
    id: 'short-3',
    content: 'In the realm of competitive typing, speed and accuracy must coexist harmoniously. Professional typists achieve remarkable feats through dedicated practice sessions.',
    difficulty: 'hard',
    length: 'short',
    wordCount: 24,
    category: 'typing',
  },
  // Medium texts (around 100 words)
  {
    id: 'medium-1',
    content: 'Learning to type faster is a valuable skill in today\'s digital world. Whether you\'re writing emails, coding software, or chatting with friends, typing speed matters. The key to improvement lies in consistent practice and proper technique. Focus on accuracy first, then gradually increase your speed. Remember to maintain good posture and keep your fingers on the home row. With dedication and patience, anyone can become a proficient typist. Start with short practice sessions and gradually increase the duration as your stamina improves.',
    difficulty: 'easy',
    length: 'medium',
    wordCount: 89,
    category: 'educational',
  },
  {
    id: 'medium-2',
    content: 'The evolution of keyboards has been remarkable since the invention of the typewriter. From mechanical switches to membrane designs, each innovation has shaped how we interact with our devices. Modern keyboards offer various features like RGB lighting, programmable keys, and ergonomic layouts. Mechanical keyboards have seen a resurgence among enthusiasts and professionals alike, praised for their tactile feedback and durability. Whether you prefer the quiet operation of membrane keyboards or the satisfying clicks of mechanical switches, finding the right keyboard can significantly improve your typing experience.',
    difficulty: 'medium',
    length: 'medium',
    wordCount: 92,
    category: 'technology',
  },
  {
    id: 'medium-3',
    content: 'Competitive typing has emerged as a legitimate esport, with tournaments attracting participants from around the globe. Top competitors achieve speeds exceeding 200 words per minute while maintaining near-perfect accuracy. These remarkable achievements require years of dedicated practice and specialized techniques. The community has developed various training methodologies, from touch-typing fundamentals to advanced pattern recognition exercises. Aspiring competitive typists must cultivate both physical dexterity and mental focus. Success in this discipline demands unwavering commitment and continuous self-improvement through rigorous daily practice sessions.',
    difficulty: 'hard',
    length: 'medium',
    wordCount: 87,
    category: 'competition',
  },
  // Long texts (around 200 words)
  {
    id: 'long-1',
    content: 'The art of touch typing is a fundamental skill that can transform your productivity. By learning to type without looking at the keyboard, you free your mind to focus entirely on the content you\'re creating. This technique, developed in the late 19th century, has stood the test of time and remains relevant in our modern digital age. The process begins with familiarizing yourself with the home row keys, where your fingers naturally rest. From this position, you can reach all other keys with minimal movement. Practice is essential, starting with simple exercises and gradually progressing to more complex texts. Many successful typists recommend daily practice sessions of at least fifteen minutes. Consistency trumps intensity when it comes to building muscle memory. Over time, the movements become automatic, allowing you to type at impressive speeds while maintaining high accuracy. The benefits extend beyond mere speed, as touch typing reduces physical strain and allows for longer comfortable typing sessions. Whether you\'re a student, professional, or casual computer user, investing time in developing this skill will pay dividends throughout your life.',
    difficulty: 'easy',
    length: 'long',
    wordCount: 185,
    category: 'educational',
  },
  {
    id: 'long-2',
    content: 'Software development has undergone tremendous transformation over the past few decades. From the early days of punch cards and assembly language to modern high-level programming languages, the field continues to evolve rapidly. Today\'s developers have access to powerful tools and frameworks that would have seemed like science fiction to their predecessors. Integrated development environments provide real-time feedback and intelligent code completion, dramatically improving productivity. Version control systems enable seamless collaboration among distributed teams working on complex projects. The rise of open-source software has democratized access to cutting-edge technologies, allowing developers worldwide to contribute to and benefit from shared codebases. Cloud computing has revolutionized deployment, making it possible to scale applications dynamically based on demand. Artificial intelligence and machine learning are now being integrated into development workflows, automating repetitive tasks and helping identify potential bugs before they reach production. As we look to the future, quantum computing promises to unlock entirely new possibilities. The journey of a software developer is one of perpetual learning, as new languages, frameworks, and paradigms emerge with remarkable frequency. Embracing this constant evolution is essential for success in this dynamic field.',
    difficulty: 'medium',
    length: 'long',
    wordCount: 192,
    category: 'technology',
  },
  {
    id: 'long-3',
    content: 'The phenomenon of competitive typing represents a fascinating intersection of human capability and technological measurement. Elite practitioners demonstrate extraordinary neuromuscular coordination, achieving keystroke rates that challenge the limits of human physiology. Championship-level competitions feature meticulously standardized conditions, ensuring equitable assessment of participants\' abilities. Sophisticated algorithms calculate words per minute while accounting for error correction and penalty systems. The psychological dimension proves equally consequential, as competitors must maintain composure under considerable pressure while executing precisely timed movements. Training regimens incorporate elements borrowed from other competitive disciplines, including visualization techniques, deliberate practice methodologies, and periodization strategies. Biomechanical analysis has revealed optimal hand positioning and finger movement patterns that minimize fatigue while maximizing throughput. The community has developed specialized keyboard configurations and switches tailored specifically for competitive requirements. Longitudinal studies have documented remarkable improvements in participants\' cognitive processing speeds and fine motor control. Neuroplasticity enables dedicated practitioners to physically reconfigure their neural pathways, creating more efficient connections between visual processing centers and motor cortex regions. This remarkable demonstration of human adaptability continues to attract researchers investigating the boundaries of skilled performance acquisition.',
    difficulty: 'hard',
    length: 'long',
    wordCount: 178,
    category: 'scientific',
  },
];

export const mockSessions: TypingSession[] = [
  {
    id: 's1',
    userId: '1',
    textId: 'medium-1',
    text: mockTexts[3].content,
    wpm: 82,
    rawWpm: 88,
    accuracy: 96,
    errors: 4,
    totalCharacters: 450,
    correctCharacters: 432,
    duration: 65,
    startedAt: '2024-01-20T10:30:00Z',
    completedAt: '2024-01-20T10:31:05Z',
    mode: 'solo',
    wpmHistory: [
      { time: 10, wpm: 75, accuracy: 98 },
      { time: 20, wpm: 80, accuracy: 97 },
      { time: 30, wpm: 78, accuracy: 95 },
      { time: 40, wpm: 84, accuracy: 96 },
      { time: 50, wpm: 82, accuracy: 96 },
      { time: 60, wpm: 82, accuracy: 96 },
    ],
  },
  {
    id: 's2',
    userId: '1',
    textId: 'short-2',
    text: mockTexts[1].content,
    wpm: 78,
    rawWpm: 82,
    accuracy: 94,
    errors: 6,
    totalCharacters: 180,
    correctCharacters: 169,
    duration: 28,
    startedAt: '2024-01-19T14:15:00Z',
    completedAt: '2024-01-19T14:15:28Z',
    mode: 'solo',
    wpmHistory: [
      { time: 10, wpm: 72, accuracy: 96 },
      { time: 20, wpm: 76, accuracy: 94 },
      { time: 28, wpm: 78, accuracy: 94 },
    ],
  },
  {
    id: 's3',
    userId: '1',
    textId: 'long-2',
    text: mockTexts[7].content,
    wpm: 71,
    rawWpm: 78,
    accuracy: 91,
    errors: 18,
    totalCharacters: 980,
    correctCharacters: 892,
    duration: 165,
    startedAt: '2024-01-18T09:00:00Z',
    completedAt: '2024-01-18T09:02:45Z',
    mode: 'solo',
    wpmHistory: [
      { time: 30, wpm: 68, accuracy: 93 },
      { time: 60, wpm: 72, accuracy: 92 },
      { time: 90, wpm: 70, accuracy: 91 },
      { time: 120, wpm: 73, accuracy: 91 },
      { time: 150, wpm: 71, accuracy: 91 },
    ],
  },
  {
    id: 's4',
    userId: '1',
    textId: 'medium-3',
    text: mockTexts[5].content,
    wpm: 65,
    rawWpm: 72,
    accuracy: 88,
    errors: 12,
    totalCharacters: 520,
    correctCharacters: 458,
    duration: 95,
    startedAt: '2024-01-17T16:45:00Z',
    completedAt: '2024-01-17T16:46:35Z',
    mode: 'private',
    wpmHistory: [
      { time: 20, wpm: 60, accuracy: 90 },
      { time: 40, wpm: 64, accuracy: 89 },
      { time: 60, wpm: 66, accuracy: 88 },
      { time: 80, wpm: 65, accuracy: 88 },
    ],
  },
  {
    id: 's5',
    userId: '1',
    textId: 'short-1',
    text: mockTexts[0].content,
    wpm: 92,
    rawWpm: 95,
    accuracy: 98,
    errors: 2,
    totalCharacters: 150,
    correctCharacters: 147,
    duration: 20,
    startedAt: '2024-01-16T11:20:00Z',
    completedAt: '2024-01-16T11:20:20Z',
    mode: 'solo',
    wpmHistory: [
      { time: 10, wpm: 88, accuracy: 99 },
      { time: 20, wpm: 92, accuracy: 98 },
    ],
  },
  {
    id: 's6',
    userId: '1',
    textId: 'medium-2',
    text: mockTexts[4].content,
    wpm: 76,
    rawWpm: 81,
    accuracy: 93,
    errors: 8,
    totalCharacters: 560,
    correctCharacters: 521,
    duration: 88,
    startedAt: '2024-01-15T13:00:00Z',
    completedAt: '2024-01-15T13:01:28Z',
    mode: 'solo',
    wpmHistory: [
      { time: 20, wpm: 70, accuracy: 95 },
      { time: 40, wpm: 74, accuracy: 94 },
      { time: 60, wpm: 77, accuracy: 93 },
      { time: 80, wpm: 76, accuracy: 93 },
    ],
  },
  {
    id: 's7',
    userId: '1',
    textId: 'short-3',
    text: mockTexts[2].content,
    wpm: 58,
    rawWpm: 65,
    accuracy: 85,
    errors: 10,
    totalCharacters: 170,
    correctCharacters: 145,
    duration: 35,
    startedAt: '2024-01-14T18:30:00Z',
    completedAt: '2024-01-14T18:30:35Z',
    mode: 'competition',
    wpmHistory: [
      { time: 10, wpm: 52, accuracy: 88 },
      { time: 20, wpm: 56, accuracy: 86 },
      { time: 30, wpm: 58, accuracy: 85 },
    ],
  },
  {
    id: 's8',
    userId: '1',
    textId: 'long-1',
    text: mockTexts[6].content,
    wpm: 80,
    rawWpm: 85,
    accuracy: 95,
    errors: 10,
    totalCharacters: 1050,
    correctCharacters: 998,
    duration: 155,
    startedAt: '2024-01-13T10:00:00Z',
    completedAt: '2024-01-13T10:02:35Z',
    mode: 'solo',
    wpmHistory: [
      { time: 30, wpm: 76, accuracy: 96 },
      { time: 60, wpm: 79, accuracy: 95 },
      { time: 90, wpm: 81, accuracy: 95 },
      { time: 120, wpm: 80, accuracy: 95 },
      { time: 150, wpm: 80, accuracy: 95 },
    ],
  },
  {
    id: 's9',
    userId: '1',
    textId: 'medium-1',
    text: mockTexts[3].content,
    wpm: 74,
    rawWpm: 79,
    accuracy: 92,
    errors: 7,
    totalCharacters: 450,
    correctCharacters: 414,
    duration: 72,
    startedAt: '2024-01-12T15:45:00Z',
    completedAt: '2024-01-12T15:46:12Z',
    mode: 'private',
    wpmHistory: [
      { time: 20, wpm: 70, accuracy: 94 },
      { time: 40, wpm: 73, accuracy: 93 },
      { time: 60, wpm: 75, accuracy: 92 },
    ],
  },
  {
    id: 's10',
    userId: '1',
    textId: 'short-2',
    text: mockTexts[1].content,
    wpm: 85,
    rawWpm: 89,
    accuracy: 97,
    errors: 3,
    totalCharacters: 180,
    correctCharacters: 175,
    duration: 25,
    startedAt: '2024-01-11T09:30:00Z',
    completedAt: '2024-01-11T09:30:25Z',
    mode: 'solo',
    wpmHistory: [
      { time: 10, wpm: 80, accuracy: 98 },
      { time: 20, wpm: 84, accuracy: 97 },
    ],
  },
];

export const mockDashboardStats: DashboardStats = {
  totalSessions: 42,
  avgWpm: 75,
  avgAccuracy: 94,
  bestWpm: 98,
  totalTimeTyped: 12600,
  improvementPercent: 12,
  recentSessions: mockSessions.slice(0, 5),
  wpmTrend: [
    { time: 1, wpm: 68, accuracy: 91 },
    { time: 2, wpm: 70, accuracy: 92 },
    { time: 3, wpm: 72, accuracy: 93 },
    { time: 4, wpm: 71, accuracy: 92 },
    { time: 5, wpm: 74, accuracy: 94 },
    { time: 6, wpm: 76, accuracy: 93 },
    { time: 7, wpm: 75, accuracy: 95 },
  ],
};

export const mockPlayers: Player[] = [
  { id: '1', username: 'demo_user', isHost: true, isReady: true, progress: 0, wpm: 0, accuracy: 100 },
  { id: '2', username: 'speed_demon', isHost: false, isReady: true, progress: 0, wpm: 0, accuracy: 100 },
  { id: '3', username: 'keyboard_ninja', isHost: false, isReady: false, progress: 0, wpm: 0, accuracy: 100 },
  { id: '4', username: 'type_master', isHost: false, isReady: true, progress: 0, wpm: 0, accuracy: 100 },
];

export const mockAchievements: Achievement[] = [
  { id: 'a1', name: 'First Steps', description: 'Complete your first typing session', icon: '🎯', unlockedAt: '2024-01-01' },
  { id: 'a2', name: 'Speed Demon', description: 'Reach 80 WPM in a session', icon: '⚡', unlockedAt: '2024-01-10' },
  { id: 'a3', name: 'Perfectionist', description: 'Achieve 100% accuracy in a session', icon: '💎', unlockedAt: '2024-01-15' },
  { id: 'a4', name: 'Dedicated', description: 'Practice for 10 days in a row', icon: '🔥', progress: 7, maxProgress: 10 },
  { id: 'a5', name: 'Century Club', description: 'Reach 100 WPM', icon: '🏆', progress: 92, maxProgress: 100 },
  { id: 'a6', name: 'Marathon Runner', description: 'Type 10,000 characters in total', icon: '🏃', unlockedAt: '2024-01-18' },
  { id: 'a7', name: 'Social Butterfly', description: 'Complete 5 private sessions', icon: '🦋', progress: 2, maxProgress: 5 },
  { id: 'a8', name: 'Champion', description: 'Win a competition race', icon: '👑' },
];

export const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, userId: 'u1', username: 'lightning_fingers', wpm: 156, accuracy: 98, sessionsPlayed: 234 },
  { rank: 2, userId: 'u2', username: 'type_god', wpm: 148, accuracy: 97, sessionsPlayed: 189 },
  { rank: 3, userId: 'u3', username: 'keyboard_warrior', wpm: 142, accuracy: 96, sessionsPlayed: 312 },
  { rank: 4, userId: 'u4', username: 'speed_master', wpm: 138, accuracy: 95, sessionsPlayed: 167 },
  { rank: 5, userId: 'u5', username: 'swift_keys', wpm: 134, accuracy: 97, sessionsPlayed: 145 },
  { rank: 6, userId: 'u6', username: 'rapid_typer', wpm: 128, accuracy: 94, sessionsPlayed: 201 },
  { rank: 7, userId: 'u7', username: 'key_crusher', wpm: 125, accuracy: 93, sessionsPlayed: 178 },
  { rank: 8, userId: 'u8', username: 'type_ninja', wpm: 122, accuracy: 96, sessionsPlayed: 156 },
  { rank: 9, userId: 'u9', username: 'finger_flash', wpm: 118, accuracy: 95, sessionsPlayed: 134 },
  { rank: 10, userId: '1', username: 'demo_user', wpm: 98, accuracy: 94, sessionsPlayed: 42 },
];

export const mockFriends: Friend[] = [
  { id: 'f1', username: 'speed_demon', status: 'online', stats: { avgWpm: 95, totalSessions: 78 } },
  { id: 'f2', username: 'keyboard_ninja', status: 'in-game', stats: { avgWpm: 88, totalSessions: 124 } },
  { id: 'f3', username: 'type_master', status: 'offline', lastSeen: '2024-01-20T08:00:00Z', stats: { avgWpm: 82, totalSessions: 56 } },
  { id: 'f4', username: 'swift_fingers', status: 'online', stats: { avgWpm: 91, totalSessions: 203 } },
];

// Get random text based on config
export function getRandomText(difficulty: string, length: string): TypingText {
  const filtered = mockTexts.filter(t => t.difficulty === difficulty && t.length === length);
  return filtered[Math.floor(Math.random() * filtered.length)] || mockTexts[0];
}

// Sleep utility
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
