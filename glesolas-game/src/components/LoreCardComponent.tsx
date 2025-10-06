import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { LoreCard } from '@/types/game';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dices, Sparkles, Swords, X } from 'lucide-react';
import { Button } from './ui/button';

interface LoreCardProps {
  card: LoreCard;
  selected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

export function LoreCardComponent({ card, selected, onClick, disabled }: LoreCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [longPressTriggered, setLongPressTriggered] = useState(false);
  const pressTimer = useRef<NodeJS.Timeout | null>(null);

  const rarityColors = {
    Common: 'border-gray-500',
    Uncommon: 'border-green-500',
    Rare: 'border-blue-500',
    Legendary: 'border-primary',
  };

  const handlePressStart = () => {
    setLongPressTriggered(false);
    pressTimer.current = setTimeout(() => {
      setLongPressTriggered(true);
      setShowDetails(true);
    }, 500); // 500ms for long press
  };

  const handlePressEnd = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  };

  const handleClick = () => {
    if (!longPressTriggered && onClick && !disabled) {
      onClick();
    }
    setLongPressTriggered(false);
  };

  useEffect(() => {
    return () => {
      if (pressTimer.current) {
        clearTimeout(pressTimer.current);
      }
    };
  }, []);

  return (
    <>
      <motion.div
        whileHover={{ scale: disabled ? 1 : 1.03, rotate: disabled ? 0 : 1 }}
        whileTap={{ scale: disabled ? 1 : 0.97 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className="touch-manipulation"
        onMouseDown={handlePressStart}
        onMouseUp={handlePressEnd}
        onMouseLeave={handlePressEnd}
        onTouchStart={handlePressStart}
        onTouchEnd={handlePressEnd}
        onClick={handleClick}
      >
        <Card
          className={`
            select-none instant-feedback snappy-transition border-2 min-h-[160px] overflow-hidden
            ${!disabled ? 'cursor-pointer' : ''}
            ${selected ? 'ring-4 ring-primary shadow-lg shadow-primary/50 scale-[1.02]' : ''}
            ${rarityColors[card.rarity]}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl active:scale-[0.98]'}
          `}
        >
          {card.art && (
            <div className="relative h-32 w-full overflow-hidden bg-muted">
              <img
                src={card.art}
                alt={card.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
            </div>
          )}
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

      {/* Card Details Modal */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
            onClick={() => setShowDetails(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <Card className={`border-2 ${rarityColors[card.rarity]}`}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-1">{card.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{card.type} • {card.rarity}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowDetails(false)}
                      className="flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {card.art && (
                    <div className="relative rounded-lg overflow-hidden bg-muted">
                      <img
                        src={card.art}
                        alt={card.name}
                        className="w-full h-64 object-cover"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-3">
                    <div className="flex flex-col items-center gap-1 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                      <Swords className="w-5 h-5 text-red-400" />
                      <span className="text-xs text-muted-foreground">Might</span>
                      <span className="text-2xl font-bold font-mono">{card.stats.might}</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <Dices className="w-5 h-5 text-green-400" />
                      <span className="text-xs text-muted-foreground">Fortune</span>
                      <span className="text-2xl font-bold font-mono">{card.stats.fortune}</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                      <Sparkles className="w-5 h-5 text-blue-400" />
                      <span className="text-xs text-muted-foreground">Cunning</span>
                      <span className="text-2xl font-bold font-mono">{card.stats.cunning}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-semibold">Flavor Text</p>
                    <p className="text-sm text-muted-foreground italic leading-relaxed">
                      "{card.flavor}"
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
