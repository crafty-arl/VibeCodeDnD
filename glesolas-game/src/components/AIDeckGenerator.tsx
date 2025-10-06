import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Loader2, X, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import type { Deck } from '../lib/deckManager';
import type { LoreCard } from '../types/game';
import { generateDeck } from '../lib/aiService';
import { LoreCardComponent } from './LoreCardComponent';

interface AIDeckGeneratorProps {
  onSave: (deck: Deck) => void;
  onCancel: () => void;
}

export function AIDeckGenerator({ onSave, onCancel }: AIDeckGeneratorProps) {
  const [theme, setTheme] = useState('');
  const [cardCount, setCardCount] = useState(35);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDeck, setGeneratedDeck] = useState<{
    name: string;
    description: string;
    cards: LoreCard[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!theme.trim()) {
      setError('Please enter a theme');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const result = await generateDeck(theme, cardCount);

      if (!result) {
        setError('Failed to generate deck. Please try again.');
        setIsGenerating(false);
        return;
      }

      // Convert generated cards to LoreCard format with image URLs
      const cards: LoreCard[] = result.cards.map((card, index) => {
        // Generate image prompt based on card type and theme
        const imagePrompt = `${card.name}, ${theme} theme, ${card.type}, fantasy card game art, detailed illustration, vibrant colors`;
        const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(imagePrompt)}?width=512&height=512&nologo=true`;

        return {
          id: `ai-${Date.now()}-${index}`,
          name: card.name,
          type: card.type === 'character' ? 'Character' : card.type === 'item' ? 'Item' : 'Location',
          flavor: card.flavor,
          rarity: 'Common' as const,
          stats: {
            might: card.might,
            fortune: card.fortune,
            cunning: card.cunning,
          },
          art: imageUrl,
        };
      });

      setGeneratedDeck({
        name: result.deckName,
        description: result.description,
        cards,
      });
    } catch (err) {
      console.error('Generation error:', err);
      setError('An error occurred during generation. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    if (generatedDeck) {
      onSave({
        id: `deck-${Date.now()}`,
        name: generatedDeck.name,
        description: generatedDeck.description,
        cards: generatedDeck.cards,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  };

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
              <Sparkles className="w-5 h-5" />
              <span>AI Deck Generator</span>
            </div>
            <Button onClick={onCancel} variant="ghost" size="sm">
              <X className="w-4 h-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!generatedDeck ? (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Deck Theme</label>
                <Input
                  placeholder="e.g., Space Opera, Cyberpunk, Medieval Fantasy, Wild West..."
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  disabled={isGenerating}
                />
                <p className="text-xs text-muted-foreground">
                  Describe the theme or setting for your deck. The AI will create themed characters, items, and locations.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Number of Cards ({cardCount})</label>
                <input
                  type="range"
                  min="30"
                  max="40"
                  value={cardCount}
                  onChange={(e) => setCardCount(parseInt(e.target.value))}
                  disabled={isGenerating}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Generate between 30-40 cards. More cards = more variety, but slower generation.
                </p>
              </div>

              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/50 rounded-md">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !theme.trim()}
                className="w-full gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating {cardCount} cards...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Deck
                  </>
                )}
              </Button>

              {isGenerating && (
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    AI is crafting your {theme} deck...
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Generating {cardCount} unique cards (characters, items, locations)
                  </p>
                  <p className="text-xs text-muted-foreground opacity-70">
                    This usually takes 30-60 seconds
                  </p>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-green-500">
                  <Check className="w-5 h-5" />
                  <span className="font-semibold">Deck Generated Successfully!</span>
                </div>
                <h3 className="text-lg font-bold">{generatedDeck.name}</h3>
                <p className="text-sm text-muted-foreground">{generatedDeck.description}</p>
                <p className="text-sm">
                  <span className="font-semibold">{generatedDeck.cards.length} cards</span> -{' '}
                  {generatedDeck.cards.filter((c) => c.type === 'Character').length} characters,{' '}
                  {generatedDeck.cards.filter((c) => c.type === 'Item').length} items,{' '}
                  {generatedDeck.cards.filter((c) => c.type === 'Location').length} locations
                </p>
              </div>

              <div className="border rounded-md p-4 max-h-[400px] overflow-y-auto">
                <h4 className="font-semibold mb-3">Preview Cards</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {generatedDeck.cards.slice(0, 12).map((card) => (
                    <LoreCardComponent key={card.id} card={card} />
                  ))}
                </div>
                {generatedDeck.cards.length > 12 && (
                  <p className="text-xs text-muted-foreground text-center mt-3">
                    +{generatedDeck.cards.length - 12} more cards...
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <Button onClick={onCancel} variant="outline" className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleSave} className="flex-1 gap-2">
                  <Check className="w-4 h-4" />
                  Save Deck
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
