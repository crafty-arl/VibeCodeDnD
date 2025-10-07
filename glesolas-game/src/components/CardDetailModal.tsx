import { motion, AnimatePresence } from 'framer-motion';
import { X, Swords, Dices, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import type { LoreCard } from '../types/game';

interface CardDetailModalProps {
  card: LoreCard | null;
  open: boolean;
  onClose: () => void;
  onSelect?: () => void;
  selected?: boolean;
  disabled?: boolean;
}

export function CardDetailModal({ card, open, onClose, onSelect, selected, disabled }: CardDetailModalProps) {
  if (!card) return null;

  const rarityColors = {
    Common: 'from-gray-600 to-gray-800',
    Uncommon: 'from-green-600 to-green-800',
    Rare: 'from-blue-600 to-blue-800',
    Legendary: 'from-primary to-primary/80',
  };

  const rarityGlow = {
    Common: 'shadow-gray-500/50',
    Uncommon: 'shadow-green-500/50',
    Rare: 'shadow-blue-500/50',
    Legendary: 'shadow-primary/50',
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-60"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-60 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="pointer-events-auto w-full max-w-md">
              <div className={`relative rounded-2xl bg-gradient-to-br ${rarityColors[card.rarity]} p-1 shadow-2xl ${rarityGlow[card.rarity]}`}>
                <div className="bg-background rounded-xl overflow-hidden">
                  {/* Close Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="absolute top-2 right-2 z-10 h-8 w-8 p-0 bg-background/80 backdrop-blur hover:bg-background"
                  >
                    <X className="w-4 h-4" />
                  </Button>

                  {/* Card Header */}
                  <div className="relative p-6 pb-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold mb-1">{card.name}</h2>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">{card.type}</span>
                          <span className="text-muted-foreground">•</span>
                          <span className={`font-bold ${card.rarity === 'Legendary' ? 'text-primary' : 'text-foreground'}`}>
                            {card.rarity}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Stats - Large Display */}
                    <div className="mt-6 grid grid-cols-3 gap-4">
                      <div className="text-center p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                        <Swords className="w-8 h-8 text-red-400 mx-auto mb-2" />
                        <div className="text-3xl font-bold font-mono">{card.stats.might}</div>
                        <div className="text-xs text-muted-foreground mt-1">Might</div>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                        <Dices className="w-8 h-8 text-green-400 mx-auto mb-2" />
                        <div className="text-3xl font-bold font-mono">{card.stats.fortune}</div>
                        <div className="text-xs text-muted-foreground mt-1">Fortune</div>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                        <Sparkles className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                        <div className="text-3xl font-bold font-mono">{card.stats.cunning}</div>
                        <div className="text-xs text-muted-foreground mt-1">Cunning</div>
                      </div>
                    </div>
                  </div>

                  {/* Flavor Text */}
                  <div className="px-6 pb-6">
                    <div className="p-4 rounded-lg bg-secondary/50 border border-border">
                      <p className="text-sm italic leading-relaxed text-muted-foreground">
                        "{card.flavor}"
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {onSelect && !disabled && (
                    <div className="px-6 pb-6">
                      <Button
                        onClick={() => {
                          onSelect();
                          onClose();
                        }}
                        className="w-full"
                        size="lg"
                        variant={selected ? 'secondary' : 'default'}
                      >
                        {selected ? '✓ Selected' : 'Select Card'}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
