import { useState, useRef } from 'react';
import { motion, useMotionValue } from 'framer-motion';
import { ChevronUp, ChevronDown } from 'lucide-react';
import type { LoreCard } from '../types/game';
import { LoreCardComponent } from './LoreCardComponent';
import { CardDetailModal } from './CardDetailModal';

interface CardHandDrawerProps {
  hand: LoreCard[];
  selectedCards: LoreCard[];
  onCardSelect: (card: LoreCard) => void;
  disabled?: boolean;
}

export function CardHandDrawer({ hand, selectedCards, onCardSelect, disabled }: CardHandDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [detailCard, setDetailCard] = useState<LoreCard | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const y = useMotionValue(0);

  // Calculate drawer height - open shows cards, closed shows just handle
  const closedHeight = 48;
  const openHeight = 240;

  const handleLongPressStart = (card: LoreCard) => {
    if (disabled) return;
    longPressTimerRef.current = setTimeout(() => {
      setDetailCard(card);
    }, 500);
  };

  const handleLongPressEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleDragEnd = (card: LoreCard, _event: any, info: any) => {
    handleLongPressEnd();

    // Check if dragged upward significantly (y < -80 indicates upward drag to play area)
    if (info.offset.y < -80 && !disabled && !selectedCards.some(c => c.id === card.id)) {
      onCardSelect(card);
    }
  };

  return (
    <>
      {/* Backdrop when open */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/20 z-30 pointer-events-auto"
        />
      )}

      {/* Drawer */}
      <motion.div
        drag="y"
        dragConstraints={{ top: -openHeight + closedHeight, bottom: 0 }}
        dragElastic={0.2}
        onDragEnd={(_e, info) => {
          // Auto-open/close based on drag velocity or position
          if (info.offset.y < -50 || info.velocity.y < -500) {
            setIsOpen(true);
          } else if (info.offset.y > 50 || info.velocity.y > 500) {
            setIsOpen(false);
          }
        }}
        animate={{
          y: isOpen ? -openHeight + closedHeight : 0
        }}
        transition={{
          type: 'spring',
          damping: 30,
          stiffness: 300
        }}
        className="fixed bottom-0 left-0 right-0 z-40 safe-area-bottom pointer-events-auto"
        style={{ y }}
      >
        <div className="bg-background/95 backdrop-blur-sm border-t-2 border-primary/50 shadow-2xl">
          {/* Handle */}
          <div
            className="flex items-center justify-center py-2 cursor-pointer touch-manipulation active:bg-primary/10 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            <div className="flex items-center gap-2">
              <div className="w-10 h-1 bg-primary/50 rounded-full" />
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                {isOpen ? (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    <span>Close</span>
                  </>
                ) : (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    <span>Hand ({hand.length})</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Cards Container */}
          <div className={`px-4 pb-4 overflow-hidden transition-all ${isOpen ? 'max-h-[200px]' : 'max-h-0'}`}>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin snap-x snap-mandatory">
              {hand.map((card, index) => {
                const isSelected = selectedCards.some(c => c.id === card.id);

                return (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{
                      opacity: isSelected ? 0.3 : 1,
                      scale: isSelected ? 0.8 : 1
                    }}
                    transition={{ delay: index * 0.03 }}
                    drag={!disabled && !isSelected ? "y" : false}
                    dragConstraints={{ top: -200, bottom: 50 }}
                    dragElastic={0.3}
                    dragSnapToOrigin={true}
                    onDragStart={() => handleLongPressStart(card)}
                    onDragEnd={(e, info) => handleDragEnd(card, e, info)}
                    onTouchStart={() => handleLongPressStart(card)}
                    onTouchEnd={handleLongPressEnd}
                    whileDrag={{
                      scale: 1.15,
                      zIndex: 50,
                      cursor: 'grabbing'
                    }}
                    className={`flex-shrink-0 w-[140px] snap-center ${!isSelected && !disabled ? 'cursor-grab active:cursor-grabbing' : ''}`}
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

            {/* Helper Text */}
            {isOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-center text-xs text-muted-foreground mt-2"
              >
                ⬆️ <span className="font-semibold">Drag cards upward</span> to play • <span className="font-semibold">Hold</span> for details
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Card Detail Modal */}
      <CardDetailModal
        card={detailCard}
        open={!!detailCard}
        onClose={() => {
          setDetailCard(null);
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
