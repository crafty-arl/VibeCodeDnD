import { motion } from 'framer-motion';
import { Sparkles, Wand2, ScrollText, Swords, Volume2 } from 'lucide-react';

interface LoadingNarrativeProps {
  message?: string;
  type?: 'intro' | 'challenge' | 'action' | 'resolution' | 'transition' | 'default';
  loadingAudio?: boolean;
}

const loadingConfig = {
  intro: {
    icon: ScrollText,
    message: 'Crafting your opening scene...',
    color: 'text-primary',
  },
  challenge: {
    icon: Swords,
    message: 'Forging a new challenge...',
    color: 'text-accent',
  },
  action: {
    icon: Wand2,
    message: 'Weaving action narratives...',
    color: 'text-secondary',
  },
  resolution: {
    icon: Sparkles,
    message: 'Resolving your tale...',
    color: 'text-primary',
  },
  transition: {
    icon: ScrollText,
    message: 'Bridging to the next chapter...',
    color: 'text-accent',
  },
  default: {
    icon: Sparkles,
    message: 'AI Weaving Your Tale...',
    color: 'text-primary',
  },
};

export function LoadingNarrative({ message, type = 'default', loadingAudio = false }: LoadingNarrativeProps) {
  const config = loadingConfig[type];
  const Icon = config.icon;
  const displayMessage = message || config.message;

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <motion.div
        animate={{
          rotate: 360,
          scale: [1, 1.1, 1],
        }}
        transition={{
          rotate: { duration: 2, repeat: Infinity, ease: 'linear' },
          scale: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
        }}
        className={`${config.color}`}
      >
        <Icon className="w-12 h-12" />
      </motion.div>

      <motion.p
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="text-sm text-muted-foreground text-center"
      >
        {displayMessage}
      </motion.p>

      {/* Audio loading indicator */}
      {loadingAudio && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 text-xs text-muted-foreground"
        >
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <Volume2 className="w-4 h-4" />
          </motion.div>
          <span>Loading audio narration...</span>
        </motion.div>
      )}

      {/* Progress dots */}
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.2,
              ease: 'easeInOut',
            }}
            className={`w-2 h-2 rounded-full ${config.color} opacity-30`}
          />
        ))}
      </div>
    </div>
  );
}
