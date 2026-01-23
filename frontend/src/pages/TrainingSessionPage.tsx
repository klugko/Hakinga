import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { Layout } from '@/components/layout';
import { Button, Card } from '@/components/ui';

const trainingTexts: Record<string, string[]> = {
  'home-row': [
    'asdf jkl; asdf jkl; asdf jkl;',
    'fall sad dad lad ask lass flask',
    'salad adds flask sad dad fall',
  ],
  'top-row': [
    'qwerty uiop qwerty uiop',
    'write quote power type your',
    'try quit rope wire pier',
  ],
  'bottom-row': [
    'zxcv bnm zxcv bnm zxcv',
    'mix box zen calm verb',
    'zinc vex mob cab van',
  ],
  numbers: [
    '1234567890 1234567890',
    '123 456 789 012 345 678',
    '2023 2024 2025 100 200 300',
  ],
  punctuation: [
    'Hello, world! How are you?',
    "It's a beautiful day, isn't it?",
    'Price: $19.99 (20% off!)',
  ],
  'speed-drill': [
    'the quick brown fox jumps over the lazy dog',
    'pack my box with five dozen liquor jugs',
    'how vexingly quick daft zebras jump',
  ],
  accuracy: [
    'precision practice perfect patience',
    'deliberate careful measured thoughtful',
    'focus concentrate attention detail',
  ],
  'timed-challenge': [
    'The art of typing is a fundamental skill that can transform your productivity.',
    'Programming is the art of telling a computer what to do.',
    'In the realm of competitive typing, speed and accuracy must coexist.',
  ],
};

function TrainingSessionPage() {
  const navigate = useNavigate();
  const { mode } = useParams<{ mode: string }>();

  const texts = trainingTexts[mode || ''] || trainingTexts['home-row'];

  return (
    <Layout showFooter={false}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => navigate('/training')}
          >
            Back to Training
          </Button>
          <Button
            variant="secondary"
            leftIcon={<RotateCcw className="w-4 h-4" />}
            onClick={() => window.location.reload()}
          >
            Reset
          </Button>
        </div>

        {/* Training Area */}
        <Card variant="bordered" padding="lg" className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-4 capitalize">
            {mode?.replace('-', ' ')} Training
          </h2>
          <div className="space-y-4">
            {texts.map((text, index) => (
              <div
                key={index}
                className="p-4 bg-[#0f0f0f] rounded-lg font-mono text-lg text-[#a1a1aa]"
              >
                {text}
              </div>
            ))}
          </div>
        </Card>

        <p className="text-center text-[#71717a]">
          Training mode coming soon - use Solo Practice for now
        </p>
      </div>
    </Layout>
  );
}

export { TrainingSessionPage };
