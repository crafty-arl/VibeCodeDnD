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
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-2xl border-t border-border shadow-2xl h-[90vh] flex flex-col"
          >
            {/* Handle Bar */}
            <div className="flex items-center justify-center py-2 shrink-0 cursor-pointer" onClick={onClose}>
              <div className="w-12 h-1 bg-muted-foreground/30 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-border shrink-0">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Library className="w-5 h-5" />
                Deck Management
              </h2>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
              <div className="shrink-0 px-4 pt-2 pb-1 bg-background border-b border-border relative z-10">
                <TabsList className="grid w-full grid-cols-5 h-auto">
                  <TabsTrigger value="collection" className="text-xs py-2 px-1 flex flex-col sm:flex-row items-center gap-1">
                    <Library className="w-4 h-4" />
                    <span className="hidden sm:inline">Collection</span>
                  </TabsTrigger>
                  <TabsTrigger value="active" className="text-xs py-2 px-1 flex flex-col sm:flex-row items-center gap-1">
                    <Sword className="w-4 h-4" />
                    <span className="hidden sm:inline">Active</span>
                  </TabsTrigger>
                  <TabsTrigger value="decks" className="text-xs py-2 px-1 flex flex-col sm:flex-row items-center gap-1">
                    <Layers className="w-4 h-4" />
                    <span className="hidden sm:inline">Decks</span>
                  </TabsTrigger>
                  <TabsTrigger value="create" className="text-xs py-2 px-1 flex flex-col sm:flex-row items-center gap-1">
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Create</span>
                  </TabsTrigger>
                  <TabsTrigger value="companions" className="text-xs py-2 px-1 flex flex-col sm:flex-row items-center gap-1">
                    <Heart className="w-4 h-4" />
                    <span className="hidden sm:inline">Allies</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="flex-1 overflow-y-auto px-4 pb-4 pt-2 min-h-0">
                {/* Collection Tab */}
                <TabsContent value="collection" className="mt-0 space-y-3 h-full">
                  <div className="space-y-2 sticky top-0 bg-background pb-2 z-[5] pt-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        {filteredCards.length} of {allCards.length} cards
                      </p>
                    </div>
                    <Input
                      placeholder="Search cards..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full"
                    />
                  </div>

                  {filteredCards.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Library className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No cards found</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 pb-4">
                      {filteredCards.map(card => (
                        <LoreCardComponent
                          key={card.id}
                          card={card}
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* Active Deck Tab */}
                <TabsContent value="active" className="mt-0 space-y-3 h-full">
                  <Card className="border-primary/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">{activeDeck.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{activeDeck.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {activeDeck.cards.length} cards
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
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
                <TabsContent value="decks" className="mt-0 space-y-3 h-full">
                  {decks.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Layers className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No decks created</p>
                    </div>
                  ) : (
                    decks.map(deck => (
                      <Card key={deck.id} className={deck.id === activeDeck.id ? 'border-primary' : ''}>
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-base truncate">{deck.name}</CardTitle>
                              <p className="text-sm text-muted-foreground line-clamp-2">{deck.description}</p>
                              <p className="text-xs text-muted-foreground mt-1">{deck.cards.length} cards</p>
                            </div>
                            <div className="flex gap-2 shrink-0">
                              {deck.id !== activeDeck.id && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleSelectDeck(deck.id)}
                                  className="whitespace-nowrap"
                                >
                                  Equip
                                </Button>
                              )}
                              {deck.id === activeDeck.id && (
                                <span className="text-xs px-2 py-1 bg-primary/20 rounded whitespace-nowrap">Active</span>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                      </Card>
                    ))
                  )}
                </TabsContent>

                {/* Create Tab */}
                <TabsContent value="create" className="mt-0 space-y-3 h-full">
                  {!showDeckEditor && !showAIGenerator && !showSingleCardGenerator && (
                    <div className="space-y-3 max-w-md mx-auto pt-4">
                      <Button
                        onClick={handleCreateNewDeck}
                        className="w-full"
                        size="lg"
                      >
                        <Plus className="w-5 h-5 mr-2" />
                        Create Custom Deck
                      </Button>
                      <Button
                        onClick={() => setShowAIGenerator(true)}
                        className="w-full"
                        size="lg"
                        variant="outline"
                      >
                        <Library className="w-5 h-5 mr-2" />
                        AI Generate Full Deck
                      </Button>
                      <Button
                        onClick={() => setShowSingleCardGenerator(true)}
                        className="w-full"
                        size="lg"
                        variant="outline"
                      >
                        <Wand2 className="w-5 h-5 mr-2" />
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
                <TabsContent value="companions" className="mt-0 space-y-3 h-full">
                  <div className="sticky top-0 bg-background pb-2 z-[5] pt-2">
                    <p className="text-sm text-muted-foreground">
                      {companions.length} companion{companions.length !== 1 ? 's' : ''} recruited
                    </p>
                  </div>
                  {companions.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Heart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No companions recruited yet</p>
                      <p className="text-xs mt-2">Win encounters with key stats to recruit allies</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 pb-4">
                      {companions.map(card => (
                        <LoreCardComponent
                          key={card.id}
                          card={card}
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>
              </div>
            </Tabs>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
