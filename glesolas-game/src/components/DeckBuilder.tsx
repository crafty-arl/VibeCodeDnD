import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Check, X, Layers, Sparkles } from 'lucide-react';
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
  onClose: () => void;
  onDeckSelected?: (deck: Deck) => void;
}

export function DeckBuilder({ onClose, onDeckSelected }: DeckBuilderProps) {
  const [decks, setDecks] = useState<Deck[]>(DeckManager.getAllDecks());
  const [activeDeckId, setActiveDeckIdState] = useState(DeckManager.getActiveDeckId());
  const [editingDeck, setEditingDeck] = useState<Deck | null>(null);
  const [showDeckEditor, setShowDeckEditor] = useState(false);
  const [showAIGenerator, setShowAIGenerator] = useState(false);

  const handleCreateDeck = () => {
    setEditingDeck(null);
    setShowDeckEditor(true);
  };

  const handleGenerateWithAI = () => {
    setShowAIGenerator(true);
  };

  const handleEditDeck = (deck: Deck) => {
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
      <AIDeckGenerator
        onSave={(deck: Deck) => {
          DeckManager.createDeck(deck.name, deck.description, deck.cards);
          setDecks(DeckManager.getAllDecks());
          setShowAIGenerator(false);
        }}
        onCancel={() => setShowAIGenerator(false)}
      />
    );
  }

  if (showDeckEditor) {
    return (
      <DeckEditor
        deck={editingDeck}
        onSave={handleSaveDeck}
        onCancel={() => {
          setShowDeckEditor(false);
          setEditingDeck(null);
        }}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4"
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

          <div className="space-y-3">
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

          {decks.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Layers className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No decks found. Create your first deck!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
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

  const characters = LORE_DECK.filter((card) => card.type === 'Character');
  const items = LORE_DECK.filter((card) => card.type === 'Item');
  const locations = LORE_DECK.filter((card) => card.type === 'Location');

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
            <label className="text-sm font-medium">
              Selected Cards ({selectedCards.length})
            </label>

            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All ({LORE_DECK.length})</TabsTrigger>
                <TabsTrigger value="characters">Characters ({characters.length})</TabsTrigger>
                <TabsTrigger value="items">Items ({items.length})</TabsTrigger>
                <TabsTrigger value="locations">Locations ({locations.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-4">
                <CardGrid
                  cards={LORE_DECK}
                  selectedCards={selectedCards}
                  onCardToggle={handleCardToggle}
                />
              </TabsContent>

              <TabsContent value="characters" className="mt-4">
                <CardGrid
                  cards={characters}
                  selectedCards={selectedCards}
                  onCardToggle={handleCardToggle}
                />
              </TabsContent>

              <TabsContent value="items" className="mt-4">
                <CardGrid
                  cards={items}
                  selectedCards={selectedCards}
                  onCardToggle={handleCardToggle}
                />
              </TabsContent>

              <TabsContent value="locations" className="mt-4">
                <CardGrid
                  cards={locations}
                  selectedCards={selectedCards}
                  onCardToggle={handleCardToggle}
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
}

function CardGrid({ cards, selectedCards, onCardToggle }: CardGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 max-h-[400px] overflow-y-auto p-1">
      {cards.map((card) => {
        const isSelected = selectedCards.find((c) => c.id === card.id);

        return (
          <div key={card.id} className="relative">
            <LoreCardComponent
              card={card}
              selected={!!isSelected}
              onClick={() => onCardToggle(card)}
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
