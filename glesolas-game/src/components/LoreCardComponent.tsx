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
      whileHover={{ scale: disabled ? 1 : 1.03, rotate: disabled ? 0 : 1 }}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="touch-manipulation"
    >
      <Card
        className={`
          select-none instant-feedback snappy-transition border-2 min-h-[160px]
          ${!disabled ? 'cursor-pointer' : ''}
          ${selected ? 'ring-4 ring-primary shadow-lg shadow-primary/50 scale-[1.02]' : ''}
          ${rarityColors[card.rarity]}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl active:scale-[0.98]'}
        `}
        onClick={disabled ? undefined : onClick}
      >
        <CardHeader className="pb-2 pt-3 px-3">
          <CardTitle className="text-base md:text-lg flex items-center justify-between gap-2">
            <span className="truncate">{card.name}</span>
            <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">{card.type}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 px-3 pb-3">
          <div className="flex justify-between text-sm">
            <div className="flex items-center gap-1">
              <Swords className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span className="font-mono font-bold">{card.stats.might}</span>
            </div>
            <div className="flex items-center gap-1">
              <Dices className="w-4 h-4 text-green-400 flex-shrink-0" />
              <span className="font-mono font-bold">{card.stats.fortune}</span>
            </div>
            <div className="flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-blue-400 flex-shrink-0" />
              <span className="font-mono font-bold">{card.stats.cunning}</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground italic leading-relaxed line-clamp-3">
            "{card.flavor}"
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
