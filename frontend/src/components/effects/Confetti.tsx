import { useEffect, useRef, useState } from 'react';

interface ConfettiProps {
  active: boolean;
  duration?: number;
  particleCount?: number;
  colors?: string[];
}

interface Particle {
  id: number;
  x: number;
  y: number;
  rotation: number;
  color: string;
  size: number;
  velocityX: number;
  velocityY: number;
  rotationSpeed: number;
  shape: 'square' | 'circle' | 'triangle';
}

export function Confetti({
  active,
  duration = 3000,
  particleCount = 50,
  colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'],
}: ConfettiProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (active) {
      // Generate particles
      const newParticles: Particle[] = Array.from({ length: particleCount }, (_, i) => ({
        id: i,
        x: Math.random() * window.innerWidth,
        y: -20,
        rotation: Math.random() * 360,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 8 + Math.random() * 8,
        velocityX: (Math.random() - 0.5) * 10,
        velocityY: 3 + Math.random() * 5,
        rotationSpeed: (Math.random() - 0.5) * 15,
        shape: (['square', 'circle', 'triangle'] as const)[Math.floor(Math.random() * 3)],
      }));

      setParticles(newParticles);
      startTimeRef.current = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTimeRef.current;

        if (elapsed > duration) {
          setParticles([]);
          return;
        }

        setParticles(prev =>
          prev
            .map(p => ({
              ...p,
              x: p.x + p.velocityX,
              y: p.y + p.velocityY,
              rotation: p.rotation + p.rotationSpeed,
              velocityY: p.velocityY + 0.2, // gravity
            }))
            .filter(p => p.y < window.innerHeight + 50)
        );

        animationRef.current = requestAnimationFrame(animate);
      };

      animationRef.current = requestAnimationFrame(animate);

      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    } else {
      setParticles([]);
    }
  }, [active, colors, duration, particleCount]);

  if (particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute"
          style={{
            left: particle.x,
            top: particle.y,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.shape !== 'triangle' ? particle.color : 'transparent',
            borderRadius: particle.shape === 'circle' ? '50%' : '0',
            transform: `rotate(${particle.rotation}deg)`,
            borderLeft:
              particle.shape === 'triangle'
                ? `${particle.size / 2}px solid transparent`
                : undefined,
            borderRight:
              particle.shape === 'triangle'
                ? `${particle.size / 2}px solid transparent`
                : undefined,
            borderBottom:
              particle.shape === 'triangle'
                ? `${particle.size}px solid ${particle.color}`
                : undefined,
          }}
        />
      ))}
    </div>
  );
}

export default Confetti;
