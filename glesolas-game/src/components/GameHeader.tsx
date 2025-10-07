import { motion } from 'framer-motion';
import { Trophy, Scroll, Save, FolderOpen, Home, Layers } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Progress } from './ui/progress';
import { PlayerLevelDisplay } from './PlayerLevelDisplay';
import type { GamePhase } from '../types/game';
import type { PlayerProfile } from '../types/player';

interface GameHeaderProps {
  glory: number;
  narrativeDice: number;
  phase: GamePhase;
  gameMode?: 'menu' | 'campaign' | 'playground';
  playerProfile?: PlayerProfile;
  deckSize?: number;
  currentChapter?: number;
  onEndSession: () => void;
  onSaveSession: () => void;
  onLoadSession: () => void;
  onOpenCharacterSheet?: () => void;
}

export function GameHeader({
  glory,
  narrativeDice,
  phase,
  gameMode = 'menu',
  playerProfile,
  deckSize,
  currentChapter,
  onEndSession,
  onSaveSession,
  onLoadSession,
  onOpenCharacterSheet,
}: GameHeaderProps) {
  const showStats = gameMode === 'campaign';
  const inGame = phase !== 'home' || gameMode === 'playground';
  return (
    <header className="sticky top-0 z-50 safe-area-top backdrop-blur-lg bg-background/90 border-b border-border/50">
      <div className="max-w-4xl mx-auto">
        {/* Title Bar */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center py-2 px-3 sm:py-3 sm:px-4"
        >
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gradient-solar">/quest</h1>
          <p className="text-muted-foreground text-[10px] sm:text-xs">
            {currentChapter && currentChapter > 1 ? `Chapter ${currentChapter} • ` : ''}Forge your legend
          </p>
        </motion.div>

        {/* Stats Bar - Mobile Optimized */}
        {showStats && (
          <Card className="bg-secondary/30 backdrop-blur border-0 rounded-none border-t border-border/50">
            <CardContent className="p-2 sm:p-3">
              {/* Mobile Layout (< 640px) - Stack vertically */}
              <div className="sm:hidden space-y-2">
                {/* Top Row: Level + Stats */}
                <div className="flex items-center justify-between gap-2">
                  {playerProfile && onOpenCharacterSheet && (
                    <div
                      onClick={onOpenCharacterSheet}
                      className="cursor-pointer active:opacity-70 snappy-transition"
                    >
                      <PlayerLevelDisplay profile={playerProfile} compact />
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Trophy className="w-3.5 h-3.5 text-primary" />
                      <span className="font-mono font-bold text-xs">{glory}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Scroll className="w-3.5 h-3.5 text-accent" />
                      <span className="font-mono font-bold text-xs">{narrativeDice}</span>
                    </div>
                    {deckSize !== undefined && (
                      <div className="flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-blue-400" />
                        <span className="font-mono font-bold text-xs">{deckSize}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Row: Action Buttons */}
                <div className="flex gap-1.5 justify-end">
                  {inGame && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={onEndSession}
                        className="h-8 px-2"
                      >
                        <Home className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={onSaveSession}
                        className="h-8 px-2"
                      >
                        <Save className="w-3.5 h-3.5" />
                      </Button>
                    </>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onLoadSession}
                    className="h-8 px-2"
                  >
                    <FolderOpen className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              {/* Desktop Layout (>= 640px) - Single row */}
              <div className="hidden sm:flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 flex-shrink-0">
                  {playerProfile && onOpenCharacterSheet && (
                    <div
                      onClick={onOpenCharacterSheet}
                      className="cursor-pointer active:opacity-70 snappy-transition"
                    >
                      <PlayerLevelDisplay profile={playerProfile} compact />
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <Trophy className="w-4 h-4 text-primary" />
                    <span className="font-mono font-bold text-sm">{glory}</span>
                    <span className="text-xs text-muted-foreground hidden lg:inline">Glory</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Scroll className="w-4 h-4 text-accent" />
                    <span className="font-mono font-bold text-sm">{narrativeDice}</span>
                    <span className="text-xs text-muted-foreground hidden lg:inline">Dice</span>
                  </div>
                  {deckSize !== undefined && (
                    <div className="flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-blue-400" />
                      <span className="font-mono font-bold text-sm">{deckSize}</span>
                      <span className="text-xs text-muted-foreground hidden lg:inline">Deck</span>
                    </div>
                  )}
                </div>

                <Progress
                  value={narrativeDice}
                  max={100}
                  className="w-16 md:w-24 hidden md:block flex-shrink-0"
                />

                <div className="flex gap-1.5 ml-auto flex-shrink-0">
                  {inGame && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={onEndSession}
                        className="gap-1.5 h-9 px-2"
                      >
                        <Home className="w-4 h-4" />
                        <span className="hidden lg:inline text-xs">Menu</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={onSaveSession}
                        className="gap-1.5 h-9 px-2"
                      >
                        <Save className="w-4 h-4" />
                        <span className="hidden lg:inline text-xs">Save</span>
                      </Button>
                    </>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onLoadSession}
                    className="gap-1.5 h-9 px-2"
                  >
                    <FolderOpen className="w-4 h-4" />
                    <span className="hidden lg:inline text-xs">Load</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </header>
  );
}
