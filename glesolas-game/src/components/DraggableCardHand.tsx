import { useState, useEffect, useRef } from 'react';
import { motion, type PanInfo } from 'framer-motion';
import type { LoreCard } from '../types/game';
import { LoreCardComponent } from './LoreCardComponent';
import { CardDetailModal } from './CardDetailModal';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface DraggableCardHandProps {
  hand: LoreCard[];
  selectedCards: LoreCard[];
  onCardSelect: (card: LoreCard) => void;
  maxSelection?: number;
  disabled?: boolean;
}

export function DraggableCardHand({
  hand,
  selectedCards,
  onCardSelect,
  maxSelection = 3,
  disabled = false
}: DraggableCardHandProps) {
  const [cards, setCards] = useState(hand);
  const [detailCard, setDetailCard] = useState<LoreCard | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Update cards when hand changes
  useEffect(() => {
    setCards(hand);
  }, [hand]);

  const handleLongPressStart = (card: LoreCard) => {
    if (disabled) return;
    longPressTimerRef.current = setTimeout(() => {
      setDetailCard(card);
      setLongPressCard(card);
    }, 500); // 500ms for long press
  };

  const handleLongPressEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleDragEnd = (card: LoreCard, _event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    handleLongPressEnd();

    // Check if dragged upward (y < -50 indicates upward drag)
    if (info.offset.y < -50 && !disabled) {
      onCardSelect(card);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center justify-between">
            <span>Your Hand ({hand.length} cards)</span>
            <span className="text-xs text-muted-foreground font-normal hidden sm:inline">
              Drag up to play • Hold for details
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-4">
            💡 <span className="font-semibold">Drag cards upward</span> to play them • <span className="font-semibold">Hold</span> to see details
          </p>

          {/* Desktop: Draggable Grid */}
          <div className="hidden md:block">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {cards.map((card) => {
                const isSelected = selectedCards.some(c => c.id === card.id);

                return (
                  <motion.div
                    key={card.id}
                    drag={!disabled && !isSelected}
                    dragConstraints={{ top: 0, bottom: 0, left: 0, right: 0 }}
                    dragElastic={0.2}
                    onDragStart={() => handleLongPressStart(card)}
                    onDragEnd={(e, info) => handleDragEnd(card, e, info)}
                    onPointerDown={() => handleLongPressStart(card)}
                    onPointerUp={handleLongPressEnd}
                    onPointerLeave={handleLongPressEnd}
                    whileDrag={{ scale: 1.1, zIndex: 10, rotate: 5 }}
                    className={`cursor-grab active:cursor-grabbing ${isSelected ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    <LoreCardComponent
                      card={card}
                      selected={isSelected}
                      disabled={disabled || isSelected}
                    />
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Mobile: Horizontal Scrollable */}
          <div className="md:hidden -mx-4 px-4">
            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-thin snap-x snap-mandatory">
              {cards.map((card, index) => {
                const isSelected = selectedCards.some(c => c.id === card.id);

                return (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    drag={!disabled && !isSelected ? "y" : false}
                    dragConstraints={{ top: -100, bottom: 0 }}
                    dragElastic={0.2}
                    onDragStart={() => handleLongPressStart(card)}
                    onDragEnd={(e, info) => handleDragEnd(card, e, info)}
                    onTouchStart={() => handleLongPressStart(card)}
                    onTouchEnd={handleLongPressEnd}
                    whileDrag={{ scale: 1.1, zIndex: 10 }}
                    className={`flex-shrink-0 w-[160px] snap-center ${isSelected ? 'opacity-50' : ''}`}
                  >
                    <LoreCardComponent
                      card={card}
                      selected={isSelected}
                      disabled={disabled || isSelected}
                    />
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 text-center text-xs text-muted-foreground"
          >
            {selectedCards.length === 0 && '⬆️ Drag cards upward to select them'}
            {selectedCards.length > 0 && selectedCards.length < maxSelection && `${maxSelection - selectedCards.length} more card${maxSelection - selectedCards.length > 1 ? 's' : ''} needed`}
            {selectedCards.length === maxSelection && '✓ Ready to play!'}
          </motion.div>
        </CardContent>
      </Card>

      {/* Card Detail Modal */}
      <CardDetailModal
        card={detailCard}
        open={!!detailCard}
        onClose={() => {
          setDetailCard(null);
          setLongPressCard(null);
        }}
        onSelect={detailCard && !selectedCards.some(c => c.id === detailCard.id) ? () => {
          onCardSelect(detailCard);
          setDetailCard(null);
        } : undefined}
        selected={detailCard ? selectedCards.some(c => c.id === detailCard.id) : false}
        disabled={disabled}
      />
    </>
  );
}
