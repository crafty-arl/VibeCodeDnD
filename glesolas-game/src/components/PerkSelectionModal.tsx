import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Award, Lock, Check, X, Swords, Dices, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import type { PlayerProfile, PlayerPerk } from '@/types/player';
import { AVAILABLE_PERKS, applyPerk, savePlayerProfile } from '@/lib/levelingService';

interface PerkSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: PlayerProfile;
  onPerkApplied: (profile: PlayerProfile) => void;
}

export function PerkSelectionModal({ isOpen, onClose, profile, onPerkApplied }: PerkSelectionModalProps) {
  const [selectedPerk, setSelectedPerk] = useState<PlayerPerk | null>(null);

  const handleApplyPerk = () => {
    if (!selectedPerk) return;

    const success = applyPerk(profile, selectedPerk.id);
    if (success) {
      savePlayerProfile(profile);
      onPerkApplied(profile);
      setSelectedPerk(null);
    }
  };

  const isPerkUnlocked = (perk: PlayerPerk) => {
    return !perk.requirement || profile.level >= perk.requirement;
  };

  const isPerkAcquired = (perk: PlayerPerk) => {
    return profile.perks.some(p => p.id === perk.id);
  };

  const getPerkIcon = (perk: PlayerPerk) => {
    if (perk.effect?.mightBonus) return Swords;
    if (perk.effect?.fortuneBonus) return Dices;
    if (perk.effect?.cunningBonus) return Sparkles;
    return Award;
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
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-60"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-60 w-full max-w-3xl max-h-[90vh]"
          >
            <Card className="border-2 border-accent shadow-2xl">
              <CardHeader className="border-b border-accent/20">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <Star className="w-6 h-6 text-accent" />
                      Character Perks
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Enhance your hero with powerful perks
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center bg-accent/20 border border-accent rounded-lg px-4 py-2">
                      <p className="text-xs text-muted-foreground">Available Points</p>
                      <p className="text-2xl font-bold text-accent">{profile.availablePerkPoints}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-6">
                    {/* Group perks by tier */}
                    {[
                      { tier: 'Tier 1', minLevel: 2, maxLevel: 4 },
                      { tier: 'Tier 2', minLevel: 5, maxLevel: 9 },
                      { tier: 'Tier 3', minLevel: 10, maxLevel: 14 },
                      { tier: 'Tier 4', minLevel: 15, maxLevel: 19 },
                      { tier: 'Tier 5', minLevel: 20, maxLevel: 99 }
                    ].map(({ tier, minLevel, maxLevel }) => {
                      const tierPerks = AVAILABLE_PERKS.filter(
                        p => p.requirement && p.requirement >= minLevel && p.requirement <= maxLevel
                      );

                      if (tierPerks.length === 0) return null;

                      return (
                        <div key={tier}>
                          <h3 className="text-lg font-semibold mb-3 text-accent">{tier}</h3>
                          <div className="grid gap-3">
                            {tierPerks.map(perk => {
                              const unlocked = isPerkUnlocked(perk);
                              const acquired = isPerkAcquired(perk);
                              const Icon = getPerkIcon(perk);

                              return (
                                <motion.div
                                  key={perk.id}
                                  whileHover={unlocked && !acquired ? { scale: 1.02 } : {}}
                                  onClick={() => {
                                    if (unlocked && !acquired) {
                                      setSelectedPerk(perk);
                                    }
                                  }}
                                  className={`
                                    relative rounded-lg border-2 p-4 cursor-pointer transition-all
                                    ${acquired ? 'bg-accent/10 border-accent/50 opacity-75' : ''}
                                    ${unlocked && !acquired ? 'bg-secondary/30 border-accent/30 hover:border-accent hover:bg-secondary/50' : ''}
                                    ${!unlocked ? 'bg-secondary/10 border-secondary opacity-50 cursor-not-allowed' : ''}
                                    ${selectedPerk?.id === perk.id ? 'border-accent bg-accent/20' : ''}
                                  `}
                                >
                                  {/* Acquired Badge */}
                                  {acquired && (
                                    <div className="absolute top-2 right-2 bg-accent text-accent-foreground rounded-full p-1">
                                      <Check className="w-4 h-4" />
                                    </div>
                                  )}

                                  {/* Locked Badge */}
                                  {!unlocked && (
                                    <div className="absolute top-2 right-2 bg-secondary text-secondary-foreground rounded-full p-1">
                                      <Lock className="w-4 h-4" />
                                    </div>
                                  )}

                                  <div className="flex gap-3">
                                    <div className={`
                                      w-12 h-12 rounded-lg flex items-center justify-center
                                      ${acquired ? 'bg-accent/20' : unlocked ? 'bg-accent/30' : 'bg-secondary'}
                                    `}>
                                      <Icon className={`w-6 h-6 ${unlocked ? 'text-accent' : 'text-muted-foreground'}`} />
                                    </div>

                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <h4 className="font-semibold">{perk.name}</h4>
                                        {perk.requirement && (
                                          <span className="text-xs bg-secondary rounded px-2 py-0.5">
                                            Lv {perk.requirement}
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-sm text-muted-foreground mt-1">
                                        {perk.description}
                                      </p>

                                      {/* Effect Display */}
                                      {perk.effect && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                          {perk.effect.mightBonus && (
                                            <span className="text-xs bg-red-400/20 text-red-400 rounded px-2 py-1">
                                              +{perk.effect.mightBonus} Might
                                            </span>
                                          )}
                                          {perk.effect.fortuneBonus && (
                                            <span className="text-xs bg-green-400/20 text-green-400 rounded px-2 py-1">
                                              +{perk.effect.fortuneBonus} Fortune
                                            </span>
                                          )}
                                          {perk.effect.cunningBonus && (
                                            <span className="text-xs bg-blue-400/20 text-blue-400 rounded px-2 py-1">
                                              +{perk.effect.cunningBonus} Cunning
                                            </span>
                                          )}
                                          {perk.effect.narrativeDiceBonus && (
                                            <span className="text-xs bg-purple-400/20 text-purple-400 rounded px-2 py-1">
                                              +{perk.effect.narrativeDiceBonus} Narrative Dice
                                            </span>
                                          )}
                                          {perk.effect.handSizeBonus && (
                                            <span className="text-xs bg-blue-400/20 text-blue-400 rounded px-2 py-1">
                                              +{perk.effect.handSizeBonus} Hand Size
                                            </span>
                                          )}
                                          {perk.effect.playAreaBonus && (
                                            <span className="text-xs bg-green-400/20 text-green-400 rounded px-2 py-1">
                                              +{perk.effect.playAreaBonus} Play Slot
                                            </span>
                                          )}
                                          {perk.effect.rerollCount && (
                                            <span className="text-xs bg-accent/20 text-accent rounded px-2 py-1">
                                              +{perk.effect.rerollCount} Reroll
                                            </span>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </motion.div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>

                {/* Action Buttons */}
                {selectedPerk && !isPerkAcquired(selectedPerk) && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 pt-4 border-t border-accent/20"
                  >
                    <Button
                      onClick={handleApplyPerk}
                      className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                      size="lg"
                      disabled={profile.availablePerkPoints < 1}
                    >
                      <Star className="w-5 h-5 mr-2" />
                      Acquire {selectedPerk.name} (1 Point)
                    </Button>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
