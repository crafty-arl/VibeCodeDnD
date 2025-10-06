import type { LoreCard } from '../types/game';
import { LORE_DECK } from '../data/cards';

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
  static getAllDecks(): Deck[] {
    const stored = localStorage.getItem(DECKS_KEY);
    if (!stored) {
      // Initialize with default deck
      const defaultDeck = createDefaultDeck();
      this.saveDecks([defaultDeck]);
      return [defaultDeck];
    }
    try {
      return JSON.parse(stored);
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

  static createDeck(name: string, description: string, cards: LoreCard[]): Deck {
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
    return newDeck;
  }

  static updateDeck(deckId: string, updates: Partial<Omit<Deck, 'id' | 'createdAt'>>): void {
    const decks = this.getAllDecks();
    const index = decks.findIndex(d => d.id === deckId);

    if (index !== -1) {
      decks[index] = {
        ...decks[index],
        ...updates,
        updatedAt: Date.now(),
      };
      this.saveDecks(decks);
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

  static setActiveDeck(deckId: string): void {
    localStorage.setItem(ACTIVE_DECK_KEY, deckId);
  }

  static drawRandomCards(count: number, exclude: string[] = []): LoreCard[] {
    const activeDeck = this.getActiveDeck();
    const availableCards = activeDeck.cards.filter(card => !exclude.includes(card.id));
    const shuffled = [...availableCards].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }
}
