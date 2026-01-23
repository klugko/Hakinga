import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Keyboard, Gauge, FileText, Zap, Clock, Target, Play } from 'lucide-react';
import { Layout } from '@/components/layout';
import { Button, Card, Badge } from '@/components/ui';
import { cn } from '@/lib/utils';

type Difficulty = 'easy' | 'medium' | 'hard';
type Length = 'short' | 'medium' | 'long';

interface DifficultyOption {
  value: Difficulty;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
}

interface LengthOption {
  value: Length;
  label: string;
  words: string;
  time: string;
}

const difficulties: DifficultyOption[] = [
  {
    value: 'easy',
    label: 'Easy',
    description: 'Common words, simple sentences',
    icon: Target,
    color: '#22c55e',
  },
  {
    value: 'medium',
    label: 'Medium',
    description: 'Mixed vocabulary, varied punctuation',
    icon: Gauge,
    color: '#f59e0b',
  },
  {
    value: 'hard',
    label: 'Hard',
    description: 'Complex words, technical terms',
    icon: Zap,
    color: '#ef4444',
  },
];

const lengths: LengthOption[] = [
  { value: 'short', label: 'Short', words: '~25 words', time: '~30s' },
  { value: 'medium', label: 'Medium', words: '~90 words', time: '~1-2min' },
  { value: 'long', label: 'Long', words: '~180 words', time: '~3-4min' },
];

function SoloPracticePage() {
  const navigate = useNavigate();
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('medium');
  const [selectedLength, setSelectedLength] = useState<Length>('medium');

  const handleStartSession = () => {
    navigate(`/solo/session?difficulty=${selectedDifficulty}&length=${selectedLength}`);
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#8b5cf6]/20 rounded-2xl mb-4">
            <Keyboard className="w-8 h-8 text-[#8b5cf6]" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Solo Practice</h1>
          <p className="text-[#a1a1aa] max-w-md mx-auto">
            Improve your typing skills at your own pace. Choose your difficulty and text length to get started.
          </p>
        </div>

        {/* Difficulty Selection */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Gauge className="w-5 h-5 text-[#8b5cf6]" />
            Select Difficulty
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {difficulties.map((difficulty) => {
              const Icon = difficulty.icon;
              const isSelected = selectedDifficulty === difficulty.value;

              return (
                <button
                  key={difficulty.value}
                  onClick={() => setSelectedDifficulty(difficulty.value)}
                  className={cn(
                    'p-4 rounded-xl border-2 text-left transition-all duration-200',
                    isSelected
                      ? 'border-[#8b5cf6] bg-[#8b5cf6]/10'
                      : 'border-[#2a2a2a] bg-[#1a1a1a] hover:border-[#3a3a3a]'
                  )}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${difficulty.color}20` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: difficulty.color }} />
                    </div>
                    <div>
                      <div className="font-semibold text-white">{difficulty.label}</div>
                      {isSelected && (
                        <Badge variant="primary" size="sm">Selected</Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-[#a1a1aa]">{difficulty.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Length Selection */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#8b5cf6]" />
            Select Length
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {lengths.map((length) => {
              const isSelected = selectedLength === length.value;

              return (
                <button
                  key={length.value}
                  onClick={() => setSelectedLength(length.value)}
                  className={cn(
                    'p-4 rounded-xl border-2 text-left transition-all duration-200',
                    isSelected
                      ? 'border-[#8b5cf6] bg-[#8b5cf6]/10'
                      : 'border-[#2a2a2a] bg-[#1a1a1a] hover:border-[#3a3a3a]'
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-white">{length.label}</span>
                    {isSelected && <Badge variant="primary" size="sm">Selected</Badge>}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-[#a1a1aa]">
                    <span className="flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      {length.words}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {length.time}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Summary & Start */}
        <Card variant="bordered" padding="lg" className="mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-white mb-1">Your Session</h3>
              <p className="text-[#a1a1aa]">
                <span className="capitalize">{selectedDifficulty}</span> difficulty,{' '}
                <span className="capitalize">{selectedLength}</span> text
              </p>
            </div>
            <Button
              variant="primary"
              size="lg"
              leftIcon={<Play className="w-5 h-5" />}
              onClick={handleStartSession}
            >
              Start Typing
            </Button>
          </div>
        </Card>

        {/* Tips */}
        <Card variant="bordered" padding="md">
          <h3 className="font-semibold text-white mb-3">Tips for Better Typing</h3>
          <ul className="space-y-2 text-sm text-[#a1a1aa]">
            <li className="flex items-start gap-2">
              <span className="text-[#8b5cf6]">1.</span>
              Keep your fingers on the home row (ASDF - JKL;)
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#8b5cf6]">2.</span>
              Focus on accuracy first, speed will come with practice
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#8b5cf6]">3.</span>
              Don't look at the keyboard - trust your muscle memory
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#8b5cf6]">4.</span>
              Take breaks to avoid fatigue - quality over quantity
            </li>
          </ul>
        </Card>
      </div>
    </Layout>
  );
}

export { SoloPracticePage };
