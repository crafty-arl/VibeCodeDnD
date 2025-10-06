/**
 * Vectorize Service - Client-side wrapper for Vectorize API
 * Manages card embeddings and semantic search
 */

import type { LoreCard } from '@/types/game';

interface VectorizeCard {
  id: string;
  score: number;
  card: {
    name: string;
    description: string;
    might: number;
    fortune: number;
    cunning: number;
    category: string;
  };
}

export class VectorizeService {
  private static readonly API_BASE = '/api/vectorize';

  /**
   * Check if Vectorize is available (only in deployed Cloudflare environment)
   */
  private static isAvailable(): boolean {
    // Vectorize only works when deployed to Cloudflare Pages/Workers
    // In local dev, the /api/vectorize endpoints don't exist
    const isProduction = import.meta.env.PROD;
    const isCloudflare = typeof window !== 'undefined' && window.location.hostname.includes('.pages.dev');
    return isProduction || isCloudflare;
  }

  /**
   * Upsert cards to Vectorize index
   * Call this when deck is created/updated to keep embeddings in sync
   */
  static async upsertCards(cards: LoreCard[], deckId?: string): Promise<{ success: boolean; count: number }> {
    if (!this.isAvailable()) {
      console.log('ℹ️ Vectorize not available in local dev, skipping upsert');
      return { success: true, count: 0 };
    }
    try {
      const response = await fetch(`${this.API_BASE}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cards: cards.map(card => ({
            id: card.id,
            name: card.name,
            description: card.flavor || '',
            might: card.stats.might,
            fortune: card.stats.fortune,
            cunning: card.stats.cunning,
            category: card.type,
          })),
          deckId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upsert cards');
      }

      const result = await response.json();
      console.log('✅ Vectorize upsert successful:', result);
      return result;
    } catch (error) {
      console.error('❌ Vectorize upsert failed:', error);
      throw error;
    }
  }

  /**
   * Query for semantically similar cards
   * Useful for finding thematically related cards or narrative suggestions
   */
  static async querySimilarCards(
    queryText: string,
    options: {
      topK?: number;
      deckId?: string;
      minMight?: number;
      minFortune?: number;
      minCunning?: number;
    } = {}
  ): Promise<VectorizeCard[]> {
    if (!this.isAvailable()) {
      console.log('ℹ️ Vectorize not available in local dev, skipping query');
      return [];
    }
    try {
      const params = new URLSearchParams({
        q: queryText,
        ...(options.topK && { topK: options.topK.toString() }),
        ...(options.deckId && { deckId: options.deckId }),
        ...(options.minMight && { minMight: options.minMight.toString() }),
        ...(options.minFortune && { minFortune: options.minFortune.toString() }),
        ...(options.minCunning && { minCunning: options.minCunning.toString() }),
      });

      const response = await fetch(`${this.API_BASE}?${params.toString()}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to query cards');
      }

      const result = await response.json();
      console.log('🔍 Vectorize query results:', result.matches.length, 'matches');
      return result.matches;
    } catch (error) {
      console.error('❌ Vectorize query failed:', error);
      throw error;
    }
  }

  /**
   * Get contextually relevant cards for narrative generation
   * Uses the current scene/narrative as context to find relevant cards
   */
  static async getRelevantCardsForNarrative(
    narrative: string,
    availableCards: LoreCard[],
    topK: number = 5
  ): Promise<LoreCard[]> {
    if (!this.isAvailable()) {
      // In local dev, return a random subset of cards
      return availableCards.slice(0, topK);
    }
    try {
      const matches = await this.querySimilarCards(narrative, { topK });

      // Filter matches to only include cards from available deck
      const availableCardIds = new Set(availableCards.map(c => c.id));
      const relevantCardIds = matches
        .filter(m => availableCardIds.has(m.id))
        .map(m => m.id);

      // Return cards in order of relevance
      return availableCards.filter(card => relevantCardIds.includes(card.id));
    } catch (error) {
      console.warn('⚠️ Failed to get relevant cards, falling back to all cards:', error);
      // Fallback: return all available cards
      return availableCards;
    }
  }

  /**
   * Initialize Vectorize index with active deck
   * Call this when app loads or deck changes
   */
  static async initializeDeck(cards: LoreCard[], deckId: string): Promise<void> {
    if (!this.isAvailable()) {
      console.log('ℹ️ Vectorize not available in local dev (deploy to Cloudflare to enable)');
      return;
    }
    try {
      console.log('🚀 Initializing Vectorize with', cards.length, 'cards');
      await this.upsertCards(cards, deckId);
      console.log('✅ Vectorize initialization complete');
    } catch (error) {
      console.error('❌ Failed to initialize Vectorize:', error);
      // Non-fatal: app can continue without Vectorize
    }
  }
}
