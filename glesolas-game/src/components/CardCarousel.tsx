import { motion } from 'framer-motion';
import type { LoreCard } from '@/types/game';
import { LoreCardComponent } from './LoreCardComponent';

interface CardCarouselProps {
  cards: LoreCard[];
  selectedCards?: LoreCard[];
  onCardSelect?: (card: LoreCard) => void;
  disabled?: boolean;
  title?: string;
  subtitle?: string;
  compact?: boolean;
}

export function CardCarousel({
  cards,
  selectedCards = [],
  onCardSelect,
  disabled = false,
  title,
  subtitle
}: CardCarouselProps) {
  return (
    <div className="space-y-3">
      {(title || subtitle) && (
        <div className="px-4">
          {title && <h3 className="text-sm font-semibold">{title}</h3>}
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
      )}
      <div className="relative">
        {/* Gradient fade edges for visual cue */}
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

        {/* Scrollable container */}
        <div className="overflow-x-auto scrollbar-thin snap-x snap-mandatory px-4 pb-2 -mx-4">
          <div className="flex gap-3 min-w-min">
            {cards.map((card, index) => (
              <motion.div
                key={card.id}
                className="snap-center flex-shrink-0 w-[280px] sm:w-[320px]"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <LoreCardComponent
                  card={card}
                  selected={selectedCards.some(c => c.id === card.id)}
                  onClick={onCardSelect ? () => onCardSelect(card) : undefined}
                  disabled={disabled}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
