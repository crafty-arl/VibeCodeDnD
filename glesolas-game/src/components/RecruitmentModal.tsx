import type { LoreCard } from '@/types/game';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, Heart, Sword, Clover, Brain } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface RecruitmentModalProps {
  isOpen: boolean;
  companion: LoreCard | null;
  onRecruit: (companion: LoreCard) => void;
  onDecline: () => void;
}

export function RecruitmentModal({ isOpen, companion, onRecruit, onDecline }: RecruitmentModalProps) {
  if (!companion) return null;

  const preferredPathIcons = {
    might: Sword,
    fortune: Clover,
    cunning: Brain,
  };

  const PreferredIcon = companion.preferredPath ? preferredPathIcons[companion.preferredPath] : UserPlus;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-60"
            onClick={onDecline}
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-60 w-full max-w-md p-4"
          >
            <Card className="border-primary/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <UserPlus className="w-5 h-5" />
                    Recruit Companion?
                  </CardTitle>
                  <Button onClick={onDecline} variant="ghost" size="sm">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  <strong>{companion.name}</strong> respects your prowess and offers to join your cause!
                </p>

                <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">{companion.name}</span>
                    <span className="text-xs px-2 py-1 rounded bg-secondary text-secondary-foreground capitalize">
                      {companion.rarity}
                    </span>
                  </div>

                  <div className="flex gap-4 text-sm">
                    <div className="flex items-center gap-1 text-red-400">
                      <Sword className="w-4 h-4" />
                      <span>{companion.stats.might}</span>
                    </div>
                    <div className="flex items-center gap-1 text-green-400">
                      <Clover className="w-4 h-4" />
                      <span>{companion.stats.fortune}</span>
                    </div>
                    <div className="flex items-center gap-1 text-blue-400">
                      <Brain className="w-4 h-4" />
                      <span>{companion.stats.cunning}</span>
                    </div>
                  </div>

                  <p className="text-xs italic text-muted-foreground">{companion.flavor}</p>
                </div>

                <div className="bg-muted p-3 rounded text-sm space-y-2">
                  <p className="font-semibold">Starting Benefits:</p>
                  <ul className="space-y-1 text-xs">
                    <li className="flex items-center gap-2">
                      <Heart className="w-3 h-3" />
                      <span>Loyalty: 100 (Acquaintance)</span>
                    </li>
                    {companion.preferredPath && (
                      <li className="flex items-center gap-2">
                        <PreferredIcon className="w-3 h-3" />
                        <span>Prefers: {companion.preferredPath}</span>
                      </li>
                    )}
                    <li className="flex items-center gap-2">
                      <span className="text-primary">✨</span>
                      <span>+1 Might bonus initially</span>
                    </li>
                  </ul>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button onClick={() => onRecruit(companion)} className="flex-1">
                    Recruit Companion
                  </Button>
                  <Button onClick={onDecline} variant="outline" className="flex-1">
                    Decline
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
