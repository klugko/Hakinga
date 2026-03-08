import { useEffect, useRef, useCallback, useState } from 'react';

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

function createParticle(
  id: number,
  width: number,
  colors: string[]
): Particle {
  const shapes: Array<'square' | 'circle' | 'triangle'> = ['square', 'circle', 'triangle'];
  return {
    id,
    x: (id * 17 + 7) % width,
    y: -20,
    rotation: (id * 37) % 360,
    color: colors[id % colors.length],
    size: 8 + ((id * 13) % 8),
    velocityX: ((id * 23) % 10 - 5),
    velocityY: 3 + ((id * 11) % 5),
    rotationSpeed: ((id * 19) % 15 - 7.5),
    shape: shapes[id % 3],
  };
}

export function Confetti({
  active,
  duration = 3000,
  particleCount = 50,
  colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'],
}: ConfettiProps) {
  const [, setRenderKey] = useState(0);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const updateParticles = useCallback(() => {
    particlesRef.current = particlesRef.current
      .map(p => ({
        ...p,
        x: p.x + p.velocityX,
        y: p.y + p.velocityY,
        rotation: p.rotation + p.rotationSpeed,
        velocityY: p.velocityY + 0.2,
      }))
      .filter(p => p.y < window.innerHeight + 50);

    setRenderKey(k => k + 1);
  }, []);

  useEffect(() => {
    if (active) {
      const width = window.innerWidth;
      particlesRef.current = Array.from({ length: particleCount }, (_, i) =>
        createParticle(i, width, colors)
      );
      startTimeRef.current = Date.now();
      setRenderKey(0);

      const animate = () => {
        const elapsed = Date.now() - startTimeRef.current;

        if (elapsed > duration) {
          particlesRef.current = [];
          setRenderKey(k => k + 1);
          return;
        }

        updateParticles();
        animationRef.current = requestAnimationFrame(animate);
      };

      animationRef.current = requestAnimationFrame(animate);

      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    } else {
      particlesRef.current = [];
      setRenderKey(k => k + 1);
    }
  }, [active, colors, duration, particleCount, updateParticles]);

  const particles = particlesRef.current;

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
