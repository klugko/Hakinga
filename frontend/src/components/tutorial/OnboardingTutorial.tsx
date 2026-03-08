import { useState, useEffect } from 'react';
import {
  X,
  ChevronRight,
  ChevronLeft,
  Keyboard,
  Trophy,
  Users,
  Target,
  Zap,
  BarChart2,
  CheckCircle
} from 'lucide-react';

interface TutorialStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  highlight?: string;
  action?: string;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 1,
    title: "Welcome to Hakinga!",
    description: "Your journey to becoming a typing master starts here. Let's take a quick tour of the features that will help you improve your typing speed and accuracy.",
    icon: <Keyboard className="w-12 h-12 text-accent-purple" />,
  },
  {
    id: 2,
    title: "Solo Training",
    description: "Start with solo sessions to practice at your own pace. Choose from different difficulty levels and text types including quotes, paragraphs, and even code snippets.",
    icon: <Target className="w-12 h-12 text-green-500" />,
    highlight: "training",
    action: "Try starting a solo session",
  },
  {
    id: 3,
    title: "Compete with Others",
    description: "Challenge yourself against other typists in real-time races. Join the public queue for automatic matchmaking or create private sessions to race with friends.",
    icon: <Users className="w-12 h-12 text-blue-500" />,
    highlight: "competition",
    action: "Join the competition queue",
  },
  {
    id: 4,
    title: "Track Your Progress",
    description: "View detailed statistics about your performance. See your WPM, accuracy trends, and identify areas for improvement with our analytics dashboard.",
    icon: <BarChart2 className="w-12 h-12 text-yellow-500" />,
    highlight: "statistics",
    action: "Check your statistics",
  },
  {
    id: 5,
    title: "Climb the Leaderboard",
    description: "Compete for the top spots on our global and weekly leaderboards. Add friends to see how you compare against them.",
    icon: <Trophy className="w-12 h-12 text-amber-500" />,
    highlight: "leaderboard",
    action: "View the leaderboard",
  },
  {
    id: 6,
    title: "Earn Achievements",
    description: "Unlock achievements as you hit milestones. Earn XP, level up, and show off your progress with badges and ranks.",
    icon: <Zap className="w-12 h-12 text-purple-500" />,
    highlight: "profile",
    action: "View your achievements",
  },
  {
    id: 7,
    title: "You're Ready!",
    description: "That's everything you need to know to get started. Remember: accuracy before speed! Good luck on your typing journey.",
    icon: <CheckCircle className="w-12 h-12 text-green-500" />,
  },
];

interface OnboardingTutorialProps {
  onComplete: () => void;
  onSkip: () => void;
}

export function OnboardingTutorial({ onComplete, onSkip }: OnboardingTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const step = TUTORIAL_STEPS[currentStep];
  const isLastStep = currentStep === TUTORIAL_STEPS.length - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    localStorage.setItem('hakinga_tutorial_completed', 'true');
    onComplete();
  };

  const handleSkip = () => {
    setIsVisible(false);
    localStorage.setItem('hakinga_tutorial_completed', 'true');
    onSkip();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Tutorial Card */}
      <div className="relative z-10 w-full max-w-lg mx-4">
        <div className="bg-surface-800 rounded-xl border border-surface-600 overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-surface-600">
            <div className="flex items-center gap-2">
              <span className="text-sm text-text-secondary">
                Step {currentStep + 1} of {TUTORIAL_STEPS.length}
              </span>
            </div>
            <button
              onClick={handleSkip}
              className="p-1 rounded-lg hover:bg-surface-700 text-text-secondary hover:text-text-primary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-8 text-center">
            <div className="flex justify-center mb-6">
              {step.icon}
            </div>

            <h2 className="text-2xl font-bold text-text-primary mb-4">
              {step.title}
            </h2>

            <p className="text-text-secondary leading-relaxed mb-6">
              {step.description}
            </p>

            {step.action && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-surface-700 rounded-lg text-sm text-accent-purple">
                <Target className="w-4 h-4" />
                {step.action}
              </div>
            )}
          </div>

          {/* Progress Dots */}
          <div className="flex justify-center gap-2 pb-4">
            {TUTORIAL_STEPS.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentStep
                    ? 'w-6 bg-accent-purple'
                    : index < currentStep
                    ? 'bg-accent-purple/50'
                    : 'bg-surface-600'
                }`}
              />
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-4 border-t border-surface-600 bg-surface-700/50">
            <button
              onClick={handlePrev}
              disabled={isFirstStep}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isFirstStep
                  ? 'text-text-tertiary cursor-not-allowed'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-600'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>

            <button
              onClick={handleSkip}
              className="text-sm text-text-tertiary hover:text-text-secondary transition-colors"
            >
              Skip Tutorial
            </button>

            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2 bg-accent-purple hover:bg-accent-purple/90 text-white rounded-lg transition-colors"
            >
              {isLastStep ? 'Get Started' : 'Next'}
              {!isLastStep && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook to manage tutorial state
export function useTutorial() {
  const [showTutorial, setShowTutorial] = useState(false);
  const [hasCompletedTutorial, setHasCompletedTutorial] = useState(true);

  useEffect(() => {
    const completed = localStorage.getItem('hakinga_tutorial_completed');
    if (!completed) {
      setHasCompletedTutorial(false);
      setShowTutorial(true);
    }
  }, []);

  const startTutorial = () => {
    setShowTutorial(true);
  };

  const completeTutorial = () => {
    setShowTutorial(false);
    setHasCompletedTutorial(true);
  };

  const resetTutorial = () => {
    localStorage.removeItem('hakinga_tutorial_completed');
    setHasCompletedTutorial(false);
    setShowTutorial(true);
  };

  return {
    showTutorial,
    hasCompletedTutorial,
    startTutorial,
    completeTutorial,
    resetTutorial,
  };
}

// Tooltip component for in-context help
interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export function Tooltip({ content, children, position = 'top' }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          className={`absolute z-50 px-3 py-2 text-sm bg-surface-700 text-text-primary rounded-lg shadow-lg whitespace-nowrap ${positionClasses[position]}`}
        >
          {content}
          <div
            className={`absolute w-2 h-2 bg-surface-700 transform rotate-45 ${
              position === 'top' ? 'top-full left-1/2 -translate-x-1/2 -mt-1' :
              position === 'bottom' ? 'bottom-full left-1/2 -translate-x-1/2 -mb-1' :
              position === 'left' ? 'left-full top-1/2 -translate-y-1/2 -ml-1' :
              'right-full top-1/2 -translate-y-1/2 -mr-1'
            }`}
          />
        </div>
      )}
    </div>
  );
}

// Feature highlight component
interface FeatureHighlightProps {
  feature: string;
  title: string;
  description: string;
  children: React.ReactNode;
  active?: boolean;
}

export function FeatureHighlight({
  feature,
  title,
  description,
  children,
  active = false,
}: FeatureHighlightProps) {
  if (!active) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      <div className="absolute -inset-2 rounded-xl border-2 border-accent-purple animate-pulse pointer-events-none" />
      <div className="absolute -top-16 left-1/2 -translate-x-1/2 z-50 w-64">
        <div className="bg-accent-purple text-white p-3 rounded-lg shadow-lg">
          <h4 className="font-semibold mb-1">{title}</h4>
          <p className="text-sm opacity-90">{description}</p>
        </div>
        <div className="w-3 h-3 bg-accent-purple transform rotate-45 mx-auto -mt-1.5" />
      </div>
      {children}
    </div>
  );
}
