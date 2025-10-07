import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Check, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { DIFFICULTY_TIERS, getUnlockedDifficulties, getNextDifficultyToUnlock, type DifficultyId } from '../types/difficulty';
import type { PlayerProfile } from '../types/player';

interface DifficultySelectorProps {
  isOpen: boolean;
  playerProfile: PlayerProfile;
  onSelectDifficulty: (difficultyId: DifficultyId) => void;
  onClose: () => void;
}

export function DifficultySelector({ isOpen, playerProfile, onSelectDifficulty, onClose }: DifficultySelectorProps) {
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyId>(playerProfile.selectedDifficulty);
  const unlockedTiers = getUnlockedDifficulties(playerProfile.glory);
  const nextToUnlock = getNextDifficultyToUnlock(playerProfile.glory);

  const handleConfirm = () => {
    onSelectDifficulty(selectedDifficulty);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-3xl max-h-[90vh] overflow-auto p-4"
          >
            <Card className="border-2 border-accent">
              <CardHeader className="border-b border-accent/20">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl sm:text-2xl">Select Difficulty</CardTitle>
                  <Button variant="ghost" size="icon" onClick={onClose}>
                    <span className="text-xl">×</span>
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Choose your challenge level. Higher difficulties offer greater rewards!
                </p>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 space-y-4">
                {/* Difficulty Cards */}
                <div className="space-y-3">
                  {DIFFICULTY_TIERS.map((tier, index) => {
                    const isUnlocked = unlockedTiers.some(t => t.id === tier.id);
                    const isSelected = selectedDifficulty === tier.id;
                    const isCurrent = playerProfile.selectedDifficulty === tier.id;

                    return (
                      <motion.div
                        key={tier.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileTap={isUnlocked ? { scale: 0.98 } : {}}
                        className="instant-feedback"
                      >
                        <Card
                          className={`cursor-pointer transition-all mobile-touch-target ${
                            isSelected
                              ? 'border-accent ring-2 ring-accent/50 bg-accent/5'
                              : isUnlocked
                              ? 'border-border hover:border-accent/50 active:border-accent'
                              : 'border-muted opacity-60 cursor-not-allowed'
                          }`}
                          onClick={() => isUnlocked && setSelectedDifficulty(tier.id)}
                        >
                          <CardContent className="p-3 sm:p-4">
                            <div className="flex items-start justify-between gap-3">
                              {/* Icon and Title */}
                              <div className="flex items-start gap-2 flex-1">
                                <div className="text-2xl gpu-accelerated">{tier.icon}</div>
                                <div className="flex-1 space-y-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className={`text-sm sm:text-base font-bold ${tier.color}`}>{tier.name}</h3>
                                    {isCurrent && (
                                      <span className="text-xs px-2 py-0.5 rounded-full bg-accent/20 text-accent">
                                        Current
                                      </span>
                                    )}
                                    {isSelected && !isCurrent && (
                                      <Check className="w-4 h-4 text-accent" />
                                    )}
                                  </div>
                                  <p className="text-xs text-muted-foreground">{tier.description}</p>

                                  {/* Stats */}
                                  <div className="grid grid-cols-2 gap-2 mt-2">
                                    <div className="text-xs">
                                      <span className="text-muted-foreground">Requirements:</span>{' '}
                                      <span className="font-semibold">
                                        {tier.requirementMultiplier === 1.0
                                          ? 'Normal'
                                          : `${tier.requirementMultiplier}x`}
                                      </span>
                                    </div>
                                    <div className="text-xs">
                                      <span className="text-muted-foreground">Rewards:</span>{' '}
                                      <span className="font-semibold text-accent">
                                        {tier.rewardMultiplier}x Glory
                                      </span>
                                    </div>
                                  </div>

                                  {/* Unlock status */}
                                  {!isUnlocked && (
                                    <div className="flex items-center gap-2 mt-2 text-xs text-destructive">
                                      <Lock className="w-3 h-3" />
                                      <span>
                                        Unlock at {tier.unlockGlory.toLocaleString()} Glory
                                        (You: {playerProfile.glory.toLocaleString()})
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Selection indicator */}
                              {isUnlocked && (
                                <div
                                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                    isSelected ? 'bg-accent border-accent' : 'border-border'
                                  }`}
                                >
                                  {isSelected && <Check className="w-3 h-3 text-accent-foreground" />}
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Next unlock progress */}
                {nextToUnlock && (
                  <Card className="border-accent/30 bg-accent/5">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs sm:text-sm font-semibold">Next Unlock: {nextToUnlock.name}</p>
                        <span className="text-xs text-muted-foreground">
                          {playerProfile.glory.toLocaleString()} / {nextToUnlock.unlockGlory.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="bg-accent h-2 rounded-full transition-all"
                          style={{
                            width: `${Math.min(100, (playerProfile.glory / nextToUnlock.unlockGlory) * 100)}%`
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <Button onClick={onClose} variant="outline" className="flex-1">
                    Cancel
                  </Button>
                  <Button
                    onClick={handleConfirm}
                    className="flex-1 gap-2"
                    disabled={selectedDifficulty === playerProfile.selectedDifficulty}
                  >
                    {selectedDifficulty === playerProfile.selectedDifficulty ? (
                      'No Change'
                    ) : (
                      <>
                        Confirm
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
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
