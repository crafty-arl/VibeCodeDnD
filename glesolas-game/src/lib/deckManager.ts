import type { LoreCard } from '../types/game';
import { LORE_DECK } from '../data/cards';
import { VectorizeService } from './vectorizeService';
import { CompanionManager } from './companionManager';

export interface Deck {
  id: string;
  name: string;
  description: string;
  cards: LoreCard[];
  createdAt: number;
  updatedAt: number;
}

const DECKS_KEY = 'glesolas_decks';
const ACTIVE_DECK_KEY = 'glesolas_active_deck';
const DEFAULT_DECK_ID = 'default_full_deck';

// Create default deck containing all cards
const createDefaultDeck = (): Deck => ({
  id: DEFAULT_DECK_ID,
  name: 'Complete Collection',
  description: 'All available cards from the GLESOLAS deck',
  cards: [...LORE_DECK],
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

export class DeckManager {
  /**
   * Migrates existing AI-generated Character cards to include companion properties
   */
  static migrateCharacterCards(card: LoreCard): LoreCard {
    // If it's not a Character card, return as-is
    if (card.type !== 'Character') {
      return card;
    }

    // If it already has companion properties, return as-is
    if (card.preferredPath && card.dialogue) {
      return card;
    }

    // Determine preferred path based on highest stat
    let preferredPath: 'might' | 'fortune' | 'cunning';
    if (card.stats.might >= card.stats.fortune && card.stats.might >= card.stats.cunning) {
      preferredPath = 'might';
    } else if (card.stats.fortune >= card.stats.cunning) {
      preferredPath = 'fortune';
    } else {
      preferredPath = 'cunning';
    }

    // Add companion properties
    return {
      ...card,
      preferredPath,
      dialogue: {
        onPlay: [`Ready to assist!`, `Let's do this together.`],
        onWin: [`Victory!`, `We did it!`],
        onLose: [`We'll get them next time.`, `That was tough...`],
        onKeyStat: [`Perfect execution!`, `Just as planned!`],
        onNonKeyStat: [`We won, but that was risky.`, `Not my preferred approach.`],
      },
      loyalty: card.loyalty ?? 0,
      timesPlayed: card.timesPlayed ?? 0,
      encountersWon: card.encountersWon ?? 0,
      encountersLost: card.encountersLost ?? 0,
    };
  }

  static getAllDecks(): Deck[] {
    const stored = localStorage.getItem(DECKS_KEY);
    if (!stored) {
      // Initialize with default deck
      const defaultDeck = createDefaultDeck();
      this.saveDecks([defaultDeck]);
      return [defaultDeck];
    }
    try {
      const decks: Deck[] = JSON.parse(stored);

      // Migrate Character cards in all decks
      let needsMigration = false;
      const migratedDecks = decks.map(deck => {
        const migratedCards = deck.cards.map(card => {
          const migrated = this.migrateCharacterCards(card);
          if (migrated !== card) {
            needsMigration = true;
          }
          return migrated;
        });

        return {
          ...deck,
          cards: migratedCards,
        };
      });

      // Save if any cards were migrated
      if (needsMigration) {
        console.log('🔄 Migrated Character cards with companion properties');
        this.saveDecks(migratedDecks);
        return migratedDecks;
      }

      return decks;
    } catch {
      return [createDefaultDeck()];
    }
  }

  static saveDecks(decks: Deck[]): void {
    localStorage.setItem(DECKS_KEY, JSON.stringify(decks));
  }

  static getDeck(deckId: string): Deck | null {
    const decks = this.getAllDecks();
    return decks.find(d => d.id === deckId) || null;
  }

  static async createDeck(name: string, description: string, cards: LoreCard[]): Promise<Deck> {
    const decks = this.getAllDecks();
    const newDeck: Deck = {
      id: `deck_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      cards,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    decks.push(newDeck);
    this.saveDecks(decks);

    // Sync cards to Vectorize for semantic search
    try {
      await VectorizeService.upsertCards(cards, newDeck.id);
      console.log('✅ Deck synced to Vectorize');
    } catch (error) {
      console.warn('⚠️ Failed to sync deck to Vectorize:', error);
      // Non-fatal: continue without Vectorize
    }

    return newDeck;
  }

  static async updateDeck(deckId: string, updates: Partial<Omit<Deck, 'id' | 'createdAt'>>): Promise<void> {
    const decks = this.getAllDecks();
    const index = decks.findIndex(d => d.id === deckId);

    if (index !== -1) {
      decks[index] = {
        ...decks[index],
        ...updates,
        updatedAt: Date.now(),
      };
      this.saveDecks(decks);

      // Re-sync cards to Vectorize if cards were updated
      if (updates.cards) {
        try {
          await VectorizeService.upsertCards(updates.cards, deckId);
          console.log('✅ Deck re-synced to Vectorize');
        } catch (error) {
          console.warn('⚠️ Failed to re-sync deck to Vectorize:', error);
        }
      }
    }
  }

  static deleteDeck(deckId: string): void {
    // Prevent deleting default deck
    if (deckId === DEFAULT_DECK_ID) {
      console.warn('Cannot delete default deck');
      return;
    }

    const decks = this.getAllDecks().filter(d => d.id !== deckId);
    this.saveDecks(decks);

    // If deleted deck was active, switch to default
    if (this.getActiveDeckId() === deckId) {
      this.setActiveDeck(DEFAULT_DECK_ID);
    }
  }

  static getActiveDeckId(): string {
    return localStorage.getItem(ACTIVE_DECK_KEY) || DEFAULT_DECK_ID;
  }

  static getActiveDeck(): Deck {
    const deckId = this.getActiveDeckId();
    const deck = this.getDeck(deckId);
    return deck || createDefaultDeck();
  }

  static async setActiveDeck(deckId: string): Promise<void> {
    localStorage.setItem(ACTIVE_DECK_KEY, deckId);

    // Initialize Vectorize with active deck cards
    const deck = this.getDeck(deckId);
    if (deck) {
      try {
        await VectorizeService.initializeDeck(deck.cards, deckId);
      } catch (error) {
        console.warn('⚠️ Failed to initialize Vectorize with active deck:', error);
      }
    }
  }

  static drawRandomCards(count: number, exclude: string[] = []): LoreCard[] {
    const activeDeck = this.getActiveDeck();
    const availableCards = activeDeck.cards.filter(card => !exclude.includes(card.id));
    const shuffled = [...availableCards].sort(() => Math.random() - 0.5);
    const drawnCards = shuffled.slice(0, count);

    // Enrich Character cards with companion data
    return drawnCards.map(card =>
      card.type === 'Character' ? CompanionManager.enrichCard(card) : card
    );
  }

  static async addCardToActiveDeck(card: LoreCard): Promise<void> {
    const activeDeckId = this.getActiveDeckId();
    const activeDeck = this.getActiveDeck();

    // Check if card already exists in deck
    const cardExists = activeDeck.cards.some(c => c.id === card.id);
    if (cardExists) {
      console.warn('Card already exists in deck:', card.id);
      return;
    }

    // Add card to deck
    const updatedCards = [...activeDeck.cards, card];

    await this.updateDeck(activeDeckId, { cards: updatedCards });

    console.log(`✅ Added ${card.name} to active deck`);
  }
}
