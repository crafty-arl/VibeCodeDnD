import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scroll, Sparkles, Trophy, Save, FolderOpen, Home, Mic, Volume2 } from 'lucide-react';
import type { LoreCard, GamePhase, SkillCheck, RollResult, ActionPath } from './types/game';
// Removed unused import drawRandomCards
import { generateIntroSceneAsync, generateResolutionSceneAsync, generateActionNarrativeAsync, generateTransitionAsync, generateChallengeAsync } from './data/scenes';
import { calculateTotalStats } from './lib/gameEngine';
import { LoreCardComponent } from './components/LoreCardComponent';
import { StatsDisplay } from './components/StatsDisplay';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Progress } from './components/ui/progress';
import { SessionManager, type GameSession } from './lib/sessionManager';
import { SessionManagerComponent, SaveSessionDialog } from './components/SessionManager';
import { DeckSelector } from './components/DeckSelector';
import { DeckBuilder } from './components/DeckBuilder';
import { DeckManager } from './lib/deckManager';
import { NarratorManagerComponent } from './components/NarratorManager';
import { NarratorManager } from './lib/narratorManager';
import { LoadingNarrative } from './components/LoadingNarrative';
import { AudioSettings } from './components/AudioSettings';
import './index.css';

function App() {
  const [phase, setPhase] = useState<GamePhase>('home');
  const [hand, setHand] = useState<LoreCard[]>([]); // Player's hand of 5 cards
  const [activeCards, setActiveCards] = useState<LoreCard[]>([]); // Cards drawn for intro (display only)
  const [selectedCards, setSelectedCards] = useState<LoreCard[]>([]); // 3 cards selected from hand to play
  const [introScene, setIntroScene] = useState<string>('');
  const [currentChallenge, setCurrentChallenge] = useState<SkillCheck | null>(null);
  const [availableActions, setAvailableActions] = useState<ActionPath[]>([]);
  const [lastResult, setLastResult] = useState<RollResult | null>(null);
  const [transitionScene, setTransitionScene] = useState<string>('');
  const [glory, setGlory] = useState(0);
  const [narrativeDice, setNarrativeDice] = useState(100);
  const [isGeneratingNarrative, setIsGeneratingNarrative] = useState(false);
  const [showSessionManager, setShowSessionManager] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [showDeckSelector, setShowDeckSelector] = useState(false);
  const [showDeckBuilder, setShowDeckBuilder] = useState(false);
  const [showNarratorManager, setShowNarratorManager] = useState(false);
  const [showAudioSettings, setShowAudioSettings] = useState(false);

  useEffect(() => {
    // Check for auto-save on initial load
    const autoSave = SessionManager.loadAutoSave();
    if (autoSave && autoSave.phase !== 'home') {
      // Auto-load the auto-save if it exists and game is in progress
      loadSessionState(autoSave);
    } else {
      // Otherwise load basic stats from old localStorage keys
      const savedGlory = localStorage.getItem('glesolas_glory');
      const savedDice = localStorage.getItem('glesolas_dice');
      if (savedGlory) setGlory(Number(savedGlory));
      if (savedDice) setNarrativeDice(Number(savedDice));
    }
  }, []);

  useEffect(() => {
    // Auto-save on state changes (debounced by phase changes)
    if (phase !== 'home') {
      const sessionId = SessionManager.autoSave({
        phase,
        hand,
        activeCards,
        selectedCards,
        introScene,
        currentChallenge,
        availableActions,
        lastResult,
        transitionScene,
        glory,
        narrativeDice,
      }, currentSessionId);

      // Update current session ID if a new one was created
      if (sessionId !== currentSessionId) {
        setCurrentSessionId(sessionId);
      }
    }

    // Keep legacy localStorage for backwards compatibility
    localStorage.setItem('glesolas_glory', String(glory));
    localStorage.setItem('glesolas_dice', String(narrativeDice));
  }, [phase, hand, activeCards, selectedCards, introScene, currentChallenge, availableActions, lastResult, transitionScene, glory, narrativeDice]);

  const handleShowDeckSelector = () => {
    setShowDeckSelector(true);
  };

  const handleDeckSelection = async (selectedCards: LoreCard[]) => {
    setShowDeckSelector(false);
    setIsGeneratingNarrative(true);

    // Use selected 3 cards plus draw 2 more from active deck for a hand of 5
    const additionalCards = DeckManager.drawRandomCards(2, selectedCards.map(c => c.id));
    const playerHand = [...selectedCards, ...additionalCards];
    setHand(playerHand);

    // Use selected 3 cards for intro scene display
    setActiveCards(selectedCards);

    // Generate intro scene (AI or template fallback)
    const scene = await generateIntroSceneAsync(selectedCards);
    setIntroScene(scene);

    setNarrativeDice(prev => Math.max(0, prev - 1));
    setIsGeneratingNarrative(false);
    setPhase('intro');
  };

  const handleRollInitiative = async () => {
    setIsGeneratingNarrative(true);

    // Draw 5 random cards from active deck
    const playerHand = DeckManager.drawRandomCards(5);
    setHand(playerHand);

    // Use first 3 cards for intro scene display
    const introCards = playerHand.slice(0, 3);
    setActiveCards(introCards);

    // Generate intro scene (AI or template fallback)
    const scene = await generateIntroSceneAsync(introCards);
    setIntroScene(scene);

    setNarrativeDice(prev => Math.max(0, prev - 1));
    setIsGeneratingNarrative(false);
    setPhase('intro');
  };

  const handleContinueFromIntro = async () => {
    setIsGeneratingNarrative(true);

    // Generate contextual challenge based on intro scene
    const challenge = await generateChallengeAsync(activeCards, introScene);
    setCurrentChallenge(challenge);
    setNarrativeDice(prev => Math.max(0, prev - 1));

    setIsGeneratingNarrative(false);
    setPhase('challenge');
  };

  const handleCardSelect = (card: LoreCard) => {
    setSelectedCards(prev => {
      if (prev.find(c => c.id === card.id)) {
        // Deselect card
        return prev.filter(c => c.id !== card.id);
      }
      if (prev.length >= 3) {
        // Already have 3 selected, replace the oldest one
        return [...prev.slice(1), card];
      }
      // Add to selection
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

    // Generate all unlocked action narratives in parallel for speed
    const [mightNarrative, fortuneNarrative, cunningNarrative] = await Promise.all([
      mightUnlocked
        ? generateActionNarrativeAsync(selectedCards, 'might', currentChallenge.scene, introScene)
        : Promise.resolve(`Requires ${might_req} Might (you have ${total.might})`),
      fortuneUnlocked
        ? generateActionNarrativeAsync(selectedCards, 'fortune', currentChallenge.scene, introScene)
        : Promise.resolve(`Requires ${fortune_req} Fortune (you have ${total.fortune})`),
      cunningUnlocked
        ? generateActionNarrativeAsync(selectedCards, 'cunning', currentChallenge.scene, introScene)
        : Promise.resolve(`Requires ${cunning_req} Cunning (you have ${total.cunning})`),
    ]);

    const actions: ActionPath[] = [
      { path: 'might', narrative: mightNarrative, unlocked: mightUnlocked },
      { path: 'fortune', narrative: fortuneNarrative, unlocked: fortuneUnlocked },
      { path: 'cunning', narrative: cunningNarrative, unlocked: cunningUnlocked },
    ];

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

  const handleNextEncounter = async () => {
    if (!lastResult || !currentChallenge) return;

    setIsGeneratingNarrative(true);
    setSelectedCards([]);

    // Replenish hand: remove played cards and draw new ones from active deck
    const remainingCards = hand.filter(c => !selectedCards.find(sc => sc.id === c.id));
    const cardsToDrawCount = 5 - remainingCards.length;
    const usedCardIds = hand.map(c => c.id);
    const newCards = DeckManager.drawRandomCards(cardsToDrawCount, usedCardIds);
    const newHand = [...remainingCards, ...newCards];
    setHand(newHand);

    // Use first 3 cards from new hand for display
    const displayCards = newHand.slice(0, 3);
    setActiveCards(displayCards);

    // Generate challenge and transition in parallel for speed
    const [newChallenge, transition] = await Promise.all([
      generateChallengeAsync(
        displayCards,
        introScene,
        lastResult.scene // Use previous resolution as transition context
      ),
      generateTransitionAsync(
        lastResult.path,
        lastResult.success,
        lastResult.scene,
        displayCards,
        currentChallenge.scene // Use current challenge (before new one generated)
      ),
    ]);

    setTransitionScene(transition);
    setCurrentChallenge(newChallenge);
    setNarrativeDice(prev => Math.max(0, prev - 1));
    setIsGeneratingNarrative(false);
    setPhase('transition');
  };

  const handleContinueFromTransition = () => {
    setPhase('challenge');
  };

  const handleEndSession = () => {
    setPhase('home');
    setHand([]);
    setActiveCards([]);
    setSelectedCards([]);
    setIntroScene('');
    setCurrentChallenge(null);
    setAvailableActions([]);
    setLastResult(null);
    setTransitionScene('');
    setCurrentSessionId(null);
    SessionManager.clearAutoSave();
  };

  const loadSessionState = (session: GameSession) => {
    setPhase(session.phase);
    setHand(session.hand || []);
    setActiveCards(session.activeCards);
    setSelectedCards(session.selectedCards);
    setIntroScene(session.introScene);
    setCurrentChallenge(session.currentChallenge);
    setAvailableActions(session.availableActions);
    setLastResult(session.lastResult);
    setTransitionScene(session.transitionScene);
    setGlory(session.glory);
    setNarrativeDice(session.narrativeDice);
    setCurrentSessionId(session.id);
  };

  const handleSaveSession = (name: string) => {
    const session = SessionManager.saveSession({
      phase,
      hand,
      activeCards,
      selectedCards,
      introScene,
      currentChallenge,
      availableActions,
      lastResult,
      transitionScene,
      glory,
      narrativeDice,
    }, name);
    setCurrentSessionId(session.id);
  };

  const handleLoadSession = (session: GameSession) => {
    loadSessionState(session);
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
          <CardContent className="p-4 flex items-center justify-between flex-wrap gap-3">
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
            <div className="flex gap-2 ml-auto">
              {phase !== 'home' && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEndSession}
                    className="gap-2"
                  >
                    <Home className="w-4 h-4" />
                    <span className="hidden sm:inline">Menu</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSaveDialog(true)}
                    className="gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span className="hidden sm:inline">Save</span>
                  </Button>
                </>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSessionManager(true)}
                className="gap-2"
              >
                <FolderOpen className="w-4 h-4" />
                <span className="hidden sm:inline">Load</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Game Phases */}
        <AnimatePresence mode="wait">
          {phase === 'home' && !showDeckSelector && !showDeckBuilder && !showNarratorManager && !showAudioSettings && (
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
                  <div className="space-y-2">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">
                          Active Deck: <span className="font-semibold text-foreground">{DeckManager.getActiveDeck().name}</span>
                        </p>
                        <Button
                          onClick={() => setShowDeckBuilder(true)}
                          variant="ghost"
                          size="sm"
                          className="text-xs"
                        >
                          Manage Decks
                        </Button>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">
                          Active DM: <span className="font-semibold text-foreground">{NarratorManager.getActiveNarrator().name}</span>
                        </p>
                        <Button
                          onClick={() => setShowNarratorManager(true)}
                          variant="ghost"
                          size="sm"
                          className="text-xs gap-1"
                        >
                          <Mic className="w-3 h-3" />
                          Manage DMs
                        </Button>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">
                          Voice Narration
                        </p>
                        <Button
                          onClick={() => setShowAudioSettings(true)}
                          variant="ghost"
                          size="sm"
                          className="text-xs gap-1"
                        >
                          <Volume2 className="w-3 h-3" />
                          Audio Settings
                        </Button>
                      </div>
                    </div>
                  </div>

                  <p className="text-muted-foreground">
                    Choose how to begin your adventure: select your starting cards or let fate decide.
                  </p>
                  <div className="flex flex-col md:flex-row gap-3 justify-center">
                    <Button
                      onClick={handleShowDeckSelector}
                      disabled={narrativeDice < 1}
                      size="lg"
                      className="flex-1 md:flex-none"
                      variant="default"
                    >
                      Choose Starting Cards
                    </Button>
                    <Button
                      onClick={handleRollInitiative}
                      disabled={narrativeDice < 1 || isGeneratingNarrative}
                      size="lg"
                      className="flex-1 md:flex-none"
                      variant="outline"
                    >
                      {isGeneratingNarrative ? 'Weaving your tale...' : 'Random Draw'}
                    </Button>
                  </div>
                  {narrativeDice < 1 && (
                    <p className="text-sm text-destructive">Not enough Narrative Dice!</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {phase === 'home' && showDeckSelector && (
            <DeckSelector
              onConfirmSelection={handleDeckSelection}
              onCancel={() => setShowDeckSelector(false)}
            />
          )}

          {phase === 'home' && showDeckBuilder && (
            <DeckBuilder
              onClose={() => setShowDeckBuilder(false)}
            />
          )}

          {phase === 'home' && showNarratorManager && (
            <NarratorManagerComponent
              onClose={() => setShowNarratorManager(false)}
            />
          )}

          {phase === 'home' && showAudioSettings && (
            <AudioSettings
              onClose={() => setShowAudioSettings(false)}
            />
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
                    <LoadingNarrative type="intro" />
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

          {phase === 'challenge' && (
            <motion.div
              key="challenge"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="space-y-6"
            >
              {isGeneratingNarrative ? (
                <Card className="border-destructive/50">
                  <CardHeader>
                    <CardTitle>✨ Generating Challenge...</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <LoadingNarrative type="challenge" />
                  </CardContent>
                </Card>
              ) : currentChallenge ? (
                <>
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
                    Your Hand - Select 3 Cards to Play ({selectedCards.length}/3 selected)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-xs text-muted-foreground">
                    Choose 3 cards from your hand of {hand.length} to play in this encounter
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    {hand.map(card => (
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
                    {isGeneratingNarrative ? 'Generating Actions...' : 'Play Selected Cards'}
                  </Button>
                </CardContent>
              </Card>
              </>
            ) : null}
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
                    <LoadingNarrative type="action" />
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
                    <LoadingNarrative type="resolution" />
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
                    <Button onClick={handleNextEncounter} className="flex-1" size="lg" disabled={narrativeDice < 1 || isGeneratingNarrative}>
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

          {phase === 'transition' && (
            <motion.div
              key="transition"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-6"
            >
              <Card className="border-primary/50">
                <CardHeader>
                  <CardTitle>
                    {isGeneratingNarrative ? '✨ Forging the Next Chapter...' : '⚡ The Story Continues'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isGeneratingNarrative ? (
                    <LoadingNarrative type="transition" />
                  ) : (
                    <>
                      <p className="text-lg leading-relaxed italic">{transitionScene}</p>
                      <Button onClick={handleContinueFromTransition} className="w-full" size="lg">
                        Continue →
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Session Management Modals */}
        <AnimatePresence>
          {showSessionManager && (
            <SessionManagerComponent
              onLoadSession={handleLoadSession}
              onClose={() => setShowSessionManager(false)}
            />
          )}
          {showSaveDialog && (
            <SaveSessionDialog
              onSave={handleSaveSession}
              onClose={() => setShowSaveDialog(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;
