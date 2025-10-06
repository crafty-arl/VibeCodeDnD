import { motion } from 'framer-motion';
import { Trophy, Scroll, Save, FolderOpen, Home } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Progress } from './ui/progress';
import type { GamePhase } from '../types/game';

interface GameHeaderProps {
  glory: number;
  narrativeDice: number;
  phase: GamePhase;
  gameMode?: 'menu' | 'campaign' | 'playground';
  onEndSession: () => void;
  onSaveSession: () => void;
  onLoadSession: () => void;
}

export function GameHeader({
  glory,
  narrativeDice,
  phase,
  gameMode = 'menu',
  onEndSession,
  onSaveSession,
  onLoadSession,
}: GameHeaderProps) {
  const showStats = gameMode === 'campaign';
  const inGame = phase !== 'home' || gameMode === 'playground';
  return (
    <header className="sticky top-0 z-50 safe-area-top backdrop-blur-lg bg-background/80 border-b border-border/50">
      <div className="max-w-4xl mx-auto">
        {/* Title Bar */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center py-3 px-4"
        >
          <h1 className="text-2xl md:text-3xl font-bold text-gradient-solar">/quest</h1>
          <p className="text-muted-foreground text-xs">Forge your legend</p>
        </motion.div>

        {/* Stats Bar */}
        {showStats && (
          <Card className="bg-secondary/30 backdrop-blur border-0 rounded-none border-t border-border/50">
            <CardContent className="p-3 flex items-center justify-between gap-2">
              {/* Stats - Campaign Mode Only */}
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-primary" />
                  <span className="font-mono font-bold text-sm">{glory}</span>
                  <span className="text-xs text-muted-foreground hidden sm:inline">Glory</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Scroll className="w-4 h-4 text-accent" />
                  <span className="font-mono font-bold text-sm">{narrativeDice}</span>
                  <span className="text-xs text-muted-foreground hidden sm:inline">Dice</span>
                </div>
              </div>

              {/* Progress bar - hidden on very small screens */}
              <Progress
                value={narrativeDice}
                max={100}
                className="w-16 md:w-24 hidden xs:block flex-shrink-0"
              />

              {/* Action Buttons */}
              <div className="flex gap-1.5 ml-auto flex-shrink-0">
                {inGame && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onEndSession}
                    className="gap-1.5 mobile-touch-target instant-feedback h-8 px-2"
                  >
                    <Home className="w-4 h-4" />
                    <span className="hidden md:inline text-xs">Menu</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onSaveSession}
                    className="gap-1.5 mobile-touch-target instant-feedback h-8 px-2"
                  >
                    <Save className="w-4 h-4" />
                    <span className="hidden md:inline text-xs">Save</span>
                  </Button>
                </>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={onLoadSession}
                className="gap-1.5 mobile-touch-target instant-feedback h-8 px-2"
              >
                <FolderOpen className="w-4 h-4" />
                <span className="hidden md:inline text-xs">Load</span>
              </Button>
            </div>
          </CardContent>
        </Card>
        )}
      </div>
    </header>
  );
}
