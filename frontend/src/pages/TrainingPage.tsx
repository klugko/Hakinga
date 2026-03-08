import { Link } from 'react-router-dom';
import { Keyboard, Target, Gauge, Timer, Zap, ArrowRight, Code, Braces } from 'lucide-react';
import { Layout } from '@/components/layout';
import { Card, Badge, Progress } from '@/components/ui';

interface TrainingMode {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  progress?: number;
}

const trainingModes: TrainingMode[] = [
  {
    id: 'home-row',
    title: 'Home Row Mastery',
    description: 'Master the foundation: A S D F J K L ;',
    icon: Keyboard,
    color: '#22c55e',
    difficulty: 'beginner',
    progress: 85,
  },
  {
    id: 'top-row',
    title: 'Top Row Training',
    description: 'Practice Q W E R T Y U I O P keys',
    icon: Keyboard,
    color: '#3b82f6',
    difficulty: 'beginner',
    progress: 60,
  },
  {
    id: 'bottom-row',
    title: 'Bottom Row Training',
    description: 'Practice Z X C V B N M keys',
    icon: Keyboard,
    color: '#8b5cf6',
    difficulty: 'beginner',
    progress: 45,
  },
  {
    id: 'numbers',
    title: 'Number Keys',
    description: 'Master the number row 1-0',
    icon: Target,
    color: '#f59e0b',
    difficulty: 'intermediate',
    progress: 20,
  },
  {
    id: 'punctuation',
    title: 'Punctuation & Symbols',
    description: 'Common punctuation and special characters',
    icon: Target,
    color: '#ef4444',
    difficulty: 'intermediate',
  },
  {
    id: 'speed-drill',
    title: 'Speed Drills',
    description: 'Short, intense typing bursts for speed',
    icon: Zap,
    color: '#ec4899',
    difficulty: 'advanced',
  },
  {
    id: 'accuracy',
    title: 'Accuracy Focus',
    description: 'Slow down and perfect your technique',
    icon: Target,
    color: '#14b8a6',
    difficulty: 'intermediate',
  },
  {
    id: 'timed-challenge',
    title: 'Timed Challenges',
    description: '1, 2, or 5 minute timed tests',
    icon: Timer,
    color: '#6366f1',
    difficulty: 'advanced',
  },
  {
    id: 'code-python',
    title: 'Python Code',
    description: 'Practice typing Python code snippets',
    icon: Code,
    color: '#3572A5',
    difficulty: 'intermediate',
  },
  {
    id: 'code-javascript',
    title: 'JavaScript Code',
    description: 'Practice typing JavaScript and TypeScript',
    icon: Code,
    color: '#f7df1e',
    difficulty: 'intermediate',
  },
  {
    id: 'code-java',
    title: 'Java Code',
    description: 'Practice typing Java class definitions',
    icon: Code,
    color: '#b07219',
    difficulty: 'advanced',
  },
  {
    id: 'code-symbols',
    title: 'Code Symbols Drill',
    description: 'Master { } [ ] ( ) < > symbols',
    icon: Braces,
    color: '#10b981',
    difficulty: 'intermediate',
  },
];

const difficultyColors = {
  beginner: 'success',
  intermediate: 'warning',
  advanced: 'error',
} as const;

function TrainingPage() {
  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#8b5cf6]/20 rounded-2xl mb-4">
            <Gauge className="w-8 h-8 text-[#8b5cf6]" />
          </div>
          <h1 className="text-3xl font-bold text-white">Training Center</h1>
          <p className="text-[#a1a1aa] mt-1 max-w-md mx-auto">
            Structured exercises to improve specific typing skills
          </p>
        </div>

        {/* Training Modes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trainingModes.map((mode) => {
            const Icon = mode.icon;

            return (
              <Link key={mode.id} to={`/training/${mode.id}`}>
                <Card
                  variant="bordered"
                  padding="lg"
                  className="group hover:border-[#3a3a3a] transition-all duration-200 cursor-pointer h-full"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"
                      style={{ backgroundColor: `${mode.color}20` }}
                    >
                      <Icon className="w-6 h-6" style={{ color: mode.color }} />
                    </div>
                    <Badge variant={difficultyColors[mode.difficulty]} size="sm">
                      {mode.difficulty}
                    </Badge>
                  </div>

                  <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-[#8b5cf6] transition-colors">
                    {mode.title}
                  </h3>
                  <p className="text-sm text-[#a1a1aa] mb-4">{mode.description}</p>

                  {mode.progress !== undefined ? (
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-[#71717a]">Progress</span>
                        <span className="text-white">{mode.progress}%</span>
                      </div>
                      <Progress value={mode.progress} size="sm" />
                    </div>
                  ) : (
                    <div className="flex items-center text-sm text-[#8b5cf6] group-hover:translate-x-1 transition-transform">
                      Start Training <ArrowRight className="w-4 h-4 ml-1" />
                    </div>
                  )}
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Tips Section */}
        <Card variant="bordered" padding="lg" className="mt-12">
          <h3 className="text-lg font-semibold text-white mb-4">Training Tips</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-[#22c55e]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-[#22c55e] font-bold">1</span>
              </div>
              <div>
                <h4 className="font-medium text-white">Start with Fundamentals</h4>
                <p className="text-sm text-[#a1a1aa]">
                  Master the home row before moving to other keys
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-[#3b82f6]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-[#3b82f6] font-bold">2</span>
              </div>
              <div>
                <h4 className="font-medium text-white">Accuracy Over Speed</h4>
                <p className="text-sm text-[#a1a1aa]">
                  Focus on hitting the right keys first, speed will follow
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-[#f59e0b]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-[#f59e0b] font-bold">3</span>
              </div>
              <div>
                <h4 className="font-medium text-white">Practice Regularly</h4>
                <p className="text-sm text-[#a1a1aa]">
                  Short daily sessions are better than long weekly ones
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-[#8b5cf6]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-[#8b5cf6] font-bold">4</span>
              </div>
              <div>
                <h4 className="font-medium text-white">Take Breaks</h4>
                <p className="text-sm text-[#a1a1aa]">
                  Rest your hands and eyes to prevent strain
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
}

export { TrainingPage };
