import { motion } from 'framer-motion';
import { Award, Trophy, Star, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import type { PlayerProfile } from '@/types/player';

interface AchievementsPanelProps {
  profile: PlayerProfile;
}

export function AchievementsPanel({ profile }: AchievementsPanelProps) {
  const unlockedCount = profile.achievements.filter(a => a.unlocked).length;
  const totalCount = profile.achievements.length;
  const completionPercentage = (unlockedCount / totalCount) * 100;

  return (
    <Card className="border-accent/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2">
            <Trophy className="w-5 h-5 text-accent" />
            Achievements
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            {unlockedCount} / {totalCount} ({completionPercentage.toFixed(0)}%)
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {profile.achievements.map((achievement, index) => {
              const isUnlocked = achievement.unlocked;

              return (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`
                    relative rounded-lg border-2 p-4
                    ${isUnlocked
                      ? 'bg-accent/10 border-accent/50'
                      : 'bg-secondary/20 border-secondary/50 opacity-60'
                    }
                  `}
                >
                  {/* Unlocked Badge */}
                  <div className="absolute top-3 right-3">
                    {isUnlocked ? (
                      <div className="bg-accent text-accent-foreground rounded-full p-1.5">
                        <Award className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="bg-secondary text-secondary-foreground rounded-full p-1.5">
                        <Lock className="w-4 h-4" />
                      </div>
                    )}
                  </div>

                  <div className="pr-10">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Star className={`w-4 h-4 ${isUnlocked ? 'text-accent' : 'text-muted-foreground'}`} />
                      {achievement.name}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {achievement.description}
                    </p>

                    {/* Rewards */}
                    {achievement.reward && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {achievement.reward.xp && (
                          <span className="text-xs bg-blue-400/20 text-blue-400 rounded px-2 py-1">
                            +{achievement.reward.xp} XP
                          </span>
                        )}
                        {achievement.reward.perkPoints && (
                          <span className="text-xs bg-accent/20 text-accent rounded px-2 py-1">
                            +{achievement.reward.perkPoints} Perk Points
                          </span>
                        )}
                        {achievement.reward.narrativeDice && (
                          <span className="text-xs bg-purple-400/20 text-purple-400 rounded px-2 py-1">
                            +{achievement.reward.narrativeDice} Narrative Dice
                          </span>
                        )}
                      </div>
                    )}

                    {/* Unlock timestamp */}
                    {isUnlocked && achievement.unlockedAt && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
