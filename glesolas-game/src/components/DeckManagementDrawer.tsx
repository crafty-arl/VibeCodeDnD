import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Library, Layers, Plus, Heart, Sword, Wand2 } from 'lucide-react';
import { DeckManager, type Deck } from '@/lib/deckManager';
import { CompanionManager } from '@/lib/companionManager';
import { LoreCardComponent } from './LoreCardComponent';
import { AIDeckGenerator } from './AIDeckGenerator';
import { AISingleCardGenerator } from './AISingleCardGenerator';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import type { LoreCard } from '@/types/game';

interface DeckManagementDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DeckManagementDrawer({ isOpen, onClose }: DeckManagementDrawerProps) {
  const [activeTab, setActiveTab] = useState('collection');
  const [showDeckEditor, setShowDeckEditor] = useState(false);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [showSingleCardGenerator, setShowSingleCardGenerator] = useState(false);
  const [editingDeck, setEditingDeck] = useState<Deck | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const decks = DeckManager.getAllDecks();
  const activeDeck = DeckManager.getActiveDeck();

  // Build complete card collection
  const allCards: LoreCard[] = [];
  const seenIds = new Set<string>();

  decks.forEach(deck => {
    deck.cards.forEach(card => {
      if (!seenIds.has(card.id)) {
        seenIds.add(card.id);
        const enrichedCard = card.type === 'Character' ? CompanionManager.enrichCard(card) : card;
        allCards.push(enrichedCard);
      }
    });
  });

  // Filter cards based on search
  const filteredCards = searchQuery
    ? allCards.filter(card =>
        card.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.flavor.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allCards;

  // Companion cards only
  const companions = allCards.filter(card => card.type === 'Character' && card.loyalty !== undefined);

  const handleCreateNewDeck = () => {
    setEditingDeck(null);
    setShowDeckEditor(true);
  };

  const handleSaveDeck = async (deck: Deck) => {
    if (editingDeck) {
      await DeckManager.updateDeck(deck.id, {
        name: deck.name,
        description: deck.description,
        cards: deck.cards,
        updatedAt: Date.now()
      });
    } else {
      DeckManager.createDeck(deck.name, deck.description, deck.cards);
    }
    setShowDeckEditor(false);
    setEditingDeck(null);
  };

  const handleSelectDeck = (deckId: string) => {
    DeckManager.setActiveDeck(deckId);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-3xl border-t-2 border-primary/50 shadow-2xl max-h-[85vh] flex flex-col"
          >
            {/* Handle Bar */}
            <div className="flex items-center justify-center py-3 border-b border-border/50">
              <div className="w-12 h-1 bg-muted-foreground/30 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Library className="w-5 h-5" />
                Deck Management
              </h2>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
              <TabsList className="grid w-full grid-cols-5 mx-4 mt-2">
                <TabsTrigger value="collection" className="text-xs">
                  <Library className="w-4 h-4 mr-1" />
                  Collection
                </TabsTrigger>
                <TabsTrigger value="active" className="text-xs">
                  <Sword className="w-4 h-4 mr-1" />
                  Active
                </TabsTrigger>
                <TabsTrigger value="decks" className="text-xs">
                  <Layers className="w-4 h-4 mr-1" />
                  Decks
                </TabsTrigger>
                <TabsTrigger value="create" className="text-xs">
                  <Plus className="w-4 h-4 mr-1" />
                  Create
                </TabsTrigger>
                <TabsTrigger value="companions" className="text-xs">
                  <Heart className="w-4 h-4 mr-1" />
                  Allies
                </TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-y-auto px-4 pb-4">
                {/* Collection Tab */}
                <TabsContent value="collection" className="mt-4 space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        {allCards.length} cards in your collection
                      </p>
                    </div>
                    <Input
                      placeholder="Search cards..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {filteredCards.map(card => (
                      <LoreCardComponent
                        key={card.id}
                        card={card}
                      />
                    ))}
                  </div>
                </TabsContent>

                {/* Active Deck Tab */}
                <TabsContent value="active" className="mt-4 space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>{activeDeck.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{activeDeck.description}</p>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        {activeDeck.cards.length} cards
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {activeDeck.cards.map(card => {
                          const enrichedCard = card.type === 'Character' ? CompanionManager.enrichCard(card) : card;
                          return (
                            <LoreCardComponent
                              key={card.id}
                              card={enrichedCard}
                            />
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Decks Tab */}
                <TabsContent value="decks" className="mt-4 space-y-4">
                  {decks.map(deck => (
                    <Card key={deck.id} className={deck.id === activeDeck.id ? 'border-primary' : ''}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{deck.name}</CardTitle>
                            <p className="text-sm text-muted-foreground">{deck.description}</p>
                            <p className="text-xs text-muted-foreground mt-1">{deck.cards.length} cards</p>
                          </div>
                          <div className="flex gap-2">
                            {deck.id !== activeDeck.id && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSelectDeck(deck.id)}
                              >
                                Equip
                              </Button>
                            )}
                            {deck.id === activeDeck.id && (
                              <span className="text-xs px-2 py-1 bg-primary/20 rounded">Active</span>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </TabsContent>

                {/* Create Tab */}
                <TabsContent value="create" className="mt-4 space-y-4">
                  {!showDeckEditor && !showAIGenerator && !showSingleCardGenerator && (
                    <div className="space-y-3">
                      <Button
                        onClick={handleCreateNewDeck}
                        className="w-full"
                        size="lg"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Custom Deck
                      </Button>
                      <Button
                        onClick={() => setShowAIGenerator(true)}
                        className="w-full"
                        size="lg"
                        variant="outline"
                      >
                        <Library className="w-4 h-4 mr-2" />
                        AI Generate Full Deck
                      </Button>
                      <Button
                        onClick={() => setShowSingleCardGenerator(true)}
                        className="w-full"
                        size="lg"
                        variant="outline"
                      >
                        <Wand2 className="w-4 h-4 mr-2" />
                        AI Generate Single Card
                      </Button>
                    </div>
                  )}

                  {showAIGenerator && (
                    <AIDeckGenerator
                      onSave={(deck) => {
                        handleSaveDeck(deck);
                        setShowAIGenerator(false);
                      }}
                      onCancel={() => setShowAIGenerator(false)}
                    />
                  )}

                  {showSingleCardGenerator && (
                    <AISingleCardGenerator
                      onCardGenerated={(card) => {
                        // Add card to active deck
                        const activeDeckData = DeckManager.getActiveDeck();
                        DeckManager.updateDeck(activeDeckData.id, {
                          cards: [...activeDeckData.cards, card],
                          updatedAt: Date.now()
                        });
                        setShowSingleCardGenerator(false);
                        // Switch to collection tab to show the new card
                        setActiveTab('collection');
                      }}
                      onClose={() => setShowSingleCardGenerator(false)}
                    />
                  )}
                </TabsContent>

                {/* Companions Tab */}
                <TabsContent value="companions" className="mt-4 space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {companions.length} companions recruited
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {companions.map(card => (
                      <LoreCardComponent
                        key={card.id}
                        card={card}
                      />
                    ))}
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
