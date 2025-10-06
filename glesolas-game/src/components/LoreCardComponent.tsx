import { motion } from 'framer-motion';
import type { LoreCard } from '@/types/game';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dices, Sparkles, Swords } from 'lucide-react';

interface LoreCardProps {
  card: LoreCard;
  selected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

export function LoreCardComponent({ card, selected, onClick, disabled }: LoreCardProps) {
  const rarityColors = {
    Common: 'border-gray-500',
    Uncommon: 'border-green-500',
    Rare: 'border-blue-500',
    Legendary: 'border-primary',
  };

  return (
    <motion.div
      whileHover={{ scale: disabled ? 1 : 1.05, rotate: disabled ? 0 : 2 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <Card
        className={`
          cursor-pointer transition-all border-2
          ${selected ? 'ring-4 ring-primary shadow-lg shadow-primary/50' : ''}
          ${rarityColors[card.rarity]}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl'}
        `}
        onClick={disabled ? undefined : onClick}
      >
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center justify-between">
            <span>{card.name}</span>
            <span className="text-xs text-muted-foreground">{card.type}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <div className="flex items-center gap-1">
              <Swords className="w-4 h-4 text-red-400" />
              <span className="font-mono">{card.stats.might}</span>
            </div>
            <div className="flex items-center gap-1">
              <Dices className="w-4 h-4 text-green-400" />
              <span className="font-mono">{card.stats.fortune}</span>
            </div>
            <div className="flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="font-mono">{card.stats.cunning}</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground italic leading-relaxed">
            "{card.flavor}"
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
