import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface ErrorShakeProps {
  trigger: boolean;
  children: React.ReactNode;
  intensity?: 'light' | 'medium' | 'strong';
  className?: string;
}

export function ErrorShake({
  trigger,
  children,
  intensity = 'medium',
  className,
}: ErrorShakeProps) {
  const [isShaking, setIsShaking] = useState(false);

  useEffect(() => {
    if (trigger) {
      setIsShaking(true);
      const timer = setTimeout(() => setIsShaking(false), 300);
      return () => clearTimeout(timer);
    }
  }, [trigger]);

  const intensityClasses = {
    light: 'animate-shake-light',
    medium: 'animate-shake-medium',
    strong: 'animate-shake-strong',
  };

  return (
    <div className={cn(isShaking && intensityClasses[intensity], className)}>
      {children}

      <style>{`
        @keyframes shake-light {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-2px); }
          75% { transform: translateX(2px); }
        }
        @keyframes shake-medium {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-4px); }
          40% { transform: translateX(4px); }
          60% { transform: translateX(-3px); }
          80% { transform: translateX(3px); }
        }
        @keyframes shake-strong {
          0%, 100% { transform: translateX(0); }
          10% { transform: translateX(-6px) rotate(-1deg); }
          20% { transform: translateX(6px) rotate(1deg); }
          30% { transform: translateX(-5px) rotate(-0.5deg); }
          40% { transform: translateX(5px) rotate(0.5deg); }
          50% { transform: translateX(-4px); }
          60% { transform: translateX(4px); }
          70% { transform: translateX(-3px); }
          80% { transform: translateX(3px); }
          90% { transform: translateX(-2px); }
        }
        .animate-shake-light { animation: shake-light 0.2s ease-in-out; }
        .animate-shake-medium { animation: shake-medium 0.3s ease-in-out; }
        .animate-shake-strong { animation: shake-strong 0.4s ease-in-out; }
      `}</style>
    </div>
  );
}

export default ErrorShake;
