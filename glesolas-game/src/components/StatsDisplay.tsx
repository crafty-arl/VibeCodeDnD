import { motion } from 'framer-motion';
import { Dices, Sparkles, Swords, Target } from 'lucide-react';
import { Card, CardContent } from './ui/card';

interface StatsDisplayProps {
  might: number;
  fortune: number;
  cunning: number;
  requirements?: {
    might_req?: number;
    fortune_req?: number;
    cunning_req?: number;
  };
}

export function StatsDisplay({ might, fortune, cunning, requirements }: StatsDisplayProps) {
  const StatBar = ({
    label,
    value,
    required,
    icon: Icon,
    color,
  }: {
    label: string;
    value: number;
    required?: number;
    icon: any;
    color: string;
  }) => {
    const meets = required ? value >= required : true;
    const percentage = required ? Math.min((value / required) * 100, 100) : 0;

    return (
      <div className="space-y-1">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Icon className={`w-4 h-4 ${color}`} />
            <span className="font-semibold">{label}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold">{value}</span>
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
              className={`h-full ${meets ? 'bg-accent' : 'bg-destructive'}`}
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
        <StatBar
          label="Might"
          value={might}
          required={requirements?.might_req}
          icon={Swords}
          color="text-red-400"
        />
        <StatBar
          label="Fortune"
          value={fortune}
          required={requirements?.fortune_req}
          icon={Dices}
          color="text-green-400"
        />
        <StatBar
          label="Cunning"
          value={cunning}
          required={requirements?.cunning_req}
          icon={Sparkles}
          color="text-blue-400"
        />
      </CardContent>
    </Card>
  );
}
