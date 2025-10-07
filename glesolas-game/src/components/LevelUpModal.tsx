import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Sparkles, Star, Award, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import type { LevelUpResult } from '@/types/player';

interface LevelUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  levelUpResult: LevelUpResult;
}

export function LevelUpModal({ isOpen, onClose, levelUpResult }: LevelUpModalProps) {
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
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: 'spring', damping: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-60 w-full max-w-lg"
          >
            <Card className="relative border-2 border-accent shadow-2xl bg-gradient-to-br from-background via-background to-accent/20">
              {/* Close button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 z-10"
                onClick={onClose}
              >
                <X className="w-4 h-4" />
              </Button>

              <CardHeader className="text-center pb-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="mx-auto mb-4"
                >
                  <div className="relative">
                    <Trophy className="w-20 h-20 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      className="absolute -top-2 -right-2"
                    >
                      <Sparkles className="w-8 h-8 text-accent" />
                    </motion.div>
                  </div>
                </motion.div>

                <CardTitle className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-accent to-yellow-400 bg-clip-text text-transparent">
                  LEVEL UP!
                </CardTitle>
                <p className="text-2xl font-bold text-accent mt-2">
                  Level {levelUpResult.newLevel}
                </p>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Stat Boosts */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Star className="w-5 h-5 text-accent" />
                    Stat Increases
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    <StatBoost
                      label="Might"
                      value={levelUpResult.statBoosts.might}
                      color="text-red-400"
                    />
                    <StatBoost
                      label="Fortune"
                      value={levelUpResult.statBoosts.fortune}
                      color="text-green-400"
                    />
                    <StatBoost
                      label="Cunning"
                      value={levelUpResult.statBoosts.cunning}
                      color="text-blue-400"
                    />
                  </div>
                </div>

                {/* Perk Points */}
                {levelUpResult.perkPointsEarned > 0 && (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="bg-accent/10 border border-accent rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-accent" />
                        <span className="font-semibold">Perk Points Earned</span>
                      </div>
                      <span className="text-2xl font-bold text-accent">
                        +{levelUpResult.perkPointsEarned}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Visit the Character menu to spend your perk points!
                    </p>
                  </motion.div>
                )}

                {/* Newly Unlocked Perks */}
                {levelUpResult.perksUnlocked.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-accent" />
                      New Perks Available
                    </h3>
                    <div className="space-y-2">
                      {levelUpResult.perksUnlocked.map((perk) => (
                        <motion.div
                          key={perk.id}
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          className="bg-secondary/50 border border-accent/30 rounded-md p-3"
                        >
                          <p className="font-semibold text-accent">{perk.name}</p>
                          <p className="text-sm text-muted-foreground">{perk.description}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Achievements Unlocked */}
                {levelUpResult.achievementsUnlocked.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Award className="w-5 h-5 text-accent" />
                      Achievements Unlocked
                    </h3>
                    <div className="space-y-2">
                      {levelUpResult.achievementsUnlocked.map((achievement) => (
                        <motion.div
                          key={achievement.id}
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          className="bg-accent/20 border border-accent rounded-md p-3"
                        >
                          <p className="font-semibold text-accent">{achievement.name}</p>
                          <p className="text-sm text-muted-foreground">{achievement.description}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Continue Button */}
                <Button
                  onClick={onClose}
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                  size="lg"
                >
                  Continue
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function StatBoost({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', delay: 0.1 }}
      className="bg-secondary/50 rounded-lg p-3 text-center"
    >
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>+{value}</p>
    </motion.div>
  );
}
