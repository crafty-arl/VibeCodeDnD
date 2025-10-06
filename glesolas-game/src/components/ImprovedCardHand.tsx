import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, Hand, CheckCircle2 } from 'lucide-react';
import type { LoreCard } from '../types/game';
import { LoreCardComponent } from './LoreCardComponent';
import { CardDetailModal } from './CardDetailModal';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';

interface ImprovedCardHandProps {
  hand: LoreCard[];
  selectedCards: LoreCard[];
  onCardSelect: (card: LoreCard) => void;
  maxSelection?: number;
  disabled?: boolean;
}

export function ImprovedCardHand({
  hand,
  selectedCards,
  onCardSelect,
  maxSelection = 3,
  disabled = false
}: ImprovedCardHandProps) {
  const [detailCard, setDetailCard] = useState<LoreCard | null>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const handleCardClick = (card: LoreCard) => {
    if (disabled) return;
    const isSelected = selectedCards.some(c => c.id === card.id);

    // Allow deselection or selection if under max
    if (isSelected || selectedCards.length < maxSelection) {
      onCardSelect(card);
    }
  };

  const isCardSelected = (card: LoreCard) => selectedCards.some(c => c.id === card.id);
  const canSelectMore = selectedCards.length < maxSelection;
  const selectionComplete = selectedCards.length === maxSelection;

  return (
    <>
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Hand className="w-5 h-5 text-primary" />
              Your Hand
              <span className="text-sm font-normal text-muted-foreground">
                ({hand.length} {hand.length === 1 ? 'card' : 'cards'})
              </span>
            </CardTitle>

            {/* Selection Progress */}
            <div className="flex items-center gap-2">
              {selectionComplete ? (
                <div className="flex items-center gap-1.5 text-sm font-medium text-green-600 dark:text-green-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Ready!</span>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  <span className="font-semibold text-primary">{selectedCards.length}</span>
                  <span> / {maxSelection} selected</span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Instruction Banner */}
          {!selectionComplete && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-primary/5 border border-primary/20 rounded-lg"
            >
              <p className="text-sm text-center">
                <span className="font-semibold">Click cards to select</span>
                {canSelectMore && ` • ${maxSelection - selectedCards.length} more needed`}
              </p>
            </motion.div>
          )}

          {/* Desktop Grid Layout */}
          <div className="hidden md:block">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {hand.map((card, index) => {
                const isSelected = isCardSelected(card);
                const isHovered = hoveredCard === card.id;
                const isClickable = !disabled && (isSelected || canSelectMore);

                return (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="relative"
                  >
                    {/* Selection Indicator */}
                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="absolute -top-2 -right-2 z-10 bg-green-500 rounded-full p-1 shadow-lg"
                        >
                          <CheckCircle2 className="w-5 h-5 text-white" />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Card Container */}
                    <div
                      className={`
                        relative group cursor-pointer transition-all
                        ${isSelected ? 'ring-2 ring-green-500 shadow-lg shadow-green-500/20' : ''}
                        ${isHovered && isClickable ? 'ring-2 ring-primary/50' : ''}
                        ${!isClickable && !isSelected ? 'opacity-50 cursor-not-allowed' : ''}
                        rounded-lg overflow-hidden
                      `}
                      onClick={() => handleCardClick(card)}
                      onMouseEnter={() => setHoveredCard(card.id)}
                      onMouseLeave={() => setHoveredCard(null)}
                    >
                      <LoreCardComponent
                        card={card}
                        selected={isSelected}
                        disabled={disabled && !isSelected}
                      />

                      {/* Details Button Overlay */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: isHovered ? 1 : 0 }}
                        className="absolute bottom-2 right-2"
                      >
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-8 gap-1.5 shadow-lg"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDetailCard(card);
                          }}
                        >
                          <Info className="w-3.5 h-3.5" />
                          Details
                        </Button>
                      </motion.div>
                    </div>

                    {/* Click Hint */}
                    {!isSelected && isClickable && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: isHovered ? 1 : 0 }}
                        className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg pointer-events-none"
                      >
                        <div className="bg-primary text-primary-foreground px-3 py-1.5 rounded-full text-sm font-medium">
                          Click to Select
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Mobile Horizontal Scroll */}
          <div className="md:hidden -mx-4 px-4">
            <div className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-thin">
              {hand.map((card, index) => {
                const isSelected = isCardSelected(card);
                const isClickable = !disabled && (isSelected || canSelectMore);

                return (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex-shrink-0 w-[160px] snap-center relative"
                  >
                    {/* Selection Indicator */}
                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="absolute -top-2 -right-2 z-10 bg-green-500 rounded-full p-1 shadow-lg"
                        >
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div
                      className={`
                        relative rounded-lg overflow-hidden transition-all
                        ${isSelected ? 'ring-2 ring-green-500 shadow-lg shadow-green-500/20' : ''}
                        ${!isClickable && !isSelected ? 'opacity-50' : ''}
                      `}
                      onClick={() => handleCardClick(card)}
                    >
                      <LoreCardComponent
                        card={card}
                        selected={isSelected}
                        disabled={disabled && !isSelected}
                      />

                      {/* Details Button */}
                      <div className="absolute bottom-1 left-1 right-1">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="w-full h-7 text-xs gap-1 shadow-md"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDetailCard(card);
                          }}
                        >
                          <Info className="w-3 h-3" />
                          Info
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Empty State */}
          {hand.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Hand className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Your hand is empty</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Card Detail Modal */}
      <CardDetailModal
        card={detailCard}
        open={!!detailCard}
        onClose={() => setDetailCard(null)}
        onSelect={
          detailCard && !isCardSelected(detailCard) && canSelectMore
            ? () => {
                onCardSelect(detailCard);
                setDetailCard(null);
              }
            : undefined
        }
        selected={detailCard ? isCardSelected(detailCard) : false}
        disabled={disabled}
      />
    </>
  );
}
