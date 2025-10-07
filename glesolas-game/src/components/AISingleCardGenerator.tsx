import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Wand2, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { generateSingleCard, isAIAvailable } from '@/lib/aiService';
import type { GeneratedCard } from '@/lib/schemas/narrativeSchemas';
import type { LoreCard } from '@/types/game';

interface AISingleCardGeneratorProps {
  onCardGenerated: (card: LoreCard) => void;
  onClose: () => void;
}

export function AISingleCardGenerator({ onCardGenerated, onClose }: AISingleCardGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [cardType, setCardType] = useState<'character' | 'item' | 'location' | 'any'>('any');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCard, setGeneratedCard] = useState<LoreCard | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a card description');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedCard(null);

    try {
      const result = await generateSingleCard(
        prompt,
        cardType === 'any' ? undefined : cardType
      );

      if (!result) {
        setError('AI generation failed. Please try again.');
        return;
      }

      // Convert GeneratedCard to LoreCard format
      const loreCard: LoreCard = {
        id: `ai-card-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: result.name,
        type: result.type.charAt(0).toUpperCase() + result.type.slice(1) as 'Character' | 'Item' | 'Location',
        flavor: result.flavor,
        stats: {
          might: result.might,
          fortune: result.fortune,
          cunning: result.cunning,
        },
        rarity: 'Common', // Default rarity
      };

      setGeneratedCard(loreCard);
      console.log('✨ Generated card:', loreCard);
    } catch (err) {
      console.error('Card generation error:', err);
      setError('Failed to generate card. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddCard = () => {
    if (generatedCard) {
      onCardGenerated(generatedCard);
      // Reset for next generation
      setPrompt('');
      setGeneratedCard(null);
    }
  };

  const handleRegenerate = () => {
    setGeneratedCard(null);
    handleGenerate();
  };

  if (!isAIAvailable()) {
    return (
      <Card className="w-full max-w-2xl mx-auto border-2 border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            AI Not Available
          </CardTitle>
          <CardDescription>
            AI card generation requires an API key. Please configure your environment variables.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <Card className="border-2 border-primary/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            AI Card Generator
          </CardTitle>
          <CardDescription>
            Describe any card you want and AI will create it for you!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Prompt Input */}
          <div className="space-y-2">
            <Label htmlFor="card-prompt">Card Description</Label>
            <Input
              id="card-prompt"
              placeholder="e.g., 'a sarcastic robot wizard who rolls nat 1s'"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isGenerating}
              className="text-base"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isGenerating) {
                  handleGenerate();
                }
              }}
            />
          </div>

          {/* Card Type Selection */}
          <div className="space-y-2">
            <Label>Card Type (Optional)</Label>
            <div className="flex gap-2">
              {(['any', 'character', 'item', 'location'] as const).map((type) => (
                <Button
                  key={type}
                  variant={cardType === type ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCardType(type)}
                  disabled={isGenerating}
                  className="flex-1 capitalize"
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/50 rounded-lg text-destructive text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="mr-2"
                >
                  <Sparkles className="h-5 w-5" />
                </motion.div>
                Generating Card...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 mr-2" />
                Generate Card
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Card Preview */}
      {generatedCard && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-2 border-green-500/50 bg-green-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <Sparkles className="h-5 w-5" />
                Generated Card
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Card Details */}
              <div className="bg-background p-4 rounded-lg border">
                <div className="space-y-2">
                  <div>
                    <span className="text-xs text-muted-foreground uppercase tracking-wide">
                      {generatedCard.type}
                    </span>
                    <h3 className="text-xl font-bold">{generatedCard.name}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground italic">
                    "{generatedCard.flavor}"
                  </p>
                  <div className="flex gap-4 pt-2 border-t">
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground">Might</div>
                      <div className="text-lg font-bold">{generatedCard.stats.might}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground">Fortune</div>
                      <div className="text-lg font-bold">{generatedCard.stats.fortune}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground">Cunning</div>
                      <div className="text-lg font-bold">{generatedCard.stats.cunning}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  onClick={handleAddCard}
                  className="flex-1"
                  size="lg"
                >
                  Add to Collection
                </Button>
                <Button
                  onClick={handleRegenerate}
                  variant="outline"
                  disabled={isGenerating}
                >
                  Regenerate
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Close Button */}
      <Button
        onClick={onClose}
        variant="outline"
        className="w-full"
      >
        Close
      </Button>
    </div>
  );
}
