import { motion } from 'framer-motion';
import { Trophy, Star } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Progress } from './ui/progress';
import type { PlayerProfile } from '@/types/player';
import { getXPProgressInLevel } from '@/lib/levelingService';

interface PlayerLevelDisplayProps {
  profile: PlayerProfile;
  compact?: boolean;
}

export function PlayerLevelDisplay({ profile, compact = false }: PlayerLevelDisplayProps) {
  const xpProgress = getXPProgressInLevel(profile.totalXP);

  if (compact) {
    return (
      <div className="flex items-center gap-3 bg-secondary/50 rounded-lg px-3 py-2 border border-accent/30">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          <span className="font-bold text-lg">Lv {profile.level}</span>
        </div>
        <div className="flex-1 min-w-[100px]">
          <Progress value={xpProgress.percentage} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">
            {xpProgress.current.toLocaleString()} / {xpProgress.required.toLocaleString()} XP
          </p>
        </div>
      </div>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-secondary/50 to-accent/10 border-accent/30">
      <CardContent className="p-4 space-y-3">
        {/* Level and Name */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-400" />
              {profile.name}
            </h3>
            <p className="text-muted-foreground text-sm">
              {getLevelTitle(profile.level)}
            </p>
          </div>
          <div className="text-center">
            <div className="bg-accent/20 border-2 border-accent rounded-lg px-4 py-2">
              <p className="text-xs text-muted-foreground">Level</p>
              <p className="text-3xl font-bold text-accent">{profile.level}</p>
            </div>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Experience</span>
            <span className="font-mono font-semibold">
              {xpProgress.current.toLocaleString()} / {xpProgress.required.toLocaleString()}
            </span>
          </div>
          <div className="relative overflow-hidden">
            <Progress value={xpProgress.percentage} className="h-3" />
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{ x: [-100, 300] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            />
          </div>
          <p className="text-xs text-right text-muted-foreground">
            {xpProgress.percentage.toFixed(1)}% to next level
          </p>
        </div>

        {/* Perk Points */}
        {profile.availablePerkPoints > 0 && (
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ repeat: Infinity, duration: 1.5, repeatType: 'reverse' }}
            className="bg-accent/20 border border-accent rounded-lg p-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-accent" />
                <span className="font-semibold">Perk Points Available</span>
              </div>
              <span className="text-2xl font-bold text-accent">
                {profile.availablePerkPoints}
              </span>
            </div>
          </motion.div>
        )}

        {/* Bonus Stats */}
        {(profile.bonusStats.might > 0 || profile.bonusStats.fortune > 0 || profile.bonusStats.cunning > 0) && (
          <div className="border-t border-accent/20 pt-3 space-y-1">
            <p className="text-xs text-muted-foreground font-semibold uppercase">Bonus Stats</p>
            <div className="grid grid-cols-3 gap-2 text-sm">
              {profile.bonusStats.might > 0 && (
                <div className="text-center">
                  <p className="text-red-400 font-bold">+{profile.bonusStats.might}</p>
                  <p className="text-xs text-muted-foreground">Might</p>
                </div>
              )}
              {profile.bonusStats.fortune > 0 && (
                <div className="text-center">
                  <p className="text-green-400 font-bold">+{profile.bonusStats.fortune}</p>
                  <p className="text-xs text-muted-foreground">Fortune</p>
                </div>
              )}
              {profile.bonusStats.cunning > 0 && (
                <div className="text-center">
                  <p className="text-blue-400 font-bold">+{profile.bonusStats.cunning}</p>
                  <p className="text-xs text-muted-foreground">Cunning</p>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Get title based on level
function getLevelTitle(level: number): string {
  if (level >= 20) return 'Living Legend';
  if (level >= 15) return 'Master Adventurer';
  if (level >= 10) return 'Seasoned Hero';
  if (level >= 5) return 'Promising Adventurer';
  return 'Novice Hero';
}
