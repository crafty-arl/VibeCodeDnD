import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import type { LoreCard } from '../types/game';
import { DeckManager } from '../lib/deckManager';
import { LoreCardComponent } from './LoreCardComponent';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface DeckSelectorProps {
  onConfirmSelection: (selectedCards: LoreCard[]) => void;
  onCancel: () => void;
}

export function DeckSelector({ onConfirmSelection, onCancel }: DeckSelectorProps) {
  const [selectedCards, setSelectedCards] = useState<LoreCard[]>([]);
  const activeDeck = DeckManager.getActiveDeck();
  const deckCards = activeDeck.cards;

  const handleCardClick = (card: LoreCard) => {
    setSelectedCards(prev => {
      const isAlreadySelected = prev.find(c => c.id === card.id);

      if (isAlreadySelected) {
        // Deselect
        return prev.filter(c => c.id !== card.id);
      } else if (prev.length < 3) {
        // Add to selection
        return [...prev, card];
      } else {
        // Replace oldest selection
        return [...prev.slice(1), card];
      }
    });
  };

  const handleConfirm = () => {
    if (selectedCards.length === 3) {
      onConfirmSelection(selectedCards);
    }
  };

  const characters = deckCards.filter(card => card.type === 'Character');
  const items = deckCards.filter(card => card.type === 'Item');
  const locations = deckCards.filter(card => card.type === 'Location');

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
            <span>Choose Your Starting Hand</span>
            <span className="text-sm font-normal text-muted-foreground">
              {selectedCards.length}/3 selected
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">
              Deck: {activeDeck.name}
            </p>
            <p className="text-sm text-muted-foreground">
              Select 3 cards from this deck to begin your adventure. Choose wisely - these will be the first cards in your hand.
            </p>
          </div>

          {/* Selected Cards Preview */}
          {selectedCards.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Selected Cards:</h3>
              <div className="grid grid-cols-3 gap-3">
                {selectedCards.map((card, index) => (
                  <div key={card.id} className="relative">
                    <LoreCardComponent card={card} disabled />
                    <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>
                  </div>
                ))}
                {[...Array(3 - selectedCards.length)].map((_, i) => (
                  <div
                    key={`empty-${i}`}
                    className="aspect-[2/3] border-2 border-dashed border-muted-foreground/30 rounded-lg flex items-center justify-center text-muted-foreground/50 text-sm"
                  >
                    Slot {selectedCards.length + i + 1}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Deck Browser */}
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All ({deckCards.length})</TabsTrigger>
              <TabsTrigger value="characters">Characters ({characters.length})</TabsTrigger>
              <TabsTrigger value="items">Items ({items.length})</TabsTrigger>
              <TabsTrigger value="locations">Locations ({locations.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-4">
              <CardGrid
                cards={deckCards}
                selectedCards={selectedCards}
                onCardClick={handleCardClick}
              />
            </TabsContent>

            <TabsContent value="characters" className="mt-4">
              <CardGrid
                cards={characters}
                selectedCards={selectedCards}
                onCardClick={handleCardClick}
              />
            </TabsContent>

            <TabsContent value="items" className="mt-4">
              <CardGrid
                cards={items}
                selectedCards={selectedCards}
                onCardClick={handleCardClick}
              />
            </TabsContent>

            <TabsContent value="locations" className="mt-4">
              <CardGrid
                cards={locations}
                selectedCards={selectedCards}
                onCardClick={handleCardClick}
              />
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleConfirm}
              disabled={selectedCards.length !== 3}
              className="flex-1"
              size="lg"
            >
              <Check className="w-4 h-4 mr-2" />
              Start Adventure ({selectedCards.length}/3)
            </Button>
            <Button
              onClick={onCancel}
              variant="outline"
              size="lg"
            >
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
  onCardClick: (card: LoreCard) => void;
}

function CardGrid({ cards, selectedCards, onCardClick }: CardGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 max-h-[500px] overflow-y-auto p-1">
      {cards.map(card => {
        const isSelected = selectedCards.find(c => c.id === card.id);
        const selectionIndex = selectedCards.findIndex(c => c.id === card.id);

        return (
          <div key={card.id} className="relative">
            <LoreCardComponent
              card={card}
              selected={!!isSelected}
              onClick={() => onCardClick(card)}
            />
            {isSelected && (
              <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold shadow-lg">
                {selectionIndex + 1}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
