import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import type { LoreCard } from '../types/game';
import { DeckManager } from '../lib/deckManager';
import { LoreCardComponent } from './LoreCardComponent';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface DeckSelectorProps {
  onConfirmSelection: () => void;
  onCancel: () => void;
}

export function DeckSelector({ onConfirmSelection, onCancel }: DeckSelectorProps) {
  const activeDeck = DeckManager.getActiveDeck();
  const deckCards = activeDeck.cards;

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
            <span>Preview Your Deck</span>
            <span className="text-sm font-normal text-muted-foreground">
              {activeDeck.name}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              📜 You'll draw 3 random cards each encounter from this deck. Browse your cards below, then start when ready!
            </p>
          </div>


          {/* Deck Browser */}
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All ({deckCards.length})</TabsTrigger>
              <TabsTrigger value="characters">Characters ({characters.length})</TabsTrigger>
              <TabsTrigger value="items">Items ({items.length})</TabsTrigger>
              <TabsTrigger value="locations">Locations ({locations.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-4">
              <CardGrid cards={deckCards} />
            </TabsContent>

            <TabsContent value="characters" className="mt-4">
              <CardGrid cards={characters} />
            </TabsContent>

            <TabsContent value="items" className="mt-4">
              <CardGrid cards={items} />
            </TabsContent>

            <TabsContent value="locations" className="mt-4">
              <CardGrid cards={locations} />
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={onConfirmSelection}
              className="flex-1"
              size="lg"
            >
              <Check className="w-4 h-4 mr-2" />
              Start Adventure
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
}

function CardGrid({ cards }: CardGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 max-h-[500px] overflow-y-auto p-1">
      {cards.map(card => (
        <motion.div
          key={card.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          <LoreCardComponent card={card} disabled />
        </motion.div>
      ))}
    </div>
  );
}
