import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Gauge, Target, Clock, ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';
import { Layout } from '@/components/layout';
import { TypingArea, Countdown, SessionResults, VirtualKeyboard } from '@/components/typing';
import { Button, Card, Progress, Spinner } from '@/components/ui';
import { useTypingSession } from '@/hooks/useTypingSession';
import { useAuth } from '@/contexts/AuthContext';
import { formatTime } from '@/lib/utils';
import { getRandomQuote } from '@/services/quoteService';
import type { TypingSession, TypingText } from '@/types';

type SessionPhase = 'ready' | 'countdown' | 'typing' | 'completed';

function SoloSessionPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const difficulty = (searchParams.get('difficulty') || 'medium') as 'easy' | 'medium' | 'hard';
  const length = (searchParams.get('length') || 'medium') as 'short' | 'medium' | 'long';

  const [phase, setPhase] = useState<SessionPhase>('ready');
  const [text, setText] = useState<TypingText | null>(null);
  const [sessionResult, setSessionResult] = useState<Partial<TypingSession> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeKey, setActiveKey] = useState<{ key: string; isError: boolean } | null>(null);

  // Load text on mount
  useEffect(() => {
    let cancelled = false;

    async function loadText() {
      setIsLoading(true);
      setLoadError(null);

      try {
        const selectedText = await getRandomQuote(difficulty, length);
        if (!cancelled) {
          setText(selectedText);
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError('Failed to load text. Please try again.');
          console.error('Failed to load text:', error);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadText();

    return () => {
      cancelled = true;
    };
  }, [difficulty, length]);

  // Handle session completion
  const handleComplete = useCallback((result: Partial<TypingSession>) => {
    setSessionResult(result);
    setPhase('completed');
  }, []);

  // Typing session hook
  const {
    characters,
    currentIndex,
    isStarted,
    wpm,
    accuracy,
    elapsedTime,
    handleKeyDown,
    start,
    reset,
    progress,
    lastKeyPress,
  } = useTypingSession({
    text: text?.content || '',
    onComplete: handleComplete,
  });

  // Handle keyboard events
  useEffect(() => {
    if (phase !== 'typing') return;

    const handleKey = (e: KeyboardEvent) => {
      if (!isStarted && phase === 'typing') {
        start();
      }
      handleKeyDown(e);
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [phase, isStarted, start, handleKeyDown]);

  // Update visual keyboard state with auto-reset
  useEffect(() => {
    if (lastKeyPress) {
      setActiveKey({ key: lastKeyPress.key, isError: lastKeyPress.isError });
      const timer = setTimeout(() => setActiveKey(null), 150);
      return () => clearTimeout(timer);
    }
  }, [lastKeyPress]);

  // Handle start button click
  const handleStart = () => {
    setPhase('countdown');
  };

  // Handle countdown complete
  const handleCountdownComplete = () => {
    setPhase('typing');
    start();
  };

  // Handle retry
  const handleRetry = () => {
    reset();
    setSessionResult(null);
    setPhase('countdown');
  };

  // Handle new text
  const handleNewText = async () => {
    setIsLoading(true);
    setLoadError(null);
    reset();
    setSessionResult(null);
    setPhase('ready');

    try {
      const newText = await getRandomQuote(difficulty, length);
      setText(newText);
    } catch (error) {
      setLoadError('Failed to load new text. Please try again.');
      console.error('Failed to load text:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle back to practice selection
  const handleBack = () => {
    navigate('/solo');
  };

  // Loading state
  if (isLoading || !text) {
    return (
      <Layout showFooter={false}>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <Spinner size="lg" />
          <p className="text-[#a1a1aa]">Loading inspiring quote...</p>
        </div>
      </Layout>
    );
  }

  // Error state
  if (loadError) {
    return (
      <Layout showFooter={false}>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <p className="text-[#a1a1aa]">{loadError}</p>
          <Button
            variant="primary"
            leftIcon={<RefreshCw className="w-4 h-4" />}
            onClick={() => {
              setLoadError(null);
              setIsLoading(true);
              getRandomQuote(difficulty, length)
                .then(setText)
                .catch(() => setLoadError('Failed to load text. Please try again.'))
                .finally(() => setIsLoading(false));
            }}
          >
            Try Again
          </Button>
        </div>
      </Layout>
    );
  }

  // Show results
  if (phase === 'completed' && sessionResult) {
    return (
      <Layout showFooter={false}>
        <SessionResults
          wpm={sessionResult.wpm || 0}
          rawWpm={sessionResult.rawWpm || 0}
          accuracy={sessionResult.accuracy || 0}
          errors={sessionResult.errors || 0}
          duration={sessionResult.duration || 0}
          totalCharacters={sessionResult.totalCharacters || 0}
          wpmHistory={sessionResult.wpmHistory || []}
          onRetry={handleRetry}
          onHome={handleBack}
          onNewText={handleNewText}
          personalBest={user?.stats.bestWpm}
        />
      </Layout>
    );
  }

  return (
    <Layout showFooter={false}>
      {/* Countdown overlay */}
      {phase === 'countdown' && <Countdown onComplete={handleCountdownComplete} />}

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            onClick={handleBack}
          >
            Back to Practice
          </Button>

          <div className="flex items-center gap-4 text-sm text-[#a1a1aa]">
            <span className="capitalize">{difficulty}</span>
            <span>/</span>
            <span className="capitalize">{length}</span>
            {text.category && (
              <>
                <span>/</span>
                <span className="text-[#8b5cf6] italic max-w-[200px] truncate" title={text.category}>
                  {text.category}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Stats bar - shown during typing */}
        {phase === 'typing' && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <Card variant="bordered" padding="sm" className="text-center">
              <div className="flex items-center justify-center gap-2">
                <Gauge className="w-4 h-4 text-[#8b5cf6]" />
                <span className="text-2xl font-bold text-white">{wpm}</span>
              </div>
              <p className="text-xs text-[#71717a]">WPM</p>
            </Card>

            <Card variant="bordered" padding="sm" className="text-center">
              <div className="flex items-center justify-center gap-2">
                <Target className="w-4 h-4 text-[#22c55e]" />
                <span className="text-2xl font-bold text-white">{accuracy}%</span>
              </div>
              <p className="text-xs text-[#71717a]">Accuracy</p>
            </Card>

            <Card variant="bordered" padding="sm" className="text-center">
              <div className="flex items-center justify-center gap-2">
                <Clock className="w-4 h-4 text-[#3b82f6]" />
                <span className="text-2xl font-bold text-white">{formatTime(elapsedTime)}</span>
              </div>
              <p className="text-xs text-[#71717a]">Time</p>
            </Card>
          </div>
        )}

        {/* Progress bar - shown during typing */}
        {phase === 'typing' && (
          <div className="mb-6">
            <Progress value={progress} size="sm" />
            <p className="text-xs text-[#71717a] mt-1 text-right">
              {currentIndex} / {text.content.length} characters
            </p>
          </div>
        )}

        {/* Typing area */}
        <TypingArea
          characters={characters}
          currentIndex={currentIndex}
          isActive={phase === 'typing'}
          onFocus={() => {
            if (phase === 'ready') {
              handleStart();
            }
          }}
          className="mb-4"
        />

        {/* Virtual keyboard */}
        {phase === 'typing' && (
          <VirtualKeyboard
            pressedKey={activeKey?.key || null}
            isError={activeKey?.isError || false}
            className="mb-4"
          />
        )}

        {/* Ready state */}
        {phase === 'ready' && (
          <div className="text-center">
            <p className="text-[#a1a1aa] mb-4">
              Click on the text area or press any key to start
            </p>
            <Button variant="primary" size="lg" onClick={handleStart}>
              Start Typing
            </Button>
          </div>
        )}

        {/* Typing hints */}
        {phase === 'typing' && (
          <p className="text-center text-sm text-[#71717a]">
            Press <kbd className="px-1.5 py-0.5 bg-[#1a1a1a] rounded text-xs">Backspace</kbd> to correct mistakes
          </p>
        )}
      </div>
    </Layout>
  );
}

export { SoloSessionPage };
