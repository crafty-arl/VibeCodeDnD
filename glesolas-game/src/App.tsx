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
import { CompanionPanel } from './components/CompanionPanel';
import { RecruitmentModal } from './components/RecruitmentModal';
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

  // Recruitment System State
  const [recruitmentOffer, setRecruitmentOffer] = useState<LoreCard | null>(null);
  const [showRecruitmentModal, setShowRecruitmentModal] = useState(false);

  // Companion Dialogue State
  const [companionDialogue, setCompanionDialogue] = useState<string | null>(null);
  const [loyaltyNotifications, setLoyaltyNotifications] = useState<Array<{ id: string; name: string; change: number; newTier?: string }>>([]);

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

      // Show dialogue if it's a Character card
      if (card.type === 'Character' && card.dialogue?.onPlay) {
        const randomDialogue = card.dialogue.onPlay[Math.floor(Math.random() * card.dialogue.onPlay.length)];
        setCompanionDialogue(`${card.name}: "${randomDialogue}"`);
        setTimeout(() => setCompanionDialogue(null), 4000);
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
        { path: 'might', narrative: failureNarratives[0], unlocked: true, isTotalFailure: true },
        { path: 'fortune', narrative: failureNarratives[1], unlocked: true, isTotalFailure: true },
        { path: 'cunning', narrative: failureNarratives[2], unlocked: true, isTotalFailure: true },
      ];

      setNarrativeDice(prev => Math.max(0, prev - 3)); // Used 3 dice for failure scenarios
      setAvailableActions(actions);
      setIsGeneratingNarrative(false);
      setPhase('action-choice');
      return;
    }

    // NORMAL: Generate AI narratives for ALL paths (not just unlocked ones)
    // The narrative itself will convey the consequence
    const [mightNarrative, fortuneNarrative, cunningNarrative] = await Promise.all([
      generateActionNarrativeAsync(selectedCards, 'might', currentChallenge.scene, introScene),
      generateActionNarrativeAsync(selectedCards, 'fortune', currentChallenge.scene, introScene),
      generateActionNarrativeAsync(selectedCards, 'cunning', currentChallenge.scene, introScene),
    ]);

    const actions: ActionPath[] = [
      { path: 'might', narrative: mightNarrative, unlocked: mightUnlocked },
      { path: 'fortune', narrative: fortuneNarrative, unlocked: fortuneUnlocked },
      { path: 'cunning', narrative: cunningNarrative, unlocked: cunningUnlocked },
    ];

    // Deduct narrative dice for all 3 generated narratives
    setNarrativeDice(prev => Math.max(0, prev - 3));
    console.log('🎲 Used 3 narrative dice for all action paths');

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
    let consequence: import('./types/game').EncounterConsequence | undefined;

    // Check if chosen path is the key stat
    const isKeyStat = currentChallenge.keyStat === chosenPath;
    const wasKeyStat = isKeyStat;

    // Get difficulty multiplier for rewards
    const { getDifficultyById } = await import('./types/difficulty');
    const difficulty = getDifficultyById(playerProfile.selectedDifficulty);
    const difficultyMultiplier = difficulty.rewardMultiplier;

    if (totalFailure) {
      // TOTAL FAILURE: All paths locked - choose your doom
      success = false;
      gloryGained = Math.floor(-50 * difficultyMultiplier);
      narrativeDiceGained = 0;
      console.log(`💀💀💀 TOTAL FAILURE - Choose lesser of evils. Lose glory: ${gloryGained}`);

      consequence = {
        type: 'failure',
        effects: {
          nextEncounterModifier: 5,
          injuryDebuff: { might: -2, fortune: -2, cunning: -2 },
          companionLoyaltyHit: true
        },
        message: "Complete failure! Your companions lose faith, and you're injured."
      };
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

        consequence = {
          type: 'perfect',
          effects: {},
          message: "Perfect execution! Your companions are impressed."
        };
      } else {
        // Using non-key stat = reduced rewards (60% of normal)
        const baseGlory = chosenPath === 'might' ? 50 : chosenPath === 'fortune' ? 40 : 60;
        gloryGained = Math.floor(baseGlory * 0.6 * difficultyMultiplier);
        narrativeDiceGained = 1;
        console.log(`⚠️ Non-key stat used. Reduced glory: +${gloryGained} (key was ${currentChallenge.keyStat})`);

        consequence = {
          type: 'partial',
          effects: {
            nextEncounterModifier: 3,
            companionLoyaltyHit: true
          },
          message: `You succeeded, but ignored the key stat (${currentChallenge.keyStat}). Next encounter will be harder.`
        };
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

        consequence = {
          type: 'partial',
          effects: {
            nextEncounterModifier: 2,
            companionLoyaltyHit: false
          },
          message: "You took a risk and it paid off, but barely."
        };
      } else {
        // Failed the risky choice - lose glory!
        gloryGained = Math.floor(-30 * difficultyMultiplier);
        narrativeDiceGained = 0;
        console.log(`💀 Locked path - FAILED! Lose glory: ${gloryGained}`);

        consequence = {
          type: 'failure',
          effects: {
            nextEncounterModifier: 4,
            injuryDebuff: { might: -1, fortune: -1, cunning: -1 },
            companionLoyaltyHit: true
          },
          message: "Your reckless choice backfired. You're injured and companions are disappointed."
        };
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
      wasKeyStat,
      consequences: consequence,
    });

    setGlory(prev => Math.max(0, prev + gloryGained)); // Can't go below 0
    setNarrativeDice(prev => prev + narrativeDiceGained);

    // Update companion loyalty and show dialogue for Character cards
    const { CompanionManager } = await import('./lib/companionManager');
    const companionDialogues: string[] = [];
    const loyaltyChanges: Array<{ id: string; name: string; change: number; newTier?: string }> = [];

    selectedCards
      .filter(card => card.type === 'Character')
      .forEach(card => {
        const oldLoyalty = card.loyalty || 0;
        const oldTier = CompanionManager.getLoyaltyTier(oldLoyalty);

        const loyaltyChange = CompanionManager.recordCardPlay(
          card.id,
          success,
          chosenPath,
          currentChallenge.keyStat,
          wasKeyStat
        );

        const newLoyalty = oldLoyalty + loyaltyChange;
        const newTier = CompanionManager.getLoyaltyTier(newLoyalty);

        console.log(`🤝 ${card.name} loyalty ${loyaltyChange > 0 ? '+' : ''}${loyaltyChange} (Total: ${newLoyalty})`);

        // Track loyalty change notification
        loyaltyChanges.push({
          id: card.id,
          name: card.name,
          change: loyaltyChange,
          newTier: oldTier !== newTier ? newTier : undefined
        });

        // Pick appropriate dialogue
        let dialoguePool: string[] = [];
        if (card.dialogue) {
          if (success && wasKeyStat && card.dialogue.onKeyStat) {
            dialoguePool = card.dialogue.onKeyStat;
          } else if (success && !wasKeyStat && card.dialogue.onNonKeyStat) {
            dialoguePool = card.dialogue.onNonKeyStat;
          } else if (success && card.dialogue.onWin) {
            dialoguePool = card.dialogue.onWin;
          } else if (!success && card.dialogue.onLose) {
            dialoguePool = card.dialogue.onLose;
          }
        }

        if (dialoguePool.length > 0) {
          const randomDialogue = dialoguePool[Math.floor(Math.random() * dialoguePool.length)];
          companionDialogues.push(`${card.name}: "${randomDialogue}"`);
        }
      });

    // Show companion dialogue after resolution
    if (companionDialogues.length > 0) {
      setTimeout(() => {
        setCompanionDialogue(companionDialogues.join('\n\n'));
        setTimeout(() => setCompanionDialogue(null), 5000);
      }, 1500);
    }

    // Show loyalty change notifications
    if (loyaltyChanges.length > 0) {
      setTimeout(() => {
        setLoyaltyNotifications(loyaltyChanges);
        setTimeout(() => setLoyaltyNotifications([]), 4000);
      }, 2500);
    }

    // Apply consequences to player profile
    if (consequence) {
      // Track partial success streak and threat level
      if (consequence.type === 'partial') {
        playerProfile.partialSuccessStreak = (playerProfile.partialSuccessStreak || 0) + 1;

        if (playerProfile.partialSuccessStreak >= 3) {
          playerProfile.threatLevel = Math.min(10, (playerProfile.threatLevel || 0) + 2);
          console.log(`⚠️ Threat rising! ${playerProfile.partialSuccessStreak} partial successes. Threat level: ${playerProfile.threatLevel}`);
        }
      } else if (consequence.type === 'perfect') {
        playerProfile.partialSuccessStreak = 0;
        playerProfile.threatLevel = Math.max(0, (playerProfile.threatLevel || 0) - 1);
      }

      // Add injuries
      if (consequence.effects.injuryDebuff) {
        const injury: import('./types/player').Injury = {
          id: `injury_${Date.now()}`,
          name: consequence.type === 'failure' ? 'Battle Wounds' : 'Minor Injury',
          description: 'Still recovering from your last encounter',
          statDebuff: consequence.effects.injuryDebuff,
          encountersRemaining: 2,
        };

        playerProfile.activeInjuries = playerProfile.activeInjuries || [];
        playerProfile.activeInjuries.push(injury);
        console.log(`🤕 Injury sustained: ${injury.name}`);
      }

      // Set pending encounter modifier
      if (consequence.effects.nextEncounterModifier) {
        playerProfile.pendingEncounterModifier = consequence.effects.nextEncounterModifier;
      }
    }

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
    } else {
      savePlayerProfile(playerProfile);
      setPlayerProfile({ ...playerProfile });
    }

    // Offer companion recruitment on perfect victories (key stat used)
    if (success && wasKeyStat && currentChallenge) {
      const { CompanionManager } = await import('./lib/companionManager');
      const newCompanion = await CompanionManager.createCompanionFromEncounter(
        currentChallenge,
        chosenPath,
        playerProfile.level
      );

      setRecruitmentOffer(newCompanion);
      setShowRecruitmentModal(true);
    }

    setIsGeneratingNarrative(false);
    setPhase('resolution');
  };

  const handleNextEncounter = async () => {
    if (!lastResult || !currentChallenge) return;

    setIsGeneratingNarrative(true);
    setSelectedCards([]);

    // Decrement injury durations and remove expired injuries
    if (playerProfile.activeInjuries && playerProfile.activeInjuries.length > 0) {
      playerProfile.activeInjuries = playerProfile.activeInjuries
        .map(injury => ({
          ...injury,
          encountersRemaining: injury.encountersRemaining - 1
        }))
        .filter(injury => injury.encountersRemaining > 0);

      console.log(`🩹 Injuries updated. ${playerProfile.activeInjuries.length} active injuries remaining.`);
    }

    // Clear pending encounter modifier (was applied to this challenge generation)
    if (playerProfile.pendingEncounterModifier) {
      console.log(`✅ Cleared pending encounter modifier: +${playerProfile.pendingEncounterModifier}`);
      playerProfile.pendingEncounterModifier = 0;
    }

    savePlayerProfile(playerProfile);

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

  const handleRecruitCompanion = async (companion: LoreCard) => {
    // Add to player's collected companions
    playerProfile.collectedCompanions = playerProfile.collectedCompanions || [];
    playerProfile.collectedCompanions.push(companion.id);

    // Add to active deck
    await DeckManager.addCardToActiveDeck(companion);

    // Initialize companion loyalty
    const { CompanionManager } = await import('./lib/companionManager');
    CompanionManager.recordCardPlay(companion.id, true, companion.preferredPath!, companion.preferredPath, true);

    savePlayerProfile(playerProfile);
    setShowRecruitmentModal(false);
    setRecruitmentOffer(null);

    console.log(`🎉 Recruited ${companion.name} to the deck!`);
  };

  const handleDeclineRecruitment = () => {
    setShowRecruitmentModal(false);
    setRecruitmentOffer(null);
    console.log('Declined companion recruitment');
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

              {/* Companion Panel */}
              {selectedCards.filter(c => c.type === 'Character').length > 0 && (
                <CompanionPanel
                  companions={selectedCards.filter(c => c.type === 'Character')}
                  currentKeyStat={currentChallenge.keyStat}
                />
              )}

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
                              variant={action.isTotalFailure ? 'destructive' : 'default'}
                              size="lg"
                            >
                              <div className="space-y-1 w-full">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold capitalize text-base">
                                    {action.path}
                                  </span>
                                </div>
                                <p className={`text-sm whitespace-normal`}>
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
                    locked={false}
                    title={action.path.toUpperCase()}
                    description={action.narrative}
                    icon={icons[action.path as keyof typeof icons]}
                    variant={action.isTotalFailure ? 'destructive' : 'default'}
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

                      {/* Consequence Display */}
                      {lastResult.consequences && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.5 }}
                        >
                          <Card className={`${
                            lastResult.consequences.type === 'perfect' ? 'border-green-500 bg-green-500/10' :
                            lastResult.consequences.type === 'partial' ? 'border-yellow-500 bg-yellow-500/10' :
                            'border-red-500 bg-red-500/10'
                          }`}>
                            <CardContent className="p-4 space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">
                                  {lastResult.consequences.type === 'perfect' ? '✨' :
                                   lastResult.consequences.type === 'partial' ? '⚠️' : '💀'}
                                </span>
                                <p className="text-sm font-semibold">
                                  {lastResult.consequences.type === 'perfect' ? 'Perfect Victory!' :
                                   lastResult.consequences.type === 'partial' ? 'Partial Success' : 'Failure'}
                                </p>
                              </div>
                              <p className="text-sm text-muted-foreground">{lastResult.consequences.message}</p>
                              {lastResult.consequences.effects && (
                                <div className="text-xs space-y-1 mt-2 pt-2 border-t border-border/50">
                                  {lastResult.consequences.effects.nextEncounterModifier && (
                                    <div className="flex items-center gap-2">
                                      <span>⚔️</span>
                                      <span>Next encounter +{lastResult.consequences.effects.nextEncounterModifier} difficulty</span>
                                    </div>
                                  )}
                                  {lastResult.consequences.effects.injuryDebuff && (
                                    <div className="flex items-center gap-2">
                                      <span>🤕</span>
                                      <span>Injury sustained (2 encounters)</span>
                                    </div>
                                  )}
                                  {lastResult.consequences.effects.companionLoyaltyHit && (
                                    <div className="flex items-center gap-2">
                                      <span>💔</span>
                                      <span>Companions are disappointed</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </motion.div>
                      )}
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

        {/* Recruitment Modal */}
        <RecruitmentModal
          isOpen={showRecruitmentModal}
          companion={recruitmentOffer}
          onRecruit={handleRecruitCompanion}
          onDecline={handleDeclineRecruitment}
        />

        {/* Character Sheet Modal */}
        <AnimatePresence>
          {showCharacterSheet && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-60"
                onClick={() => setShowCharacterSheet(false)}
              />
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-60 w-full max-w-4xl max-h-[90vh] overflow-auto"
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

        {/* Companion Dialogue Toast */}
        <AnimatePresence>
          {companionDialogue && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-md"
            >
              <Card className="border-primary bg-gradient-to-br from-primary/20 to-background backdrop-blur-sm shadow-2xl">
                <CardContent className="p-4">
                  <p className="text-sm font-medium whitespace-pre-line text-center">{companionDialogue}</p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loyalty Change Notifications */}
        <AnimatePresence>
          {loyaltyNotifications.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              className="fixed top-24 right-4 z-40 space-y-2 max-w-xs"
            >
              {loyaltyNotifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={`${notification.change > 0 ? 'border-green-500 bg-green-500/10' : 'border-red-500 bg-red-500/10'} backdrop-blur-sm shadow-lg`}>
                    <CardContent className="p-3 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-sm">{notification.name}</span>
                        <span className={`text-sm font-bold ${notification.change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {notification.change > 0 ? '+' : ''}{notification.change}
                        </span>
                      </div>
                      {notification.newTier && (
                        <div className="text-xs text-yellow-400 font-medium">
                          ⭐ Tier Up: {notification.newTier}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <GameFooter />
    </div>
  );
}

export default App;
