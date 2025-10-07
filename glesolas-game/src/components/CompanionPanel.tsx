import type { LoreCard, SkillPath } from '@/types/game';
import { CompanionManager } from '@/lib/companionManager';
import { motion } from 'framer-motion';
import { Heart, Star } from 'lucide-react';

interface CompanionPanelProps {
  companions: LoreCard[];
  currentKeyStat?: SkillPath;
}

export function CompanionPanel({ companions, currentKeyStat }: CompanionPanelProps) {
  if (companions.length === 0) return null;

  return (
    <div className="space-y-2">
      {companions.map(companion => {
        const loyalty = companion.loyalty || 0;
        const tier = CompanionManager.getLoyaltyTier(loyalty);
        const bonus = CompanionManager.getLoyaltyBonus(loyalty);
        const tierColors = {
          stranger: 'text-gray-400',
          acquaintance: 'text-blue-400',
          friend: 'text-green-400',
          trusted: 'text-purple-400',
          legendary: 'text-yellow-400',
        };

        return (
          <motion.div
            key={companion.id}
            className="bg-card border border-border rounded-lg p-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xl">{companion.name[0]}</span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-semibold text-sm truncate">{companion.name}</h4>
                  <div className="flex items-center gap-1 text-xs">
                    <Heart className="w-3 h-3" />
                    <span>{loyalty}</span>
                  </div>
                </div>

                <p className={`text-xs capitalize ${tierColors[tier]}`}>{tier}</p>

                {(bonus.might > 0 || bonus.fortune > 0 || bonus.cunning > 0) && (
                  <div className="flex gap-2 mt-1 text-xs">
                    {bonus.might > 0 && <span className="text-red-400">+{bonus.might} M</span>}
                    {bonus.fortune > 0 && <span className="text-green-400">+{bonus.fortune} F</span>}
                    {bonus.cunning > 0 && <span className="text-blue-400">+{bonus.cunning} C</span>}
                  </div>
                )}

                {currentKeyStat && companion.preferredPath === currentKeyStat && (
                  <div className="mt-2 text-xs text-yellow-400 flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" />
                    <span>Key stat aligned!</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
