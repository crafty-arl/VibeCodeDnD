import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scroll, Trophy, Mic } from 'lucide-react';
import type { LoreCard, GamePhase, SkillCheck, RollResult, ActionPath } from './types/game';
import type { PlaygroundStartMode, ThemeOption, PlaygroundScene, NarrativePrompt, StoryMemory } from './types/playground';
import type { PlayerProfile, LevelUpResult } from './types/player';
// Removed unused import drawRandomCards
import { generateIntroSceneAsync, generateResolutionSceneAsync, generateActionNarrativeAsync, generateTransitionAsync, generateChallengeAsync } from './data/scenes';
import { calculateTotalStats } from './lib/gameEngine';
import { LoreCardComponent } from './components/LoreCardComponent';
import { StatsDisplay } from './components/StatsDisplay';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { SessionManager, type GameSession } from './lib/sessionManager';
import { SessionManagerComponent, SaveSessionDialog } from './components/SessionManager';
import { DeckSelector } from './components/DeckSelector';
import { DeckBuilder } from './components/DeckBuilder';
import { DeckManager } from './lib/deckManager';
import { NarratorManager } from './lib/narratorManager';
import { NarratorManagerComponent } from './components/NarratorManager';
import { LoadingNarrative } from './components/LoadingNarrative';
import { PlaygroundMode } from './components/PlaygroundMode';
import { PlaygroundGameView } from './components/PlaygroundGameView';
import {
  generateOpeningScene,
  processPlayerAction,
  generateAISuggestions,
  generatePlotTwist,
  generateToneShift,
  createPlaygroundScene,
  generateStoryConclusion
} from './lib/playgroundEngine';
import { StoryMemoryManager } from './lib/storyMemory';
import { GameHeader } from './components/GameHeader';
import { GameFooter } from './components/GameFooter';
import { BottomActionSheet, ActionSheetButton } from './components/BottomActionSheet';
import { ImprovedCardHand } from './components/ImprovedCardHand';
import { CardPlayArea } from './components/CardPlayArea';
import { CardDetailModal } from './components/CardDetailModal';
import { SceneNarrationButton } from './components/SceneNarrationButton';
import { SceneImage } from './components/SceneImage';
import { LevelUpModal } from './components/LevelUpModal';
import { PlayerLevelDisplay } from './components/PlayerLevelDisplay';
import { PerkSelectionModal } from './components/PerkSelectionModal';
import { AchievementsPanel } from './components/AchievementsPanel';
import { DifficultySelector } from './components/DifficultySelector';
import { getOrCreatePlayerProfile, awardXP, updateEncounterStats, savePlayerProfile } from './lib/levelingService';
import { getDifficultyById, type DifficultyId } from './types/difficulty';
import { Swords, Sparkles, Dices } from 'lucide-react';
import './index.css';

function App() {
  const [gameMode, setGameMode] = useState<'menu' | 'campaign' | 'playground'>('menu');
  const [phase, setPhase] = useState<GamePhase>('home');
  const [hand, setHand] = useState<LoreCard[]>([]); // Player's hand (starts at 3, max 5)
  const [activeCards, setActiveCards] = useState<LoreCard[]>([]); // Cards drawn for intro (display only)
  const [selectedCards, setSelectedCards] = useState<LoreCard[]>([]); // Cards selected to play (starts at 1, max 3)
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
  const [detailModalCard, setDetailModalCard] = useState<LoreCard | null>(null);

  // Leveling System State
  const [playerProfile, setPlayerProfile] = useState<PlayerProfile>(getOrCreatePlayerProfile());
  const [levelUpResult, setLevelUpResult] = useState<LevelUpResult | null>(null);
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [showPerkModal, setShowPerkModal] = useState(false);
  const [showCharacterSheet, setShowCharacterSheet] = useState(false);
  const [showDifficultySelector, setShowDifficultySelector] = useState(false);

  // Playground Mode State
  const [playgroundPhase, setPlaygroundPhase] = useState<'setup' | 'playing' | 'complete'>('setup');
  const [playgroundScenes, setPlaygroundScenes] = useState<PlaygroundScene[]>([]);
  const [playgroundMemory, setPlaygroundMemory] = useState<StoryMemory | null>(null);
  const [playgroundCards, setPlaygroundCards] = useState<LoreCard[]>([]);
  const [playgroundSelectedCards, setPlaygroundSelectedCards] = useState<LoreCard[]>([]);
  const [isPlaygroundLoading, setIsPlaygroundLoading] = useState(false);

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

    // Initialize Vectorize with active deck
    const initializeVectorize = async () => {
      try {
        const activeDeck = DeckManager.getActiveDeck();
        await DeckManager.setActiveDeck(activeDeck.id);
        console.log('✅ Vectorize initialized with active deck');
      } catch (error) {
        console.warn('⚠️ Failed to initialize Vectorize on app load:', error);
      }
    };

    initializeVectorize();
  }, []);

  useEffect(() => {
    // Auto-save on state changes (debounced by phase changes)
    if (phase !== 'home' && gameMode === 'campaign') {
      const sessionId = SessionManager.autoSave({
        phase,
        gameMode,
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
  }, [phase, gameMode, hand, activeCards, selectedCards, introScene, currentChallenge, availableActions, lastResult, transitionScene, glory, narrativeDice]);

  const handleDeckSelection = async () => {
    setShowDeckSelector(false);
    setGameMode('campaign'); // Set to campaign mode
    setIsGeneratingNarrative(true);

    // Draw starting hand of 3 cards
    const startingHand = DeckManager.drawRandomCards(3);
    setHand(startingHand);

    // Use all 3 cards for intro scene display
    setActiveCards(startingHand);

    // Generate intro scene (AI or template fallback) with Vectorize context
    const activeDeck = DeckManager.getActiveDeck();
    const scene = await generateIntroSceneAsync(startingHand, true, activeDeck.cards);
    setIntroScene(scene);

    setNarrativeDice(prev => Math.max(0, prev - 1));
    setIsGeneratingNarrative(false);
    setPhase('intro');
  };

  const handleRollInitiative = async () => {
    setGameMode('campaign'); // Set to campaign mode
    setIsGeneratingNarrative(true);

    // Draw starting hand of 3 cards
    const startingHand = DeckManager.drawRandomCards(3);
    setHand(startingHand);

    // Use all 3 cards for intro scene display
    setActiveCards(startingHand);

    // Generate intro scene (AI or template fallback) with Vectorize context
    const activeDeck = DeckManager.getActiveDeck();
    const scene = await generateIntroSceneAsync(startingHand, true, activeDeck.cards);
    setIntroScene(scene);

    setNarrativeDice(prev => Math.max(0, prev - 1));
    setIsGeneratingNarrative(false);
    setPhase('intro');
  };

  const handleContinueFromIntro = async () => {
    setIsGeneratingNarrative(true);

    // Generate contextual challenge based on intro scene
    const challenge = await generateChallengeAsync(activeCards, introScene, undefined, true, playerProfile);
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
      if (prev.length >= playerProfile.playAreaSize) {
        // Already have max cards selected
        return prev;
      }
      // Add to selection
      return [...prev, card];
    });
  };

  const handleRemoveCard = (card: LoreCard) => {
    setSelectedCards(prev => prev.filter(c => c.id !== card.id));
  };

  const handlePlayResponse = async () => {
    if (!currentChallenge || selectedCards.length !== playerProfile.playAreaSize) return;

    setIsGeneratingNarrative(true);

    // Calculate stats to determine which paths are unlocked (with player bonuses)
    const total = calculateTotalStats(selectedCards, playerProfile);
    const { might_req, fortune_req, cunning_req } = currentChallenge.requirements;

    const mightUnlocked = total.might >= might_req;
    const fortuneUnlocked = total.fortune >= fortune_req;
    const cunningUnlocked = total.cunning >= cunning_req;

    console.log('🎲 Challenge Requirements:', { might_req, fortune_req, cunning_req });
    console.log('💪 Your Stats:', total);
    console.log('🔓 Unlocked Paths:', { mightUnlocked, fortuneUnlocked, cunningUnlocked });

    const unlockedCount = [mightUnlocked, fortuneUnlocked, cunningUnlocked].filter(Boolean).length;

    // TOTAL FAILURE: Didn't meet ANY requirements - must choose which bad thing happens
    if (unlockedCount === 0) {
      console.log('💀 TOTAL FAILURE - No paths unlocked! Choose your doom...');

      const failureNarratives = await Promise.all([
        generateActionNarrativeAsync(selectedCards, 'might', currentChallenge.scene, introScene),
        generateActionNarrativeAsync(selectedCards, 'fortune', currentChallenge.scene, introScene),
        generateActionNarrativeAsync(selectedCards, 'cunning', currentChallenge.scene, introScene),
      ]);

      const actions: ActionPath[] = [
        { path: 'might', narrative: `💀 ${failureNarratives[0]} (But it goes badly...)`, unlocked: false },
        { path: 'fortune', narrative: `💀 ${failureNarratives[1]} (But it goes badly...)`, unlocked: false },
        { path: 'cunning', narrative: `💀 ${failureNarratives[2]} (But it goes badly...)`, unlocked: false },
      ];

      setNarrativeDice(prev => Math.max(0, prev - 3)); // Used 3 dice for failure scenarios
      setAvailableActions(actions);
      setIsGeneratingNarrative(false);
      setPhase('action-choice');
      return;
    }

    // NORMAL: At least one path unlocked
    const [mightNarrative, fortuneNarrative, cunningNarrative] = await Promise.all([
      mightUnlocked
        ? generateActionNarrativeAsync(selectedCards, 'might', currentChallenge.scene, introScene)
        : Promise.resolve(`🔒 Locked: Requires ${might_req} Might (you have ${total.might})`),
      fortuneUnlocked
        ? generateActionNarrativeAsync(selectedCards, 'fortune', currentChallenge.scene, introScene)
        : Promise.resolve(`🔒 Locked: Requires ${fortune_req} Fortune (you have ${total.fortune})`),
      cunningUnlocked
        ? generateActionNarrativeAsync(selectedCards, 'cunning', currentChallenge.scene, introScene)
        : Promise.resolve(`🔒 Locked: Requires ${cunning_req} Cunning (you have ${total.cunning})`),
    ]);

    const actions: ActionPath[] = [
      { path: 'might', narrative: mightNarrative, unlocked: mightUnlocked },
      { path: 'fortune', narrative: fortuneNarrative, unlocked: fortuneUnlocked },
      { path: 'cunning', narrative: cunningNarrative, unlocked: cunningUnlocked },
    ];

    // Deduct narrative dice ONLY for unlocked paths that generated AI content
    if (unlockedCount > 0) {
      setNarrativeDice(prev => Math.max(0, prev - unlockedCount));
      console.log(`🎲 Used ${unlockedCount} narrative dice for unlocked paths`);
    }

    setAvailableActions(actions);
    setIsGeneratingNarrative(false);
    setPhase('action-choice');
  };

  const handleActionChoice = async (chosenPath: 'might' | 'fortune' | 'cunning') => {
    if (!currentChallenge) return;

    // Check if this path was unlocked
    const chosenAction = availableActions.find(a => a.path === chosenPath);
    const isUnlocked = chosenAction?.unlocked ?? false;

    // Check if ALL paths were locked (total failure scenario)
    const totalFailure = availableActions.every(a => !a.unlocked);

    setIsGeneratingNarrative(true);

    // Calculate rewards/penalties based on whether path was unlocked
    let success: boolean;
    let gloryGained: number;
    let narrativeDiceGained: number;

    // Check if chosen path is the key stat
    const isKeyStat = currentChallenge.keyStat === chosenPath;

    // Get difficulty multiplier for rewards
    const { getDifficultyById } = await import('./types/difficulty');
    const difficulty = getDifficultyById(playerProfile.selectedDifficulty);
    const difficultyMultiplier = difficulty.rewardMultiplier;

    if (totalFailure) {
      // TOTAL FAILURE: All paths locked - choose your doom
      success = false;
      gloryGained = Math.floor(-50 * difficultyMultiplier); // Bigger penalty scales with difficulty
      narrativeDiceGained = 0;
      console.log(`💀💀💀 TOTAL FAILURE - Choose lesser of evils. Lose glory: ${gloryGained}`);
    } else if (isUnlocked) {
      // Path was unlocked - guaranteed success!
      success = true;

      // KEY STAT SYSTEM: Full rewards if using the key stat, reduced if not
      if (isKeyStat) {
        // Using the key stat = full rewards
        const baseGlory = chosenPath === 'might' ? 50 : chosenPath === 'fortune' ? 40 : 60;
        gloryGained = Math.floor(baseGlory * difficultyMultiplier);
        narrativeDiceGained = 2;
        console.log(`✨🔑 KEY STAT used! Full glory: +${gloryGained} (${difficulty.name})`);
      } else {
        // Using non-key stat = reduced rewards (60% of normal)
        const baseGlory = chosenPath === 'might' ? 50 : chosenPath === 'fortune' ? 40 : 60;
        gloryGained = Math.floor(baseGlory * 0.6 * difficultyMultiplier);
        narrativeDiceGained = 1;
        console.log(`⚠️ Non-key stat used. Reduced glory: +${gloryGained} (key was ${currentChallenge.keyStat})`);
      }
    } else {
      // Risky! Path was locked but others were unlocked - 50% chance of success
      success = Math.random() >= 0.5;

      if (success) {
        // DM lets you pass - reduced rewards
        const baseGlory = chosenPath === 'might' ? 25 : chosenPath === 'fortune' ? 20 : 30;
        gloryGained = Math.floor(baseGlory * difficultyMultiplier);
        narrativeDiceGained = 1;
        console.log(`🎲 Locked path - DM mercy! Success with reduced glory: +${gloryGained}`);
      } else {
        // Failed the risky choice - lose glory!
        gloryGained = Math.floor(-30 * difficultyMultiplier);
        narrativeDiceGained = 0;
        console.log(`💀 Locked path - FAILED! Lose glory: ${gloryGained}`);
      }
    }

    // Generate resolution scene based on chosen path and success
    const scene = await generateResolutionSceneAsync(
      selectedCards,
      chosenPath,
      success,
      currentChallenge.scene,
      introScene
    );

    const total = calculateTotalStats(selectedCards, playerProfile);

    setLastResult({
      path: chosenPath,
      success,
      total,
      scene,
      gloryGained,
      narrativeDice: narrativeDiceGained,
    });

    setGlory(prev => Math.max(0, prev + gloryGained)); // Can't go below 0
    setNarrativeDice(prev => prev + narrativeDiceGained);

    // Award XP and update player stats
    updateEncounterStats(playerProfile, success, chosenPath, gloryGained, selectedCards.length);
    if (success && gloryGained > 0) {
      const levelUp = awardXP(playerProfile, gloryGained);
      savePlayerProfile(playerProfile);
      setPlayerProfile({ ...playerProfile });

      // Show level-up modal if leveled up
      if (levelUp) {
        setLevelUpResult(levelUp);
        setShowLevelUpModal(true);
      }
    }

    setIsGeneratingNarrative(false);
    setPhase('resolution');
  };

  const handleNextEncounter = async () => {
    if (!lastResult || !currentChallenge) return;

    setIsGeneratingNarrative(true);
    setSelectedCards([]);

    // Draw new hand based on player's hand size (excludes previously used cards for variety)
    const usedCardIds = hand.map(c => c.id);
    const newHand = DeckManager.drawRandomCards(playerProfile.handSize, usedCardIds);
    setHand(newHand);

    // Use all 3 cards for display
    setActiveCards(newHand);

    // Generate challenge and transition in parallel for speed
    const [newChallenge, transition] = await Promise.all([
      generateChallengeAsync(
        newHand,
        introScene,
        lastResult.scene, // Use previous resolution as transition context
        true,
        playerProfile
      ),
      generateTransitionAsync(
        lastResult.path,
        lastResult.success,
        lastResult.scene,
        newHand,
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
    setGameMode('menu');
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

  const [isStartingCampaign, setIsStartingCampaign] = useState(false);

  const handleStartCampaignMode = () => {
    // Mark that we're starting a campaign (not just changing difficulty)
    setIsStartingCampaign(true);
    setShowDifficultySelector(true);
  };

  const handleDifficultySelected = (difficultyId: DifficultyId) => {
    // Update player profile with new difficulty
    playerProfile.selectedDifficulty = difficultyId;
    savePlayerProfile(playerProfile);
    setPlayerProfile({ ...playerProfile });
    setShowDifficultySelector(false);

    // Scroll to top when navigating
    document.getElementById('main-content')?.scrollTo(0, 0);

    // If we were starting campaign mode, continue to deck selector
    if (isStartingCampaign) {
      setIsStartingCampaign(false);
      setGameMode('campaign');
      setPhase('home');
      setShowDeckSelector(true);
    }
    // Otherwise, just close the selector (user was changing difficulty from home screen)
  };

  const handleStartPlaygroundMode = () => {
    setGameMode('playground');
    setPlaygroundPhase('setup');
  };

  const handleBackToMenu = () => {
    setGameMode('menu');
    setPhase('home');
    setPlaygroundPhase('setup');
    setPlaygroundScenes([]);
    setPlaygroundMemory(null);
    setPlaygroundCards([]);
    setPlaygroundSelectedCards([]);
  };

  const loadSessionState = (session: GameSession) => {
    setGameMode(session.gameMode || 'campaign');
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
      gameMode,
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

  const handlePlaygroundStart = async (mode: PlaygroundStartMode, theme?: ThemeOption) => {
    setIsPlaygroundLoading(true);

    // Draw cards for playground
    const cards = DeckManager.drawRandomCards(5);
    setPlaygroundCards(cards);

    if (mode === 'quick' || mode === 'theme') {
      // Generate opening scene with AI
      const result = await generateOpeningScene(theme || null, cards.slice(0, 3));

      if (result) {
        const { narrative, memory } = result;
        const scene = createPlaygroundScene(narrative, undefined, cards.slice(0, 3), undefined);
        setPlaygroundScenes([scene]);
        setPlaygroundMemory(memory);
        setPlaygroundPhase('playing');
      } else {
        alert('Failed to generate opening scene. Please try again.');
        setIsPlaygroundLoading(false);
        return;
      }
    } else if (mode === 'custom') {
      // Custom mode - just set up empty memory and let player start
      const memory = StoryMemoryManager.createInitialMemory('custom');
      setPlaygroundMemory(memory);
      setPlaygroundPhase('playing');
    }

    setIsPlaygroundLoading(false);
  };

  const handlePlaygroundPlayerAction = async (prompt: NarrativePrompt) => {
    if (!playgroundMemory) return;

    setIsPlaygroundLoading(true);

    const cardsToUse = prompt.cards || playgroundSelectedCards;
    const result = await processPlayerAction(playgroundMemory, prompt, cardsToUse);

    if (result) {
      const { narrative, updatedMemory } = result;
      const previousNarrative = playgroundScenes[playgroundScenes.length - 1]?.narrative;
      const scene = createPlaygroundScene(narrative, prompt.prompt, cardsToUse, previousNarrative);

      setPlaygroundScenes(prev => [...prev, scene]);
      setPlaygroundMemory(updatedMemory);
      setPlaygroundSelectedCards([]);
    }

    setIsPlaygroundLoading(false);
  };

  const handlePlaygroundCardSelect = (card: LoreCard) => {
    setPlaygroundSelectedCards(prev =>
      prev.some(c => c.id === card.id)
        ? prev.filter(c => c.id !== card.id)
        : [...prev, card]
    );
  };

  const handlePlaygroundPlotTwist = async () => {
    if (!playgroundMemory) return;

    setIsPlaygroundLoading(true);
    const narrative = await generatePlotTwist(playgroundMemory, playgroundCards);

    if (narrative) {
      const previousNarrative = playgroundScenes[playgroundScenes.length - 1]?.narrative;
      const scene = createPlaygroundScene(narrative, 'Plot twist injected', [], previousNarrative);
      setPlaygroundScenes(prev => [...prev, scene]);

      const updatedMemory = StoryMemoryManager.updateMemory(
        playgroundMemory,
        narrative,
        'plot twist'
      );
      setPlaygroundMemory(updatedMemory);
    }

    setIsPlaygroundLoading(false);
  };

  const handlePlaygroundToneChange = async () => {
    if (!playgroundMemory) return;

    const newTone = prompt('Enter new tone (e.g., dark, humorous, tense, whimsical):');
    if (!newTone) return;

    setIsPlaygroundLoading(true);
    const narrative = await generateToneShift(playgroundMemory, newTone);

    if (narrative) {
      const previousNarrative = playgroundScenes[playgroundScenes.length - 1]?.narrative;
      const scene = createPlaygroundScene(narrative, `Tone shifted to ${newTone}`, [], previousNarrative);
      setPlaygroundScenes(prev => [...prev, scene]);

      const updatedMemory = { ...playgroundMemory, currentTone: newTone };
      setPlaygroundMemory(updatedMemory);
    }

    setIsPlaygroundLoading(false);
  };

  const handlePlaygroundAskAI = () => {
    // This triggers the custom prompt input with question type
    alert('Use the prompt input below and select "Ask AI" type to ask questions about the story!');
  };

  const handlePlaygroundSaveStory = () => {
    if (!playgroundMemory || playgroundScenes.length === 0) return;

    const storyData = {
      memory: playgroundMemory,
      scenes: playgroundScenes,
      timestamp: Date.now(),
    };

    const storyName = prompt('Enter a name for this story:');
    if (storyName) {
      localStorage.setItem(`glesolas_playground_${Date.now()}`, JSON.stringify(storyData));
      alert(`Story "${storyName}" saved!`);
    }
  };

  const handlePlaygroundViewMemory = () => {
    // This is handled by the PlaygroundGameView component
    console.log('View memory clicked');
  };

  const handlePlaygroundSuggestScene = async (): Promise<string[]> => {
    if (!playgroundMemory) return [];
    return await generateAISuggestions('scene', playgroundMemory);
  };

  const handlePlaygroundSuggestCharacter = async (): Promise<string[]> => {
    if (!playgroundMemory) return [];
    return await generateAISuggestions('character', playgroundMemory);
  };

  const handlePlaygroundSuggestTwist = async (): Promise<string[]> => {
    if (!playgroundMemory) return [];
    return await generateAISuggestions('twist', playgroundMemory);
  };

  const handlePlaygroundSelectSuggestion = async (
    type: 'scene' | 'character' | 'twist',
    suggestion: string
  ) => {
    if (!playgroundMemory) return;

    const promptType = type === 'scene' ? 'scene' : type === 'character' ? 'character-action' : 'plot-twist';
    await handlePlaygroundPlayerAction({
      type: promptType,
      prompt: suggestion,
    });
  };

  const handlePlaygroundEndStory = async () => {
    if (!playgroundMemory) return;

    const confirm = window.confirm('End this story? This will generate a conclusion.');
    if (!confirm) return;

    setIsPlaygroundLoading(true);
    const conclusion = await generateStoryConclusion(playgroundMemory, playgroundScenes);

    if (conclusion) {
      const previousNarrative = playgroundScenes[playgroundScenes.length - 1]?.narrative;
      const scene = createPlaygroundScene(conclusion, 'Story concluded', [], previousNarrative);
      setPlaygroundScenes(prev => [...prev, scene]);
    }

    setIsPlaygroundLoading(false);
    setPlaygroundPhase('complete');

    // Optionally save automatically
    setTimeout(() => {
      const shouldSave = window.confirm('Would you like to save this story?');
      if (shouldSave) {
        handlePlaygroundSaveStory();
      }

      // Reset to home
      setTimeout(() => {
        setPlaygroundPhase('setup');
        setPlaygroundScenes([]);
        setPlaygroundMemory(null);
        setPlaygroundCards([]);
        setPlaygroundSelectedCards([]);
      }, 1000);
    }, 2000);
  };

  return (
    <div className="mobile-full-height flex flex-col bg-gradient-to-br from-background via-secondary/20 to-background no-overscroll">
      {/* Header */}
      <GameHeader
        glory={glory}
        narrativeDice={narrativeDice}
        phase={phase}
        gameMode={gameMode}
        playerProfile={playerProfile}
        onEndSession={handleEndSession}
        onSaveSession={() => setShowSaveDialog(true)}
        onLoadSession={() => setShowSessionManager(true)}
        onOpenCharacterSheet={() => setShowCharacterSheet(true)}
      />

      {/* Main Content - Mobile First */}
      <main className="flex-1 overflow-y-auto smooth-scroll px-3 py-4 sm:px-4 sm:py-6 md:px-8" id="main-content">
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 relative">

        {/* Game Phases */}
        <AnimatePresence mode="wait" initial={false}>
          {/* MAIN MENU */}
          {gameMode === 'menu' && !showDeckBuilder && !showNarratorManager && (
            <motion.div
              key="home"
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="space-y-6"
            >
              {/* Main Menu Title */}
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-center space-y-2 py-8"
              >
                <h2 className="text-5xl md:text-6xl font-bold text-gradient-solar tracking-wider">
                  MAIN MENU
                </h2>
                <p className="text-lg text-muted-foreground italic">Your legend awaits...</p>
              </motion.div>

              {/* Main Action Buttons - Mobile First Grid */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
                <motion.div
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  whileTap={{ scale: 0.98 }}
                  className="instant-feedback"
                >
                  <Card className="border-2 border-primary/50 bg-gradient-to-br from-primary/10 via-background to-background active:border-primary transition-all cursor-pointer h-full mobile-touch-target"
                    onClick={handleStartCampaignMode}
                  >
                    <CardContent className="p-6 sm:p-8 flex flex-col items-center justify-center space-y-3 sm:space-y-4 h-full min-h-[160px] sm:min-h-[200px]">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary/20 flex items-center justify-center gpu-accelerated">
                        <Scroll className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
                      </div>
                      <div className="text-center space-y-1 sm:space-y-2">
                        <h3 className="text-xl sm:text-2xl font-bold">Campaign Mode</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          Choose cards and battle challenges
                        </p>
                      </div>
                      {narrativeDice < 1 && (
                        <p className="text-xs text-destructive font-semibold">⚠ Need Narrative Dice</p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ y: -50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.35 }}
                  whileTap={{ scale: 0.98 }}
                  className="instant-feedback"
                >
                  <Card className="border-2 border-secondary/50 bg-gradient-to-br from-secondary/10 via-background to-background active:border-secondary transition-all cursor-pointer h-full mobile-touch-target"
                    onClick={handleStartPlaygroundMode}
                  >
                    <CardContent className="p-6 sm:p-8 flex flex-col items-center justify-center space-y-3 sm:space-y-4 h-full min-h-[160px] sm:min-h-[200px]">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-secondary/20 flex items-center justify-center gpu-accelerated">
                        <span className="text-3xl sm:text-4xl">🎨</span>
                      </div>
                      <div className="text-center space-y-1 sm:space-y-2">
                        <h3 className="text-xl sm:text-2xl font-bold">Playground Mode</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          Create your own story adventure
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  whileTap={{ scale: 0.98 }}
                  className="instant-feedback"
                >
                  <Card className="border-2 border-accent/50 bg-gradient-to-br from-accent/10 via-background to-background active:border-accent transition-all cursor-pointer h-full mobile-touch-target"
                    onClick={handleRollInitiative}
                  >
                    <CardContent className="p-6 sm:p-8 flex flex-col items-center justify-center space-y-3 sm:space-y-4 h-full min-h-[160px] sm:min-h-[200px]">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-accent/20 flex items-center justify-center gpu-accelerated">
                        <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-accent" />
                      </div>
                      <div className="text-center space-y-1 sm:space-y-2">
                        <h3 className="text-xl sm:text-2xl font-bold">Quick Start</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {isGeneratingNarrative ? 'Weaving your tale...' : 'Random quest, jump right in'}
                        </p>
                      </div>
                      {narrativeDice < 1 && (
                        <p className="text-xs text-destructive font-semibold">⚠ Need Narrative Dice</p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.45 }}
                  whileTap={{ scale: 0.98 }}
                  className="instant-feedback"
                >
                  <Card className="border-2 border-blue-500/50 bg-gradient-to-br from-blue-500/10 via-background to-background active:border-blue-500 transition-all cursor-pointer h-full mobile-touch-target"
                    onClick={() => setShowSessionManager(true)}
                  >
                    <CardContent className="p-6 sm:p-8 flex flex-col items-center justify-center space-y-3 sm:space-y-4 h-full min-h-[160px] sm:min-h-[200px]">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-blue-500/20 flex items-center justify-center gpu-accelerated">
                        <Dices className="w-8 h-8 sm:w-10 sm:h-10 text-blue-500" />
                      </div>
                      <div className="text-center space-y-1 sm:space-y-2">
                        <h3 className="text-xl sm:text-2xl font-bold">Load Session</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          Continue a saved adventure
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Player Level Display */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.45 }}
                onClick={() => setShowCharacterSheet(true)}
                className="cursor-pointer"
              >
                <PlayerLevelDisplay profile={playerProfile} />
              </motion.div>

              {/* Configuration Options - Smaller Cards */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="border-secondary/50 bg-secondary/5">
                  <CardHeader>
                    <CardTitle className="text-center text-lg">Game Configuration</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Deck Management */}
                      <motion.div
                        whileHover={{ y: -2 }}
                        className="cursor-pointer"
                        onClick={() => setShowDeckBuilder(true)}
                      >
                        <div className="p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-all space-y-2">
                          <div className="flex items-center gap-2 justify-center">
                            <Scroll className="w-5 h-5 text-primary" />
                            <h4 className="font-semibold">Deck Manager</h4>
                          </div>
                          <p className="text-xs text-muted-foreground text-center">
                            Active: <span className="font-semibold text-foreground">{DeckManager.getActiveDeck().name}</span>
                          </p>
                          <p className="text-xs text-primary text-center font-medium">Click to manage →</p>
                        </div>
                      </motion.div>

                      {/* DM/Narrator Manager */}
                      <motion.div
                        whileHover={{ y: -2 }}
                        className="cursor-pointer"
                        onClick={() => setShowNarratorManager(true)}
                      >
                        <div className="p-4 rounded-lg border border-border hover:border-accent/50 hover:bg-accent/5 transition-all space-y-2">
                          <div className="flex items-center gap-2 justify-center">
                            <Mic className="w-5 h-5 text-accent" />
                            <h4 className="font-semibold">Dungeon Master</h4>
                          </div>
                          <p className="text-xs text-muted-foreground text-center">
                            Active: <span className="font-semibold text-foreground">{NarratorManager.getActiveNarrator().name}</span>
                          </p>
                          <p className="text-xs text-accent text-center font-medium">Click to manage →</p>
                        </div>
                      </motion.div>

                      {/* Character Perks */}
                      <motion.div
                        whileHover={{ y: -2 }}
                        className="cursor-pointer"
                        onClick={() => setShowPerkModal(true)}
                      >
                        <div className="p-4 rounded-lg border border-border hover:border-yellow-500/50 hover:bg-yellow-500/5 transition-all space-y-2">
                          <div className="flex items-center gap-2 justify-center">
                            <Trophy className="w-5 h-5 text-yellow-400" />
                            <h4 className="font-semibold">Character Perks</h4>
                          </div>
                          <p className="text-xs text-muted-foreground text-center">
                            Points: <span className="font-semibold text-accent">{playerProfile.availablePerkPoints}</span>
                          </p>
                          <p className="text-xs text-yellow-400 text-center font-medium">Click to upgrade →</p>
                        </div>
                      </motion.div>

                      {/* Difficulty Selection */}
                      <motion.div
                        whileHover={{ y: -2 }}
                        className="cursor-pointer"
                        onClick={() => setShowDifficultySelector(true)}
                      >
                        <div className="p-4 rounded-lg border border-border hover:border-purple-500/50 hover:bg-purple-500/5 transition-all space-y-2">
                          <div className="flex items-center gap-2 justify-center">
                            <Sparkles className="w-5 h-5 text-purple-400" />
                            <h4 className="font-semibold">Difficulty</h4>
                          </div>
                          <p className="text-xs text-muted-foreground text-center">
                            Current: <span className="font-semibold text-foreground">{getDifficultyById(playerProfile.selectedDifficulty).name}</span>
                          </p>
                          <p className="text-xs text-purple-400 text-center font-medium">Click to change →</p>
                        </div>
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Footer Tip */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-center"
              >
                <p className="text-xs text-muted-foreground italic">
                  💡 Tip: Configure your deck and narrator before starting a new adventure
                </p>
              </motion.div>
            </motion.div>
          )}

          {/* CAMPAIGN MODE */}
          {gameMode === 'campaign' && phase === 'home' && showDeckSelector && (
            <DeckSelector
              onConfirmSelection={handleDeckSelection}
              onCancel={() => {
                setGameMode('menu');
                setShowDeckSelector(false);
              }}
            />
          )}

          {/* PLAYGROUND MODE */}
          {gameMode === 'playground' && playgroundPhase === 'setup' && (
            <PlaygroundMode
              onStartMode={handlePlaygroundStart}
              onBack={handleBackToMenu}
            />
          )}

          {gameMode === 'playground' && playgroundPhase === 'playing' && playgroundMemory && (
            <PlaygroundGameView
              scenes={playgroundScenes}
              currentNarrative={playgroundScenes[playgroundScenes.length - 1]?.narrative || ''}
              availableCards={playgroundCards}
              selectedCards={playgroundSelectedCards}
              storyMemory={playgroundMemory}
              isLoading={isPlaygroundLoading}
              onPlayerAction={handlePlaygroundPlayerAction}
              onCardSelect={handlePlaygroundCardSelect}
              onPlotTwist={handlePlaygroundPlotTwist}
              onToneChange={handlePlaygroundToneChange}
              onAskAI={handlePlaygroundAskAI}
              onSaveStory={handlePlaygroundSaveStory}
              onViewMemory={handlePlaygroundViewMemory}
              onSuggestScene={handlePlaygroundSuggestScene}
              onSuggestCharacter={handlePlaygroundSuggestCharacter}
              onSuggestTwist={handlePlaygroundSuggestTwist}
              onSelectSuggestion={handlePlaygroundSelectSuggestion}
              onEndStory={handlePlaygroundEndStory}
            />
          )}

          {/* CAMPAIGN PHASES */}
          {gameMode === 'campaign' && phase === 'intro' && (
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
                    <>
                      {/* Scene Image */}
                      <SceneImage
                        narrative={introScene}
                        sceneType="intro"
                      />

                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-lg leading-relaxed"
                      >
                        {introScene}
                      </motion.p>

                      {/* Play Narration Button */}
                      <SceneNarrationButton text={introScene} className="w-full" />
                    </>
                  )}
                  <div className="mobile-card-grid">
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

          {gameMode === 'campaign' && phase === 'challenge' && (
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
                      {/* Scene Image */}
                      <SceneImage
                        narrative={currentChallenge.scene}
                        sceneType="challenge"
                        previousNarrative={introScene}
                      />

                      <p className="text-lg leading-relaxed">{currentChallenge.scene}</p>

                      {/* Play Narration Button */}
                      <SceneNarrationButton text={currentChallenge.scene} className="w-full" />

                  <StatsDisplay
                    might={calculateTotalStats(selectedCards, playerProfile).might}
                    fortune={calculateTotalStats(selectedCards, playerProfile).fortune}
                    cunning={calculateTotalStats(selectedCards, playerProfile).cunning}
                    requirements={currentChallenge.requirements}
                    keyStat={currentChallenge.keyStat}
                    playerBonuses={playerProfile.bonusStats}
                  />
                </CardContent>
              </Card>

              <CardPlayArea
                selectedCards={selectedCards}
                maxCards={playerProfile.playAreaSize}
                onRemoveCard={handleRemoveCard}
                onCardClick={setDetailModalCard}
              />

              <ImprovedCardHand
                hand={hand}
                selectedCards={selectedCards}
                onCardSelect={handleCardSelect}
                maxSelection={playerProfile.playAreaSize}
                disabled={isGeneratingNarrative}
              />

              <div className="pb-16">
                <Button
                  onClick={handlePlayResponse}
                  disabled={selectedCards.length !== playerProfile.playAreaSize || isGeneratingNarrative}
                  className="w-full instant-feedback"
                  size="lg"
                >
                  {isGeneratingNarrative ? 'Generating Actions...' : selectedCards.length === playerProfile.playAreaSize ? '⚔️ Play Cards' : `Select ${playerProfile.playAreaSize - selectedCards.length} More Card${playerProfile.playAreaSize - selectedCards.length > 1 ? 's' : ''}`}
                </Button>
              </div>
              </>
            ) : null}
            </motion.div>
          )}

          {gameMode === 'campaign' && phase === 'action-choice' && availableActions.length > 0 && (
            <motion.div
              key="action-choice"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="space-y-6 pb-24"
            >
              {/* Show selected cards - moved to top for context */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Cards Played</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mobile-card-grid">
                    {selectedCards.map(card => (
                      <LoreCardComponent key={card.id} card={card} disabled />
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Desktop: Show actions inline */}
              <Card className="border-accent/50 hidden md:block">
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
                      <p className="text-sm text-muted-foreground mb-3">
                        {availableActions.every(a => !a.unlocked)
                          ? '💀 Total failure! Choose which disaster happens...'
                          : "You've played your cards. Now choose how to use them:"}
                      </p>

                      {/* Show current stats vs requirements */}
                      {currentChallenge && (
                        <div className="mb-4 p-3 bg-secondary/30 rounded-lg border border-border/50">
                          <p className="text-xs font-semibold mb-2 text-muted-foreground">Your Stats vs Challenge:</p>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div className={`p-2 rounded ${calculateTotalStats(selectedCards, playerProfile).might >= currentChallenge.requirements.might_req ? 'bg-green-500/20 border border-green-500/50' : 'bg-destructive/20 border border-destructive/50'}`}>
                              <div className="font-semibold">Might</div>
                              <div className="font-mono">{calculateTotalStats(selectedCards, playerProfile).might} / {currentChallenge.requirements.might_req}</div>
                            </div>
                            <div className={`p-2 rounded ${calculateTotalStats(selectedCards, playerProfile).fortune >= currentChallenge.requirements.fortune_req ? 'bg-green-500/20 border border-green-500/50' : 'bg-destructive/20 border border-destructive/50'}`}>
                              <div className="font-semibold">Fortune</div>
                              <div className="font-mono">{calculateTotalStats(selectedCards, playerProfile).fortune} / {currentChallenge.requirements.fortune_req}</div>
                            </div>
                            <div className={`p-2 rounded ${calculateTotalStats(selectedCards, playerProfile).cunning >= currentChallenge.requirements.cunning_req ? 'bg-green-500/20 border border-green-500/50' : 'bg-destructive/20 border border-destructive/50'}`}>
                              <div className="font-semibold">Cunning</div>
                              <div className="font-mono">{calculateTotalStats(selectedCards, playerProfile).cunning} / {currentChallenge.requirements.cunning_req}</div>
                            </div>
                          </div>
                        </div>
                      )}

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
                              className="w-full h-auto p-4 text-left justify-start whitespace-normal"
                              variant={action.unlocked ? 'default' : 'destructive'}
                              size="lg"
                            >
                              <div className="space-y-1 w-full">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold capitalize text-base">
                                    {action.path}
                                  </span>
                                  {action.unlocked ? (
                                    <span className="text-xs text-green-500 whitespace-nowrap">✓ Safe Choice</span>
                                  ) : (
                                    <span className="text-xs whitespace-nowrap">⚠️ Risky!</span>
                                  )}
                                </div>
                                <p className={`text-sm whitespace-normal`}>
                                  {action.narrative}
                                </p>
                                {!action.unlocked && (
                                  <p className="text-xs mt-2 opacity-90">
                                    {availableActions.every(a => !a.unlocked)
                                      ? '💀 Guaranteed failure: Lose 50 glory'
                                      : '⚠️ 50% chance: Win half glory OR lose 30 glory'}
                                  </p>
                                )}
                              </div>
                            </Button>
                          </motion.div>
                        ))}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Mobile: Floating hint card */}
              <Card className="md:hidden border-accent/50 bg-accent/10">
                <CardContent className="p-4 text-center">
                  <p className="text-sm font-medium">
                    {isGeneratingNarrative ? '✨ Weaving your stories...' : '⬇️ Tap to choose your path'}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Mobile Bottom Sheet for Action Choices */}
          <BottomActionSheet
            open={gameMode === 'campaign' && phase === 'action-choice' && !isGeneratingNarrative && availableActions.length > 0}
            title="Choose Your Path"
          >
            <p className="text-sm text-muted-foreground mb-4">
              You've played your cards. Now choose how to use them:
            </p>
            <div className="space-y-3">
              {availableActions.map(action => {
                const icons = {
                  might: <Swords className="w-6 h-6 text-red-400" />,
                  fortune: <Dices className="w-6 h-6 text-green-400" />,
                  cunning: <Sparkles className="w-6 h-6 text-blue-400" />
                };

                return (
                  <ActionSheetButton
                    key={action.path}
                    onClick={() => handleActionChoice(action.path)}
                    locked={!action.unlocked}
                    title={action.unlocked ? action.path.toUpperCase() : `${action.path.toUpperCase()} ⚠️ RISKY`}
                    description={action.unlocked ? action.narrative : `${action.narrative}\n\n⚠️ 50% chance: Win half glory OR lose 30 glory`}
                    icon={icons[action.path as keyof typeof icons]}
                  />
                );
              })}
            </div>
          </BottomActionSheet>

          {gameMode === 'campaign' && phase === 'resolution' && lastResult && (
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
                    <>
                      {/* Scene Image */}
                      <SceneImage
                        narrative={lastResult.scene}
                        sceneType="resolution"
                        previousNarrative={currentChallenge?.scene}
                      />

                      <p className="text-lg leading-relaxed">{lastResult.scene}</p>

                      {/* Play Narration Button */}
                      <SceneNarrationButton text={lastResult.scene} className="w-full" />
                    </>
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
                  {/* Action buttons - now visible on all devices */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button onClick={handleNextEncounter} className="flex-1" size="lg" disabled={narrativeDice < 1 || isGeneratingNarrative}>
                      ⚔️ Next Encounter
                      {narrativeDice < 1 && (
                        <span className="ml-2 text-xs">(Need Dice)</span>
                      )}
                    </Button>
                    <Button onClick={handleEndSession} variant="outline" className="flex-1" size="lg">
                      🏠 End Session
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {gameMode === 'campaign' && phase === 'transition' && (
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
                      {/* Scene Image */}
                      <SceneImage
                        narrative={transitionScene}
                        sceneType="transition"
                        previousNarrative={lastResult?.scene}
                      />

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
              key="session-manager"
              onLoadSession={handleLoadSession}
              onClose={() => setShowSessionManager(false)}
            />
          )}
          {showSaveDialog && (
            <SaveSessionDialog
              key="save-dialog"
              onSave={handleSaveSession}
              onClose={() => setShowSaveDialog(false)}
            />
          )}
        </AnimatePresence>

        {/* Global Card Detail Modal */}
        <CardDetailModal
          card={detailModalCard}
          open={!!detailModalCard}
          onClose={() => setDetailModalCard(null)}
          disabled
        />

        {/* Level Up Modal */}
        {levelUpResult && (
          <LevelUpModal
            isOpen={showLevelUpModal}
            onClose={() => setShowLevelUpModal(false)}
            levelUpResult={levelUpResult}
          />
        )}

        {/* Perk Selection Modal */}
        <PerkSelectionModal
          isOpen={showPerkModal}
          onClose={() => setShowPerkModal(false)}
          profile={playerProfile}
          onPerkApplied={(updatedProfile) => setPlayerProfile({ ...updatedProfile })}
        />

        {/* Character Sheet Modal */}
        <AnimatePresence>
          {showCharacterSheet && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
                onClick={() => setShowCharacterSheet(false)}
              />
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-4xl max-h-[90vh] overflow-auto"
              >
                <Card className="border-2 border-accent">
                  <CardHeader className="border-b border-accent/20">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-2xl">Character Sheet</CardTitle>
                      <Button variant="ghost" size="icon" onClick={() => setShowCharacterSheet(false)}>
                        <span className="text-xl">×</span>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <PlayerLevelDisplay profile={playerProfile} />
                    <AchievementsPanel profile={playerProfile} />
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-accent/20">
                      <Button onClick={() => {
                        setShowCharacterSheet(false);
                        setShowPerkModal(true);
                      }}>
                        Manage Perks
                      </Button>
                      <Button variant="outline" onClick={() => setShowCharacterSheet(false)}>
                        Close
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Difficulty Selector Modal */}
        <DifficultySelector
          isOpen={showDifficultySelector}
          playerProfile={playerProfile}
          onSelectDifficulty={handleDifficultySelected}
          onClose={() => setShowDifficultySelector(false)}
        />

        {/* Deck Builder Modal */}
        <DeckBuilder
          isOpen={showDeckBuilder}
          onClose={() => setShowDeckBuilder(false)}
        />

        {/* Narrator Manager Modal */}
        <NarratorManagerComponent
          isOpen={showNarratorManager}
          onClose={() => setShowNarratorManager(false)}
        />
        </div>
      </main>

      {/* Footer */}
      <GameFooter />
    </div>
  );
}

export default App;
