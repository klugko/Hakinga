import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface StreakFireProps {
  intensity: number; // 0-100, based on combo/streak
  active: boolean;
  position?: 'bottom' | 'sides' | 'border';
  className?: string;
}

export function StreakFire({
  intensity,
  active,
  position = 'bottom',
  className,
}: StreakFireProps) {
  const particleCount = Math.floor(intensity / 10);

  if (!active || intensity === 0) return null;

  const getColor = () => {
    if (intensity >= 80) return '#EC4899'; // Pink (legendary)
    if (intensity >= 60) return '#EF4444'; // Red (unstoppable)
    if (intensity >= 40) return '#F97316'; // Orange (incredible)
    if (intensity >= 20) return '#8B5CF6'; // Purple (amazing)
    return '#22C55E'; // Green (nice)
  };

  const color = getColor();

  const positionClasses = {
    bottom: 'bottom-0 left-0 right-0 h-8 flex justify-center',
    sides: 'inset-y-0 left-0 right-0',
    border: 'inset-0',
  };

  return (
    <div
      className={cn(
        'absolute pointer-events-none overflow-hidden',
        positionClasses[position],
        className
      )}
    >
      {position === 'bottom' && (
        <div className="relative w-full h-full flex justify-center items-end gap-1">
          {[...Array(particleCount)].map((_, i) => (
            <div
              key={i}
              className="w-4 h-6 rounded-t-full animate-fire-flicker"
              style={{
                background: `linear-gradient(to top, ${color}, ${color}00)`,
                animationDelay: `${i * 50}ms`,
                opacity: 0.8 - i * 0.05,
                transform: `scaleY(${0.5 + Math.random() * 0.5})`,
              }}
            />
          ))}
        </div>
      )}

      {position === 'sides' && (
        <>
          {/* Left side */}
          <div className="absolute left-0 top-0 bottom-0 w-4 flex flex-col justify-center">
            {[...Array(Math.ceil(particleCount / 2))].map((_, i) => (
              <div
                key={`l-${i}`}
                className="w-3 h-4 rounded-r-full animate-fire-flicker"
                style={{
                  background: `linear-gradient(to right, ${color}, ${color}00)`,
                  animationDelay: `${i * 80}ms`,
                  marginTop: 4,
                }}
              />
            ))}
          </div>
          {/* Right side */}
          <div className="absolute right-0 top-0 bottom-0 w-4 flex flex-col justify-center items-end">
            {[...Array(Math.ceil(particleCount / 2))].map((_, i) => (
              <div
                key={`r-${i}`}
                className="w-3 h-4 rounded-l-full animate-fire-flicker"
                style={{
                  background: `linear-gradient(to left, ${color}, ${color}00)`,
                  animationDelay: `${i * 80 + 40}ms`,
                  marginTop: 4,
                }}
              />
            ))}
          </div>
        </>
      )}

      {position === 'border' && (
        <div
          className="absolute inset-0 rounded-lg animate-pulse"
          style={{
            boxShadow: `inset 0 0 ${intensity / 5}px ${color}`,
          }}
        />
      )}

      <style>{`
        @keyframes fire-flicker {
          0%, 100% {
            transform: scaleY(1) scaleX(1);
            opacity: 0.8;
          }
          25% {
            transform: scaleY(1.3) scaleX(0.9);
            opacity: 1;
          }
          50% {
            transform: scaleY(0.8) scaleX(1.1);
            opacity: 0.6;
          }
          75% {
            transform: scaleY(1.1) scaleX(0.95);
            opacity: 0.9;
          }
        }
        .animate-fire-flicker {
          animation: fire-flicker 0.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

export default StreakFire;
