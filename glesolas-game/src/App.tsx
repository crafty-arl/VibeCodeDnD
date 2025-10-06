import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scroll, Sparkles, Trophy } from 'lucide-react';
import type { LoreCard, GamePhase, SkillCheck, RollResult } from './types/game';
import { drawRandomCards } from './data/cards';
import { generateIntroScene, getRandomChallenge } from './data/scenes';
import { determineSkillCheckResult, calculateTotalStats } from './lib/gameEngine';
import { LoreCardComponent } from './components/LoreCardComponent';
import { StatsDisplay } from './components/StatsDisplay';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Progress } from './components/ui/progress';
import './index.css';

function App() {
  const [phase, setPhase] = useState<GamePhase>('home');
  const [activeCards, setActiveCards] = useState<LoreCard[]>([]);
  const [selectedCards, setSelectedCards] = useState<LoreCard[]>([]);
  const [introScene, setIntroScene] = useState<string>('');
  const [currentChallenge, setCurrentChallenge] = useState<SkillCheck | null>(null);
  const [lastResult, setLastResult] = useState<RollResult | null>(null);
  const [glory, setGlory] = useState(0);
  const [narrativeDice, setNarrativeDice] = useState(100);

  useEffect(() => {
    // Load session from localStorage
    const savedGlory = localStorage.getItem('glesolas_glory');
    const savedDice = localStorage.getItem('glesolas_dice');
    if (savedGlory) setGlory(Number(savedGlory));
    if (savedDice) setNarrativeDice(Number(savedDice));
  }, []);

  useEffect(() => {
    // Save session to localStorage
    localStorage.setItem('glesolas_glory', String(glory));
    localStorage.setItem('glesolas_dice', String(narrativeDice));
  }, [glory, narrativeDice]);

  const handleRollInitiative = () => {
    const cards = drawRandomCards(3);
    setActiveCards(cards);
    const scene = generateIntroScene(cards);
    setIntroScene(scene);
    setNarrativeDice(prev => Math.max(0, prev - 1));
    setPhase('intro');
  };

  const handleContinueFromIntro = () => {
    const challenge = getRandomChallenge();
    setCurrentChallenge(challenge);
    setNarrativeDice(prev => Math.max(0, prev - 1));
    setPhase('challenge');
  };

  const handleCardSelect = (card: LoreCard) => {
    setSelectedCards(prev => {
      if (prev.find(c => c.id === card.id)) {
        return prev.filter(c => c.id !== card.id);
      }
      if (prev.length >= 3) return prev;
      return [...prev, card];
    });
  };

  const handlePlayResponse = () => {
    if (!currentChallenge || selectedCards.length !== 3) return;

    const result = determineSkillCheckResult(selectedCards, currentChallenge);
    setLastResult(result);
    setGlory(prev => prev + result.gloryGained);
    setNarrativeDice(prev => prev + result.narrativeDice);
    setPhase('resolution');
  };

  const handleNextEncounter = () => {
    setSelectedCards([]);
    setActiveCards(drawRandomCards(3));
    const challenge = getRandomChallenge();
    setCurrentChallenge(challenge);
    setNarrativeDice(prev => Math.max(0, prev - 1));
    setPhase('challenge');
  };

  const handleEndSession = () => {
    setPhase('home');
    setActiveCards([]);
    setSelectedCards([]);
    setIntroScene('');
    setCurrentChallenge(null);
    setLastResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.header
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center space-y-2"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-primary flex items-center justify-center gap-3">
            <Sparkles className="w-8 h-8" />
            GLESOLAS
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">TPG Story Forge</p>
        </motion.header>

        {/* Stats Bar */}
        <Card className="bg-secondary/30 backdrop-blur">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              <span className="font-mono font-bold">{glory}</span>
              <span className="text-xs text-muted-foreground">Glory</span>
            </div>
            <div className="flex items-center gap-2">
              <Scroll className="w-5 h-5 text-accent" />
              <span className="font-mono font-bold">{narrativeDice}</span>
              <span className="text-xs text-muted-foreground">Dice</span>
            </div>
            <Progress value={narrativeDice} max={100} className="w-24 md:w-32" />
          </CardContent>
        </Card>

        {/* Game Phases */}
        <AnimatePresence mode="wait">
          {phase === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="space-y-6"
            >
              <Card className="border-primary/50">
                <CardHeader>
                  <CardTitle className="text-center">Forge Your Story</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-center">
                  <p className="text-muted-foreground">
                    Draw three lore cards and weave your legend. Face skill checks using Might, Fortune,
                    and Cunning. Earn glory. Roll the dice.
                  </p>
                  <Button
                    onClick={handleRollInitiative}
                    disabled={narrativeDice < 1}
                    size="lg"
                    className="w-full md:w-auto"
                  >
                    Roll Initiative
                  </Button>
                  {narrativeDice < 1 && (
                    <p className="text-sm text-destructive">Not enough Narrative Dice!</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {phase === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="space-y-6"
            >
              <Card className="border-accent/50">
                <CardHeader>
                  <CardTitle>The Story Begins...</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-lg leading-relaxed"
                  >
                    {introScene}
                  </motion.p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {activeCards.map(card => (
                      <LoreCardComponent key={card.id} card={card} disabled />
                    ))}
                  </div>
                  <Button onClick={handleContinueFromIntro} className="w-full" size="lg">
                    Continue
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {phase === 'challenge' && currentChallenge && (
            <motion.div
              key="challenge"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="space-y-6"
            >
              <Card className="border-destructive/50">
                <CardHeader>
                  <CardTitle>Skill Check!</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-lg leading-relaxed">{currentChallenge.scene}</p>
                  <StatsDisplay
                    might={calculateTotalStats(selectedCards).might}
                    fortune={calculateTotalStats(selectedCards).fortune}
                    cunning={calculateTotalStats(selectedCards).cunning}
                    requirements={currentChallenge.requirements}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">
                    Play Your Response ({selectedCards.length}/3 cards)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {activeCards.map(card => (
                      <LoreCardComponent
                        key={card.id}
                        card={card}
                        selected={selectedCards.some(c => c.id === card.id)}
                        onClick={() => handleCardSelect(card)}
                      />
                    ))}
                  </div>
                  <Button
                    onClick={handlePlayResponse}
                    disabled={selectedCards.length !== 3}
                    className="w-full"
                    size="lg"
                  >
                    Resolve
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {phase === 'resolution' && lastResult && (
            <motion.div
              key="resolution"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="space-y-6"
            >
              <Card className={lastResult.success ? 'border-accent' : 'border-destructive'}>
                <CardHeader>
                  <CardTitle>
                    {lastResult.success ? '✓ Success!' : '✗ Fumble...'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-lg leading-relaxed">{lastResult.scene}</p>
                  <div className="grid grid-cols-2 gap-4 p-4 bg-secondary rounded-lg">
                    <div>
                      <p className="text-xs text-muted-foreground">Path</p>
                      <p className="font-mono font-bold capitalize">{lastResult.path}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Glory Gained</p>
                      <p className="font-mono font-bold text-primary">+{lastResult.gloryGained}</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={handleNextEncounter} className="flex-1" size="lg" disabled={narrativeDice < 1}>
                      Next Encounter
                    </Button>
                    <Button onClick={handleEndSession} variant="outline" className="flex-1" size="lg">
                      End Session
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;
