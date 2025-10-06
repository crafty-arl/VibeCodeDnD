import { motion } from 'framer-motion';
import { Dices, Sparkles, Swords, Target, Key, TrendingUp } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import type { SkillPath, CardStats } from '@/types/game';

interface StatsDisplayProps {
  might: number;
  fortune: number;
  cunning: number;
  requirements?: {
    might_req?: number;
    fortune_req?: number;
    cunning_req?: number;
  };
  keyStat?: SkillPath; // The stat that gives full rewards
  playerBonuses?: CardStats; // Player level bonuses
}

export function StatsDisplay({ might, fortune, cunning, requirements, keyStat, playerBonuses }: StatsDisplayProps) {
  const StatBar = ({
    label,
    value,
    required,
    icon: Icon,
    color,
    isKey,
    bonus,
  }: {
    label: string;
    value: number;
    required?: number;
    icon: any;
    color: string;
    isKey?: boolean;
    bonus?: number;
  }) => {
    const meets = required ? value >= required : true;
    const percentage = required ? Math.min((value / required) * 100, 100) : 0;
    const cardValue = bonus ? value - bonus : value;

    return (
      <div className={`space-y-1 ${isKey ? 'relative p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30' : ''}`}>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Icon className={`w-4 h-4 ${color}`} />
            <span className="font-semibold">{label}</span>
            {isKey && (
              <div className="flex items-center gap-1 text-yellow-400" title="Key Stat: Full rewards!">
                <Key className="w-3 h-3" />
                <span className="text-xs font-bold">KEY</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold">{value}</span>
            {bonus && bonus > 0 && (
              <span className="text-xs text-accent flex items-center gap-1" title={`Cards: ${cardValue} + Player Bonus: ${bonus}`}>
                <TrendingUp className="w-3 h-3" />
                <span>(+{bonus})</span>
              </span>
            )}
            {required && (
              <>
                <span className="text-muted-foreground">/</span>
                <div className="flex items-center gap-1">
                  <Target className="w-3 h-3" />
                  <span className="font-mono text-muted-foreground">{required}</span>
                </div>
              </>
            )}
          </div>
        </div>
        {required && (
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className={`h-full ${meets ? (isKey ? 'bg-yellow-400' : 'bg-accent') : 'bg-destructive'}`}
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="bg-secondary/50 backdrop-blur">
      <CardContent className="p-4 space-y-3">
        {keyStat && (
          <div className="mb-2 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded text-center">
            <p className="text-xs text-yellow-400 font-semibold">
              🔑 Key Stat: <span className="capitalize">{keyStat}</span> grants full rewards!
            </p>
          </div>
        )}
        <StatBar
          label="Might"
          value={might}
          required={requirements?.might_req}
          icon={Swords}
          color="text-red-400"
          isKey={keyStat === 'might'}
          bonus={playerBonuses?.might}
        />
        <StatBar
          label="Fortune"
          value={fortune}
          required={requirements?.fortune_req}
          icon={Dices}
          color="text-green-400"
          isKey={keyStat === 'fortune'}
          bonus={playerBonuses?.fortune}
        />
        <StatBar
          label="Cunning"
          value={cunning}
          required={requirements?.cunning_req}
          icon={Sparkles}
          color="text-blue-400"
          isKey={keyStat === 'cunning'}
          bonus={playerBonuses?.cunning}
        />
      </CardContent>
    </Card>
  );
}
