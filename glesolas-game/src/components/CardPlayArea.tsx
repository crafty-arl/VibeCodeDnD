import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import type { LoreCard } from '../types/game';
import { LoreCardComponent } from './LoreCardComponent';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface CardPlayAreaProps {
  selectedCards: LoreCard[];
  maxCards: number;
  onRemoveCard: (card: LoreCard) => void;
  onCardClick?: (card: LoreCard) => void;
}

export function CardPlayArea({ selectedCards, maxCards, onRemoveCard, onCardClick }: CardPlayAreaProps) {
  const emptySlots = maxCards - selectedCards.length;

  return (
    <Card className="border-primary/50 bg-primary/5">
      <CardHeader>
        <CardTitle className="text-sm flex items-center justify-between">
          <span>Play Area ({selectedCards.length}/{maxCards})</span>
          {selectedCards.length === maxCards && (
            <span className="text-xs text-primary font-normal">✓ Ready to play!</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3 min-h-[200px]">
          {/* Selected cards */}
          {selectedCards.map((card) => (
            <motion.div
              key={card.id}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="relative"
              onClick={() => onCardClick?.(card)}
            >
              <LoreCardComponent card={card} selected />

              {/* Remove button */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveCard(card);
                }}
                className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full w-6 h-6 flex items-center justify-center shadow-lg z-10 instant-feedback"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </motion.div>
          ))}

          {/* Empty slots */}
          {Array.from({ length: emptySlots }).map((_, index) => (
            <motion.div
              key={`empty-${index}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="border-2 border-dashed border-muted-foreground/30 rounded-lg flex items-center justify-center min-h-[180px] bg-muted/10"
            >
              <div className="text-center text-muted-foreground/50 p-4">
                <div className="text-4xl mb-2">+</div>
                <div className="text-xs hidden sm:block">Drag card here</div>
              </div>
            </motion.div>
          ))}
        </div>

        {selectedCards.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-sm text-muted-foreground mt-4"
          >
            👆 Drag cards from your hand to play them
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
