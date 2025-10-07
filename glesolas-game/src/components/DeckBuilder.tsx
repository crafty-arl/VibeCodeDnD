import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, Check, X, Layers, Sparkles, Dices } from 'lucide-react';
import type { LoreCard } from '../types/game';
import { LORE_DECK } from '../data/cards';
import { DeckManager, type Deck } from '../lib/deckManager';
import { LoreCardComponent } from './LoreCardComponent';
import { AIDeckGenerator } from './AIDeckGenerator';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface DeckBuilderProps {
  isOpen?: boolean;
  onClose: () => void;
  onDeckSelected?: (deck: Deck) => void;
}

export function DeckBuilder({ isOpen = true, onClose, onDeckSelected }: DeckBuilderProps) {
  const [decks, setDecks] = useState<Deck[]>(DeckManager.getAllDecks());
  const [activeDeckId, setActiveDeckIdState] = useState(DeckManager.getActiveDeckId());
  const [editingDeck, setEditingDeck] = useState<Deck | null>(null);
  const [showDeckEditor, setShowDeckEditor] = useState(false);
  const [showAIGenerator, setShowAIGenerator] = useState(false);

  // Refresh deck list when modal opens or when returning from editor/generator
  useEffect(() => {
    if (isOpen && !showDeckEditor && !showAIGenerator) {
      const allDecks = DeckManager.getAllDecks();
      console.log('📚 Refreshing deck list:', allDecks.length, 'decks', allDecks.map(d => d.name));
      setDecks(allDecks);
    }
  }, [isOpen, showDeckEditor, showAIGenerator]);

  const handleCreateDeck = () => {
    setEditingDeck(null);
    setShowDeckEditor(true);
  };

  const handleGenerateWithAI = () => {
    setShowAIGenerator(true);
  };

  const handleEditDeck = (deck: Deck) => {
    console.log('📝 Editing deck:', deck.name, 'Cards:', deck.cards.length, deck.cards);
    setEditingDeck(deck);
    setShowDeckEditor(true);
  };

  const handleDeleteDeck = (deckId: string) => {
    DeckManager.deleteDeck(deckId);
    setDecks(DeckManager.getAllDecks());
  };

  const handleSelectActiveDeck = (deckId: string) => {
    DeckManager.setActiveDeck(deckId);
    setActiveDeckIdState(deckId);
  };

  const handleSaveDeck = (deck: Deck) => {
    if (editingDeck) {
      DeckManager.updateDeck(deck.id, {
        name: deck.name,
        description: deck.description,
        cards: deck.cards,
      });
    } else {
      DeckManager.createDeck(deck.name, deck.description, deck.cards);
    }
    setDecks(DeckManager.getAllDecks());
    setShowDeckEditor(false);
    setEditingDeck(null);
  };

  if (showAIGenerator) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-60"
              onClick={onClose}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-60 w-full max-w-6xl max-h-[90vh] overflow-auto p-4"
            >
              <AIDeckGenerator
                onSave={(deck: Deck) => {
                  DeckManager.createDeck(deck.name, deck.description, deck.cards);
                  setDecks(DeckManager.getAllDecks());
                  setShowAIGenerator(false);
                }}
                onCancel={() => setShowAIGenerator(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  if (showDeckEditor) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-60"
              onClick={onClose}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-60 w-full max-w-6xl max-h-[90vh] overflow-auto p-4"
            >
              <DeckEditor
                deck={editingDeck}
                onSave={handleSaveDeck}
                onCancel={() => {
                  setShowDeckEditor(false);
                  setEditingDeck(null);
                }}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-60"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-60 w-full max-w-6xl max-h-[90vh] overflow-auto p-4"
          >
            <Card className="border-primary/50">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-5 h-5" />
                    <span>Deck Manager</span>
                  </div>
                  <Button onClick={onClose} variant="ghost" size="sm">
                    <X className="w-4 h-4" />
                  </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Create and manage your custom decks. Select a deck to use when starting games.
            </p>
            <div className="flex gap-2">
              <Button onClick={handleGenerateWithAI} size="sm" className="gap-2" variant="secondary">
                <Sparkles className="w-4 h-4" />
                Generate with AI
              </Button>
              <Button onClick={handleCreateDeck} size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                New Deck
              </Button>
            </div>
          </div>

          <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
            {decks.map((deck) => (
              <DeckCard
                key={deck.id}
                deck={deck}
                isActive={deck.id === activeDeckId}
                onSelect={() => handleSelectActiveDeck(deck.id)}
                onEdit={() => handleEditDeck(deck)}
                onDelete={() => handleDeleteDeck(deck.id)}
                onChoose={
                  onDeckSelected
                    ? () => {
                        handleSelectActiveDeck(deck.id);
                        onDeckSelected(deck);
                        onClose();
                      }
                    : undefined
                }
              />
            ))}
          </div>

          <p className="text-xs text-muted-foreground text-center mt-2">
            {decks.length} deck{decks.length !== 1 ? 's' : ''} available
          </p>

          {decks.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Layers className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No decks found. Create your first deck!</p>
            </div>
          )}
        </CardContent>
      </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

interface DeckCardProps {
  deck: Deck;
  isActive: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onChoose?: () => void;
}

function DeckCard({ deck, isActive, onSelect, onEdit, onDelete, onChoose }: DeckCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const isDefault = deck.id === 'default_full_deck';

  return (
    <Card className={`${isActive ? 'border-primary' : 'border-muted'} transition-colors`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold">{deck.name}</h4>
              {isActive && (
                <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary">
                  Active
                </span>
              )}
              {isDefault && (
                <span className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
                  Default
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{deck.description}</p>
            <p className="text-xs text-muted-foreground">{deck.cards.length} cards</p>
          </div>

          <div className="flex gap-2">
            {!isActive && (
              <Button variant="outline" size="sm" onClick={onSelect}>
                <Check className="w-4 h-4" />
              </Button>
            )}
            {onChoose && (
              <Button variant="default" size="sm" onClick={onChoose}>
                Choose
              </Button>
            )}
            {!isDefault && (
              <>
                <Button variant="outline" size="sm" onClick={onEdit}>
                  <Edit className="w-4 h-4" />
                </Button>
                {showDeleteConfirm ? (
                  <>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        onDelete();
                        setShowDeleteConfirm(false);
                      }}
                    >
                      Confirm
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowDeleteConfirm(false)}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface DeckEditorProps {
  deck: Deck | null;
  onSave: (deck: Deck) => void;
  onCancel: () => void;
}

function DeckEditor({ deck, onSave, onCancel }: DeckEditorProps) {
  const [deckName, setDeckName] = useState(deck?.name || '');
  const [deckDescription, setDeckDescription] = useState(deck?.description || '');
  const [selectedCards, setSelectedCards] = useState<LoreCard[]>(deck?.cards || []);

  // Update state when deck prop changes (e.g., switching between editing different decks)
  useEffect(() => {
    console.log('🔄 DeckEditor useEffect - deck changed:', deck?.name, 'Cards:', deck?.cards?.length);
    setDeckName(deck?.name || '');
    setDeckDescription(deck?.description || '');
    setSelectedCards(deck?.cards || []);
  }, [deck]);

  const handleCardToggle = (card: LoreCard) => {
    setSelectedCards((prev) => {
      const exists = prev.find((c) => c.id === card.id);
      if (exists) {
        return prev.filter((c) => c.id !== card.id);
      } else {
        return [...prev, card];
      }
    });
  };

  const handleRandomSelect = () => {
    // Shuffle the available cards and pick 35
    const shuffled = [...allAvailableCards].sort(() => Math.random() - 0.5);
    const randomSelection = shuffled.slice(0, 35);
    setSelectedCards(randomSelection);
  };

  const handleSave = () => {
    if (!deckName.trim() || selectedCards.length === 0) return;

    const deckToSave: Deck = deck
      ? {
          ...deck,
          name: deckName,
          description: deckDescription,
          cards: selectedCards,
          updatedAt: Date.now(),
        }
      : {
          id: `deck_${Date.now()}`,
          name: deckName,
          description: deckDescription,
          cards: selectedCards,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

    onSave(deckToSave);
  };

  // Check if this is an AI-generated deck (has cards not in LORE_DECK)
  const isAIGeneratedDeck = deck ? deck.cards.some(deckCard =>
    !LORE_DECK.find(loreCard => loreCard.id === deckCard.id)
  ) : false;

  // Build complete card pool: LORE_DECK + all custom cards from all decks
  const buildCompleteCardPool = () => {
    const allDecks = DeckManager.getAllDecks();
    const allCustomCards: LoreCard[] = [];

    // Collect all unique custom cards from all decks
    allDecks.forEach(d => {
      d.cards.forEach(card => {
        // If card isn't in LORE_DECK and we haven't added it yet, add it
        if (!LORE_DECK.find(lc => lc.id === card.id) && !allCustomCards.find(cc => cc.id === card.id)) {
          allCustomCards.push(card);
        }
      });
    });

    return [...LORE_DECK, ...allCustomCards];
  };

  // Show card pool based on context:
  // - Creating new deck (deck is null): show all available cards (LORE_DECK + custom cards from other decks)
  // - Editing AI deck: show the deck's custom cards (view-only)
  // - Editing standard deck: show all available cards for editing
  const allAvailableCards = (isAIGeneratedDeck && deck) ? deck.cards : buildCompleteCardPool();

  console.log('🎴 DeckEditor state:', {
    isDeckNull: !deck,
    isAIGeneratedDeck,
    deckName: deck?.name,
    allAvailableCardsCount: allAvailableCards.length,
    LORE_DECK_count: LORE_DECK.length,
    selectedCardsCount: selectedCards.length
  });

  const characters = allAvailableCards.filter((card) => card.type === 'Character');
  const items = allAvailableCards.filter((card) => card.type === 'Item');
  const locations = allAvailableCards.filter((card) => card.type === 'Location');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4"
    >
      <Card className="border-primary/50">
        <CardHeader>
          <CardTitle>{deck ? 'Edit Deck' : 'Create New Deck'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Deck Name</label>
            <Input
              value={deckName}
              onChange={(e) => setDeckName(e.target.value)}
              placeholder="My Custom Deck"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Input
              value={deckDescription}
              onChange={(e) => setDeckDescription(e.target.value)}
              placeholder="A specialized deck for..."
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                Selected Cards ({selectedCards.length})
              </label>
              {!isAIGeneratedDeck && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRandomSelect}
                  disabled={allAvailableCards.length < 35}
                  className="gap-2"
                >
                  <Dices className="w-4 h-4" />
                  Random 35
                </Button>
              )}
            </div>

            {isAIGeneratedDeck && (
              <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg text-sm">
                <p className="text-blue-400">
                  ℹ️ This is an AI-generated deck. Cards are shown for reference only and cannot be modified. You can edit the deck name and description.
                </p>
              </div>
            )}

            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All ({allAvailableCards.length})</TabsTrigger>
                <TabsTrigger value="characters">Characters ({characters.length})</TabsTrigger>
                <TabsTrigger value="items">Items ({items.length})</TabsTrigger>
                <TabsTrigger value="locations">Locations ({locations.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-4">
                <CardGrid
                  cards={allAvailableCards}
                  selectedCards={selectedCards}
                  onCardToggle={isAIGeneratedDeck ? () => {} : handleCardToggle}
                  disabled={isAIGeneratedDeck}
                />
              </TabsContent>

              <TabsContent value="characters" className="mt-4">
                <CardGrid
                  cards={characters}
                  selectedCards={selectedCards}
                  onCardToggle={isAIGeneratedDeck ? () => {} : handleCardToggle}
                  disabled={isAIGeneratedDeck}
                />
              </TabsContent>

              <TabsContent value="items" className="mt-4">
                <CardGrid
                  cards={items}
                  selectedCards={selectedCards}
                  onCardToggle={isAIGeneratedDeck ? () => {} : handleCardToggle}
                  disabled={isAIGeneratedDeck}
                />
              </TabsContent>

              <TabsContent value="locations" className="mt-4">
                <CardGrid
                  cards={locations}
                  selectedCards={selectedCards}
                  onCardToggle={isAIGeneratedDeck ? () => {} : handleCardToggle}
                  disabled={isAIGeneratedDeck}
                />
              </TabsContent>
            </Tabs>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSave}
              disabled={!deckName.trim() || selectedCards.length === 0}
              className="flex-1"
            >
              {deck ? 'Update Deck' : 'Create Deck'}
            </Button>
            <Button onClick={onCancel} variant="outline" className="flex-1">
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface CardGridProps {
  cards: LoreCard[];
  selectedCards: LoreCard[];
  onCardToggle: (card: LoreCard) => void;
  disabled?: boolean;
}

function CardGrid({ cards, selectedCards, onCardToggle, disabled }: CardGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 max-h-[400px] overflow-y-auto p-1">
      {cards.map((card) => {
        const isSelected = selectedCards.find((c) => c.id === card.id);

        return (
          <div key={card.id} className="relative">
            <LoreCardComponent
              card={card}
              selected={!!isSelected}
              onClick={disabled ? undefined : () => onCardToggle(card)}
              disabled={disabled}
            />
            {isSelected && (
              <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center">
                <Check className="w-4 h-4" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
