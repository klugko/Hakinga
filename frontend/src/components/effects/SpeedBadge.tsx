import { cn } from '@/lib/utils';

interface SpeedBadgeProps {
  wpm: number;
  showAnimation?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

type SpeedTier = {
  name: string;
  minWpm: number;
  color: string;
  bgColor: string;
  icon: string;
};

const SPEED_TIERS: SpeedTier[] = [
  { name: 'Beginner', minWpm: 0, color: '#6B7280', bgColor: '#6B728020', icon: '🐢' },
  { name: 'Learning', minWpm: 30, color: '#22C55E', bgColor: '#22C55E20', icon: '📚' },
  { name: 'Average', minWpm: 50, color: '#3B82F6', bgColor: '#3B82F620', icon: '⌨️' },
  { name: 'Fast', minWpm: 70, color: '#8B5CF6', bgColor: '#8B5CF620', icon: '⚡' },
  { name: 'Pro', minWpm: 90, color: '#F97316', bgColor: '#F9731620', icon: '🔥' },
  { name: 'Expert', minWpm: 110, color: '#EF4444', bgColor: '#EF444420', icon: '💎' },
  { name: 'Master', minWpm: 130, color: '#EC4899', bgColor: '#EC489920', icon: '🏆' },
  { name: 'Legend', minWpm: 150, color: '#FFD700', bgColor: '#FFD70030', icon: '👑' },
];

function getSpeedTier(wpm: number): SpeedTier {
  for (let i = SPEED_TIERS.length - 1; i >= 0; i--) {
    if (wpm >= SPEED_TIERS[i].minWpm) {
      return SPEED_TIERS[i];
    }
  }
  return SPEED_TIERS[0];
}

export function SpeedBadge({
  wpm,
  showAnimation = true,
  size = 'md',
  className,
}: SpeedBadgeProps) {
  const tier = getSpeedTier(wpm);

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-3 py-1 text-sm gap-1.5',
    lg: 'px-4 py-2 text-base gap-2',
  };

  const isHighTier = wpm >= 90;

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full font-semibold transition-all duration-300',
        sizeClasses[size],
        showAnimation && isHighTier && 'animate-pulse',
        className
      )}
      style={{
        backgroundColor: tier.bgColor,
        color: tier.color,
        border: `1px solid ${tier.color}40`,
        boxShadow: isHighTier ? `0 0 10px ${tier.color}40` : undefined,
      }}
    >
      <span>{tier.icon}</span>
      <span>{tier.name}</span>
    </div>
  );
}

export default SpeedBadge;
