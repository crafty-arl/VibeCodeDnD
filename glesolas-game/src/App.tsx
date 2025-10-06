import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scroll, Sparkles, Trophy } from 'lucide-react';
import type { LoreCard, GamePhase, SkillCheck, RollResult, ActionPath } from './types/game';
import { drawRandomCards } from './data/cards';
import { generateIntroSceneAsync, getRandomChallenge, generateResolutionSceneAsync, generateActionNarrativeAsync } from './data/scenes';
import { calculateTotalStats } from './lib/gameEngine';
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
  const [availableActions, setAvailableActions] = useState<ActionPath[]>([]);
  const [lastResult, setLastResult] = useState<RollResult | null>(null);
  const [glory, setGlory] = useState(0);
  const [narrativeDice, setNarrativeDice] = useState(100);
  const [isGeneratingNarrative, setIsGeneratingNarrative] = useState(false);

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

  const handleRollInitiative = async () => {
    setIsGeneratingNarrative(true);
    const cards = drawRandomCards(3);
    setActiveCards(cards);

    // Generate intro scene (AI or template fallback)
    const scene = await generateIntroSceneAsync(cards);
    setIntroScene(scene);

    setNarrativeDice(prev => Math.max(0, prev - 1));
    setIsGeneratingNarrative(false);
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

  const handlePlayResponse = async () => {
    if (!currentChallenge || selectedCards.length !== 3) return;

    setIsGeneratingNarrative(true);

    // Calculate stats to determine which paths are unlocked
    const total = calculateTotalStats(selectedCards);
    const { might_req, fortune_req, cunning_req } = currentChallenge.requirements;

    const mightUnlocked = total.might >= might_req;
    const fortuneUnlocked = total.fortune >= fortune_req;
    const cunningUnlocked = total.cunning >= cunning_req;

    // Generate action narratives for each unlocked path
    const actions: ActionPath[] = [];

    if (mightUnlocked) {
      const narrative = await generateActionNarrativeAsync(
        selectedCards,
        'might',
        currentChallenge.scene,
        introScene
      );
      actions.push({ path: 'might', narrative, unlocked: true });
    } else {
      actions.push({
        path: 'might',
        narrative: `Requires ${might_req} Might (you have ${total.might})`,
        unlocked: false
      });
    }

    if (fortuneUnlocked) {
      const narrative = await generateActionNarrativeAsync(
        selectedCards,
        'fortune',
        currentChallenge.scene,
        introScene
      );
      actions.push({ path: 'fortune', narrative, unlocked: true });
    } else {
      actions.push({
        path: 'fortune',
        narrative: `Requires ${fortune_req} Fortune (you have ${total.fortune})`,
        unlocked: false
      });
    }

    if (cunningUnlocked) {
      const narrative = await generateActionNarrativeAsync(
        selectedCards,
        'cunning',
        currentChallenge.scene,
        introScene
      );
      actions.push({ path: 'cunning', narrative, unlocked: true });
    } else {
      actions.push({
        path: 'cunning',
        narrative: `Requires ${cunning_req} Cunning (you have ${total.cunning})`,
        unlocked: false
      });
    }

    setAvailableActions(actions);
    setIsGeneratingNarrative(false);
    setPhase('action-choice');
  };

  const handleActionChoice = async (chosenPath: 'might' | 'fortune' | 'cunning') => {
    if (!currentChallenge) return;

    setIsGeneratingNarrative(true);

    // Calculate rewards based on chosen path
    const gloryGained = chosenPath === 'might' ? 50 : chosenPath === 'fortune' ? 40 : 60;
    const narrativeDiceGained = 2;

    // Generate resolution scene based on chosen path (always success since path was unlocked)
    const scene = await generateResolutionSceneAsync(
      selectedCards,
      chosenPath,
      true, // success = true (they unlocked this path)
      currentChallenge.scene,
      introScene
    );

    const total = calculateTotalStats(selectedCards);

    setLastResult({
      path: chosenPath,
      success: true,
      total,
      scene,
      gloryGained,
      narrativeDice: narrativeDiceGained,
    });

    setGlory(prev => prev + gloryGained);
    setNarrativeDice(prev => prev + narrativeDiceGained);
    setIsGeneratingNarrative(false);
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
    setAvailableActions([]);
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
                    disabled={narrativeDice < 1 || isGeneratingNarrative}
                    size="lg"
                    className="w-full md:w-auto"
                  >
                    {isGeneratingNarrative ? 'Weaving your tale...' : 'Roll Initiative'}
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
                  <CardTitle>
                    {isGeneratingNarrative ? '✨ AI Weaving Your Tale...' : 'The Story Begins...'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isGeneratingNarrative ? (
                    <div className="flex items-center justify-center p-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="text-lg leading-relaxed"
                    >
                      {introScene}
                    </motion.p>
                  )}
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
                    disabled={selectedCards.length !== 3 || isGeneratingNarrative}
                    className="w-full"
                    size="lg"
                  >
                    {isGeneratingNarrative ? 'Generating Actions...' : 'Play Cards'}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {phase === 'action-choice' && availableActions.length > 0 && (
            <motion.div
              key="action-choice"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="space-y-6"
            >
              <Card className="border-accent/50">
                <CardHeader>
                  <CardTitle>
                    {isGeneratingNarrative ? '✨ Weaving Your Stories...' : 'Choose Your Path'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isGeneratingNarrative ? (
                    <div className="flex items-center justify-center p-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-muted-foreground">
                        You've played your cards. Now choose how to use them:
                      </p>
                      <div className="space-y-3">
                        {availableActions.map(action => (
                          <motion.div
                            key={action.path}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                          >
                            <Button
                              onClick={() => handleActionChoice(action.path)}
                              disabled={!action.unlocked}
                              className="w-full h-auto p-4 text-left justify-start whitespace-normal"
                              variant={action.unlocked ? 'default' : 'outline'}
                              size="lg"
                            >
                              <div className="space-y-1 w-full">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold capitalize text-base">
                                    {action.path}
                                  </span>
                                  {!action.unlocked && (
                                    <span className="text-xs text-destructive whitespace-nowrap">🔒 Locked</span>
                                  )}
                                </div>
                                <p className={`text-sm whitespace-normal ${action.unlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
                                  {action.narrative}
                                </p>
                              </div>
                            </Button>
                          </motion.div>
                        ))}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Show selected cards */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Cards Played</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {selectedCards.map(card => (
                      <LoreCardComponent key={card.id} card={card} disabled />
                    ))}
                  </div>
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
                    {isGeneratingNarrative
                      ? '✨ AI Resolving Your Actions...'
                      : lastResult.success
                      ? '✓ Success!'
                      : '✗ Fumble...'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isGeneratingNarrative ? (
                    <div className="flex items-center justify-center p-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <p className="text-lg leading-relaxed">{lastResult.scene}</p>
                  )}
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
