import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, Sparkles, Target, Swords, Dices, Award } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import type { TutorialStep } from '../types/tutorial';

interface TutorialOverlayProps {
  step: TutorialStep;
  onNext: () => void;
  onSkip: () => void;
  canSkip?: boolean;
}

const tutorialSteps: Record<TutorialStep, {
  title: string;
  message: string;
  icon: React.ReactNode;
  tips?: string[];
}> = {
  welcome: {
    title: 'Welcome to /quest!',
    message: 'An AI-powered storytelling card game where your choices shape epic adventures. Let me show you how to play!',
    icon: <Sparkles className="w-8 h-8 text-accent" />,
    tips: [
      'Each playthrough creates a unique story',
      'Your deck of cards determines your abilities',
      'The AI adapts to your choices in real-time'
    ]
  },
  'game-modes': {
    title: 'Choose Your Adventure',
    message: 'There are three game modes to explore:',
    icon: <Dices className="w-8 h-8 text-amber-500" />,
    tips: [
      '🎲 Campaign Mode - Classic endless adventure, glory grinding',
      '🎨 Playground Mode - Creative storytelling sandbox with full AI freedom',
      '⚔️ Arena Mode - Quick 5-minute challenges for high scores'
    ]
  },
  'campaign-intro': {
    title: 'Campaign Mode Basics',
    message: 'Campaign Mode is the classic experience. You\'ll draw cards, face challenges, and earn glory to unlock new content.',
    icon: <Dices className="w-8 h-8 text-amber-500" />,
    tips: [
      'Each encounter costs 1 Narrative Die',
      'Complete challenges to earn Glory and more dice',
      'Glory unlocks harder difficulties with better rewards'
    ]
  },
  'stats-explained': {
    title: 'The Three Stats',
    message: 'Every card has three stats that determine how you approach challenges:',
    icon: <Target className="w-8 h-8 text-blue-500" />,
    tips: [
      '⚔️ Might - Direct force, combat, intimidation',
      '🎲 Fortune - Luck, chance, agility, timing',
      '✨ Cunning - Intelligence, deception, social skills'
    ]
  },
  'deck-selection': {
    title: 'Your Starting Deck',
    message: 'Each encounter you draw 3 random cards from your deck. This is your hand - use all 3 wisely!',
    icon: <Swords className="w-8 h-8 text-purple-500" />,
    tips: [
      'Different cards excel at different approaches',
      'You can build custom decks in the Deck Manager',
      'New cards unlock as you earn Glory'
    ]
  },
  'intro-scene': {
    title: 'The Story Begins',
    message: 'The AI generates a unique opening scene based on your starting cards. This sets the stage for your adventure.',
    icon: <Sparkles className="w-8 h-8 text-accent" />,
    tips: [
      'Each scene is generated fresh - no two playthroughs are the same',
      'The AI weaves your cards into the narrative'
    ]
  },
  'challenge-explained': {
    title: 'Facing Challenges',
    message: 'Each challenge has three stat requirements. You need to meet at least one requirement to unlock that path.',
    icon: <Target className="w-8 h-8 text-red-500" />,
    tips: [
      'Red requirements mean you don\'t meet them',
      'Green requirements mean you\'ve unlocked that path',
      'Higher difficulty = higher requirements & rewards'
    ]
  },
  'card-selection': {
    title: 'Select Your Response',
    message: 'You must play all 3 cards in your hand. The combined stats determine which paths you unlock.',
    icon: <Swords className="w-8 h-8 text-blue-400" />,
    tips: [
      'Tap cards to select them for play',
      'Sometimes your hand won\'t have the right cards - adapt!',
      'Strategic deck building is key!'
    ]
  },
  'stat-requirements': {
    title: 'Meeting Requirements',
    message: 'Your selected cards\' stats are added together. If the total meets or exceeds a requirement, that path is unlocked!',
    icon: <Target className="w-8 h-8 text-green-500" />,
    tips: [
      'You only need to meet ONE requirement to proceed',
      'Different paths give different Glory rewards',
      'Cunning > Fortune > Might in reward order'
    ]
  },
  'action-paths': {
    title: 'Choose Your Path',
    message: 'Once you play your cards, the AI generates unique narratives for each unlocked path. Choose how you want to approach the challenge!',
    icon: <Sparkles className="w-8 h-8 text-purple-500" />,
    tips: [
      'Each path leads to a different story outcome',
      'Locked paths show what you need to unlock them',
      'The AI considers your previous choices'
    ]
  },
  resolution: {
    title: 'Resolution & Rewards',
    message: 'After choosing your path, the AI resolves your action and you receive rewards!',
    icon: <Award className="w-8 h-8 text-amber-500" />,
    tips: [
      'You always succeed if the path was unlocked',
      'Earn Glory and Narrative Dice as rewards',
      'Your choices affect future encounters'
    ]
  },
  rewards: {
    title: 'Glory & Progression',
    message: 'Glory is your main progression currency. Use it to unlock harder difficulties, new cards, and game modes.',
    icon: <Award className="w-8 h-8 text-yellow-500" />,
    tips: [
      'Higher difficulties = more Glory per encounter',
      'Narrative Dice recharge with each encounter',
      'Build your collection to create powerful decks'
    ]
  },
  'next-encounter': {
    title: 'The Adventure Continues',
    message: 'Your played cards are discarded and your hand is replenished. Each encounter builds on the story you\'re creating!',
    icon: <ChevronRight className="w-8 h-8 text-blue-500" />,
    tips: [
      'The AI remembers your previous choices',
      'Stories become more complex as you progress',
      'End session anytime to save your progress'
    ]
  },
  complete: {
    title: '🎉 Tutorial Complete!',
    message: 'You\'re ready to begin your adventure! Remember: every choice shapes your unique story. Good luck, adventurer!',
    icon: <Sparkles className="w-8 h-8 text-accent" />,
    tips: [
      'Experiment with different decks and strategies',
      'Try all three game modes for variety',
      'Your first goal: unlock the next difficulty tier!'
    ]
  }
};

export function TutorialOverlay({ step, onNext, onSkip, canSkip = true }: TutorialOverlayProps) {
  const config = tutorialSteps[step];

  if (!config || step === 'complete') return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-60 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="w-full max-w-2xl"
        >
          <Card className="border-accent/50 shadow-2xl">
            <CardHeader className="relative">
              {canSkip && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onSkip}
                  className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
              <div className="flex items-start gap-4">
                <div className="p-3 bg-accent/10 rounded-lg">
                  {config.icon}
                </div>
                <div className="flex-1">
                  <CardTitle className="text-2xl">{config.title}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Step {Object.keys(tutorialSteps).indexOf(step) + 1} of {Object.keys(tutorialSteps).length - 1}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-lg leading-relaxed">{config.message}</p>

              {config.tips && config.tips.length > 0 && (
                <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Key Points:
                  </p>
                  <ul className="space-y-2">
                    {config.tips.map((tip, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="text-sm flex items-start gap-2"
                      >
                        <span className="text-accent mt-0.5">•</span>
                        <span>{tip}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex items-center gap-3 pt-4">
                {canSkip && (
                  <Button
                    variant="ghost"
                    onClick={onSkip}
                    className="flex-1"
                  >
                    Skip Tutorial
                  </Button>
                )}
                <Button
                  onClick={onNext}
                  size="lg"
                  className="flex-1 bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70"
                >
                  {step === Object.keys(tutorialSteps)[Object.keys(tutorialSteps).length - 2] ? 'Start Playing!' : 'Next'}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>

              {/* Progress Dots */}
              <div className="flex justify-center gap-2 pt-2">
                {Object.keys(tutorialSteps).slice(0, -1).map((stepKey, index) => (
                  <div
                    key={stepKey}
                    className={`h-2 rounded-full transition-all ${
                      index <= Object.keys(tutorialSteps).indexOf(step)
                        ? 'w-8 bg-accent'
                        : 'w-2 bg-muted'
                    }`}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export function TutorialComplete({ onClose }: { onClose: () => void }) {
  const config = tutorialSteps.complete;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-60 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.8, rotate: -5 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0.8, rotate: 5 }}
          className="w-full max-w-lg"
        >
          <Card className="border-accent shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-accent/20 to-primary/20 p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="inline-block"
              >
                {config.icon}
              </motion.div>
              <CardTitle className="text-3xl mt-4">{config.title}</CardTitle>
            </div>
            <CardContent className="space-y-6 pt-6">
              <p className="text-lg text-center leading-relaxed">{config.message}</p>

              {config.tips && (
                <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide text-center">
                    Pro Tips:
                  </p>
                  <ul className="space-y-2">
                    {config.tips.map((tip, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        className="text-sm flex items-start gap-2"
                      >
                        <span className="text-accent mt-0.5">✨</span>
                        <span>{tip}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              )}

              <Button
                onClick={onClose}
                size="lg"
                className="w-full bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90"
              >
                Begin Adventure
                <Sparkles className="w-4 h-4 ml-2" />
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                You can restart this tutorial anytime from the home screen
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
