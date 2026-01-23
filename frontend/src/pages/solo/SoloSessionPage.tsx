import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useTypingSession } from '@/hooks/useTypingSession';
import { TypingArea, TypingStatsBar } from '@/components/typing/TypingArea';
import { SessionResults } from '@/components/typing/SessionResults';
import { Button } from '@/components/ui/Button';
import { Modal, ModalActions } from '@/components/ui/Modal';
import { LoadingCard } from '@/components/ui/Spinner';
import { useToast } from '@/contexts/ToastContext';
import { ArrowLeft, X, RotateCcw } from 'lucide-react';
import type { Difficulty, TextLength, TextCategory, SessionResult } from '@/types';

const SAMPLE_TEXTS: Record<Difficulty, string[]> = {
  easy: [
    'Le chat dort sur le tapis. Il fait beau dehors. Les oiseaux chantent dans les arbres. La vie est belle quand on prend le temps de regarder autour de soi.',
    'Je mange une pomme rouge. Elle est tres sucree. Les fruits sont bons pour la sante. Il faut en manger chaque jour pour rester en forme.',
  ],
  medium: [
    'La programmation informatique est un art qui demande patience et precision. Chaque ligne de code contribue a la creation d\'applications qui facilitent notre quotidien.',
    'L\'intelligence artificielle transforme notre monde a une vitesse incroyable. Les algorithmes apprennent et s\'adaptent, ouvrant de nouvelles possibilites chaque jour.',
  ],
  hard: [
    'L\'implementation d\'algorithmes de machine learning necessites une comprehension approfondie des mathematiques statistiques et de l\'algebre lineaire vectorielle multidimensionnelle.',
    'La cryptographie asymetrique utilise des paires de cles publiques et privees pour securiser les communications electroniques contre les interceptions malveillantes.',
  ],
};

/**
 * Solo typing session page
 */
export function SoloSessionPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { error: showError } = useToast();

  const difficulty = (searchParams.get('difficulty') as Difficulty) || 'medium';
  const length = (searchParams.get('length') as TextLength) || 'medium';
  const _category = searchParams.get('category') as TextCategory | null;

  const [text, setText] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [showAbandonModal, setShowAbandonModal] = useState(false);
  const [sessionResult, setSessionResult] = useState<SessionResult | null>(null);

  useEffect(() => {
    const loadText = async () => {
      setIsLoading(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const texts = SAMPLE_TEXTS[difficulty];
        const randomText = texts[Math.floor(Math.random() * texts.length)];

        let finalText = randomText;
        if (length === 'medium') {
          finalText = randomText + ' ' + texts[(Math.floor(Math.random() * texts.length) + 1) % texts.length];
        } else if (length === 'long') {
          finalText = texts.join(' ') + ' ' + texts.join(' ');
        }

        setText(finalText);
      } catch {
        showError('Erreur lors du chargement du texte');
        navigate('/solo');
      } finally {
        setIsLoading(false);
      }
    };

    loadText();
  }, [difficulty, length, navigate, showError]);

  const handleComplete = useCallback((result: {
    wpm: number;
    accuracy: number;
    duration: number;
    errorsCount: number;
    correctChars: number;
    totalChars: number;
  }) => {
    const sessionResult: SessionResult = {
      wpm: result.wpm,
      accuracy: result.accuracy,
      duration: result.duration,
      errorsCount: result.errorsCount,
      correctChars: result.correctChars,
      totalChars: result.totalChars,
      wpmOverTime: [],
      errorsByChar: [],
    };
    setSessionResult(sessionResult);
  }, []);

  const {
    charStates,
    currentIndex,
    isStarted,
    isFinished,
    currentWpm,
    currentAccuracy,
    progress,
    duration,
    errorsCount,
    handleKeyDown,
    reset,
  } = useTypingSession({
    text,
    onComplete: handleComplete,
  });

  const handleRestart = () => {
    setSessionResult(null);
    reset();
  };

  const handleAbandon = () => {
    setShowAbandonModal(false);
    navigate('/solo');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingCard message="Chargement du texte..." />
      </div>
    );
  }

  if (sessionResult) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <SessionResults result={sessionResult} onRestart={handleRestart} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-40 bg-surface/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <Link
              to="/solo"
              className="flex items-center gap-2 text-text-secondary hover:text-text transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Retour</span>
            </Link>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<RotateCcw className="w-4 h-4" />}
                onClick={handleRestart}
                disabled={!isStarted}
              >
                <span className="hidden sm:inline">Recommencer</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<X className="w-4 h-4" />}
                onClick={() => setShowAbandonModal(true)}
              >
                <span className="hidden sm:inline">Abandonner</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-20 pb-8 px-4">
        <div className="max-w-4xl mx-auto">
          {!isStarted && (
            <div className="text-center mb-8 animate-fade-in">
              <h2 className="text-xl font-semibold text-text mb-2">
                Pret a commencer ?
              </h2>
              <p className="text-text-secondary">
                Commencez a taper pour demarrer le chronometre
              </p>
            </div>
          )}

          <div className="mb-6">
            <TypingStatsBar
              wpm={currentWpm}
              accuracy={currentAccuracy}
              progress={progress}
              duration={duration}
              errorsCount={errorsCount}
            />
          </div>

          <TypingArea
            charStates={charStates}
            currentIndex={currentIndex}
            onKeyDown={handleKeyDown}
            disabled={isFinished}
          />

          {!isStarted && (
            <p className="text-center text-sm text-text-muted mt-4">
              Astuce : Gardez vos doigts sur les touches de base (ASDF JKL;)
            </p>
          )}
        </div>
      </main>

      <Modal
        isOpen={showAbandonModal}
        onClose={() => setShowAbandonModal(false)}
        title="Abandonner la session ?"
        description="Votre progression ne sera pas sauvegardee."
      >
        <ModalActions>
          <Button variant="ghost" onClick={() => setShowAbandonModal(false)}>
            Continuer
          </Button>
          <Button variant="danger" onClick={handleAbandon}>
            Abandonner
          </Button>
        </ModalActions>
      </Modal>
    </div>
  );
}
