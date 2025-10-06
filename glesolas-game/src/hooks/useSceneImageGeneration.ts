/**
 * Custom React Hook for Scene-by-Scene Image Generation
 * Uses Pollinations AI with Google Nano Banana model
 * Maintains conversation history and consistent aesthetic across sessions
 */

import { useState, useEffect, useCallback } from 'react';
import { createSceneImagePrompt } from '@/lib/imageService';

export interface SceneImageOptions {
  width?: number;
  height?: number;
  seed?: number;
  nologo?: boolean;
  enhance?: boolean;
  model?: 'nano-banana' | 'turbo' | 'flux' | 'flux-realism' | 'flux-anime' | 'flux-3d';
}

export interface ScenePromptHistoryItem {
  sceneType: 'intro' | 'challenge' | 'resolution' | 'transition';
  prompt: string;
  timestamp: number;
  imageUrl?: string;
}

interface UseSceneImageGenerationReturn {
  imageUrl: string | null;
  loading: boolean;
  error: Error | null;
  promptHistory: ScenePromptHistoryItem[];
  generateImage: (prompt: string, sceneType: ScenePromptHistoryItem['sceneType'], options?: SceneImageOptions) => void;
  regenerateImage: (historyIndex: number) => void;
  clearHistory: () => void;
  getContextualPrompt: (currentPrompt: string, sceneType: ScenePromptHistoryItem['sceneType']) => string;
}

const DEFAULT_OPTIONS: SceneImageOptions = {
  width: 1024,
  height: 768,
  model: 'flux', // Use Flux for better consistency and quality
  nologo: true,
  enhance: true,
};

// LocalStorage keys for persistence
const PROMPT_HISTORY_KEY = 'glesolas_prompt_history';
const SESSION_SEED_KEY = 'glesolas_session_seed';

/**
 * Get or create a session seed for visual consistency
 * Same seed = similar visual style across images
 */
function getSessionSeed(): number {
  const stored = localStorage.getItem(SESSION_SEED_KEY);
  if (stored) {
    return parseInt(stored, 10);
  }

  // Create seed based on current date for daily variation
  const today = new Date().toISOString().split('T')[0];
  const seed = Math.abs(today.split('').reduce((acc, char) => {
    return ((acc << 5) - acc) + char.charCodeAt(0);
  }, 0));

  localStorage.setItem(SESSION_SEED_KEY, seed.toString());
  return seed;
}

/**
 * Reset the session seed to generate fresh aesthetics
 */
export function resetSessionSeed(): void {
  localStorage.removeItem(SESSION_SEED_KEY);
  localStorage.removeItem(PROMPT_HISTORY_KEY);
}

/**
 * React hook for generating scene images with conversation history
 * Maintains visual consistency across the narrative by referencing previous scenes
 * Persists aesthetic preferences across sessions
 */
export function useSceneImageGeneration(
  maxHistoryLength: number = 10
): UseSceneImageGenerationReturn {
  // Load prompt history from localStorage on mount
  const [promptHistory, setPromptHistory] = useState<ScenePromptHistoryItem[]>(() => {
    const stored = localStorage.getItem(PROMPT_HISTORY_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return [];
      }
    }
    return [];
  });

  const [currentPrompt, setCurrentPrompt] = useState<string>('');
  const [currentOptions, setCurrentOptions] = useState<SceneImageOptions>(DEFAULT_OPTIONS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Persist prompt history to localStorage whenever it changes
  useEffect(() => {
    if (promptHistory.length > 0) {
      localStorage.setItem(PROMPT_HISTORY_KEY, JSON.stringify(promptHistory));
    }
  }, [promptHistory]);

  // Generate image URL using direct Pollinations API
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!currentPrompt) {
      setImageUrl(null);
      return;
    }

    // Build Pollinations image URL
    const encodedPrompt = encodeURIComponent(currentPrompt);
    const params = new URLSearchParams({
      width: String(currentOptions.width ?? 1024),
      height: String(currentOptions.height ?? 768),
      seed: String(currentOptions.seed ?? -1),
      model: currentOptions.model || 'flux',
      nologo: String(currentOptions.nologo ?? true),
      enhance: String(currentOptions.enhance ?? true),
    });

    const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?${params.toString()}`;
    setImageUrl(url);
    setLoading(false);

    // Update the last history item with the generated image URL
    setPromptHistory(prev => {
      if (prev.length === 0) return prev;
      const updated = [...prev];
      updated[updated.length - 1] = {
        ...updated[updated.length - 1],
        imageUrl: url,
      };
      return updated;
    });
  }, [currentPrompt, currentOptions]);

  /**
   * Build a contextual prompt that references previous scenes
   * Uses the /quest aesthetic style guide for consistency
   */
  const getContextualPrompt = useCallback(
    (prompt: string, sceneType: ScenePromptHistoryItem['sceneType']): string => {
      // Use the centralized style guide from imageService
      const basePrompt = createSceneImagePrompt(sceneType, prompt);

      if (promptHistory.length === 0) {
        // First scene - just use the styled prompt
        return basePrompt;
      }

      // Get the last 2 scenes for context (keep it concise)
      const recentScenes = promptHistory.slice(-2);
      const previousContext = recentScenes
        .map(scene => `${scene.sceneType}: ${scene.prompt}`)
        .join(' → ');

      // Build contextual prompt with scene progression and style consistency
      return `Continuing visual narrative from: [${previousContext}]. ${basePrompt}. IMPORTANT: Maintain exact same art style, character appearances, color scheme, and visual tone as previous scenes.`;
    },
    [promptHistory]
  );

  /**
   * Generate a new scene image with conversation history
   * Uses session seed for aesthetic consistency
   */
  const generateImage = useCallback(
    (prompt: string, sceneType: ScenePromptHistoryItem['sceneType'], options?: SceneImageOptions) => {
      setLoading(true);
      setError(null);

      // Get session seed for visual consistency
      const sessionSeed = getSessionSeed();

      // Merge options with session seed if not provided
      const mergedOptions = {
        ...DEFAULT_OPTIONS,
        seed: sessionSeed, // Use session seed for consistency
        ...options,
      };

      // Build contextual prompt with history
      const contextualPrompt = getContextualPrompt(prompt, sceneType);

      setCurrentPrompt(contextualPrompt);
      setCurrentOptions(mergedOptions);

      // Add to history
      const newHistoryItem: ScenePromptHistoryItem = {
        sceneType,
        prompt,
        timestamp: Date.now(),
      };

      setPromptHistory(prev => {
        const updated = [...prev, newHistoryItem];
        // Maintain max history length
        if (updated.length > maxHistoryLength) {
          return updated.slice(-maxHistoryLength);
        }
        return updated;
      });
    },
    [getContextualPrompt, maxHistoryLength]
  );

  /**
   * Regenerate an image from history
   */
  const regenerateImage = useCallback(
    (historyIndex: number) => {
      if (historyIndex < 0 || historyIndex >= promptHistory.length) {
        setError(new Error('Invalid history index'));
        return;
      }

      const historyItem = promptHistory[historyIndex];

      // Get context up to this point (not including the item itself)
      const contextHistory = promptHistory.slice(0, historyIndex);

      // Temporarily set history to context
      const currentHistory = promptHistory;
      setPromptHistory(contextHistory);

      // Generate with context
      generateImage(historyItem.prompt, historyItem.sceneType);

      // Restore full history after generation
      setTimeout(() => {
        setPromptHistory(currentHistory);
      }, 100);
    },
    [promptHistory, generateImage]
  );

  /**
   * Clear prompt history (useful for starting a new game)
   * Also resets the session seed for fresh aesthetics
   */
  const clearHistory = useCallback(() => {
    setPromptHistory([]);
    setCurrentPrompt('');
    setLoading(false);
    setError(null);

    // Clear localStorage
    localStorage.removeItem(PROMPT_HISTORY_KEY);
    // Note: We keep the session seed unless manually reset via resetSessionSeed()
  }, []);

  return {
    imageUrl,
    loading,
    error,
    promptHistory,
    generateImage,
    regenerateImage,
    clearHistory,
    getContextualPrompt,
  };
}
