import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, X } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardContent } from './ui/card';
import type { NarrativePromptType, NarrativePrompt } from '../types/playground';
import type { LoreCard } from '../types/game';
import { CardCarousel } from './CardCarousel';

interface CustomPromptInputProps {
  onSubmit: (prompt: NarrativePrompt) => void;
  availableCards: LoreCard[];
  isLoading?: boolean;
  placeholder?: string;
  showTypeSelector?: boolean;
}

export function CustomPromptInput({
  onSubmit,
  availableCards,
  isLoading = false,
  placeholder = "What do you do?",
  showTypeSelector = true,
}: CustomPromptInputProps) {
  const [promptText, setPromptText] = useState('');
  const [selectedType, setSelectedType] = useState<NarrativePromptType>('character-action');
  const [selectedCards, setSelectedCards] = useState<LoreCard[]>([]);
  const [showCardSelector, setShowCardSelector] = useState(false);

  const promptTypes: { value: NarrativePromptType; label: string; icon: string }[] = [
    { value: 'character-action', label: 'Action', icon: '⚔️' },
    { value: 'scene', label: 'Scene', icon: '🎬' },
    { value: 'plot-twist', label: 'Plot Twist', icon: '🌀' },
    { value: 'tone-shift', label: 'Tone', icon: '🎭' },
    { value: 'question', label: 'Ask AI', icon: '❓' },
  ];

  const handleSubmit = () => {
    if (promptText.trim()) {
      onSubmit({
        type: selectedType,
        prompt: promptText.trim(),
        cards: selectedCards.length > 0 ? selectedCards : undefined,
      });
      setPromptText('');
      setSelectedCards([]);
      setShowCardSelector(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit();
    }
  };

  const toggleCardSelection = (card: LoreCard) => {
    setSelectedCards(prev =>
      prev.some(c => c.id === card.id)
        ? prev.filter(c => c.id !== card.id)
        : [...prev, card]
    );
  };

  return (
    <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-background">
      <CardContent className="p-4 space-y-3">
        {/* Prompt Type Selector */}
        {showTypeSelector && (
          <div className="flex gap-2 flex-wrap">
            {promptTypes.map(type => (
              <Button
                key={type.value}
                variant={selectedType === type.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedType(type.value)}
                className="text-xs"
              >
                <span className="mr-1">{type.icon}</span>
                {type.label}
              </Button>
            ))}
          </div>
        )}

        {/* Text Input */}
        <div className="relative">
          <Textarea
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={placeholder}
            className="min-h-[100px] resize-none"
            disabled={isLoading}
          />
          <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
            Ctrl+Enter to send
          </div>
        </div>

        {/* Selected Cards Display */}
        <AnimatePresence>
          {selectedCards.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex gap-2 flex-wrap"
            >
              {selectedCards.map(card => (
                <motion.div
                  key={card.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/20 text-xs border border-primary/50"
                >
                  <span>{card.name}</span>
                  <button
                    onClick={() => toggleCardSelection(card)}
                    className="hover:text-destructive transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCardSelector(!showCardSelector)}
            className="flex-1"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {showCardSelector ? 'Hide Cards' : 'Use Cards'}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!promptText.trim() || isLoading}
            className="flex-1"
            size="sm"
          >
            <Send className="w-4 h-4 mr-2" />
            {isLoading ? 'Generating...' : 'Submit'}
          </Button>
        </div>

        {/* Card Selector */}
        <AnimatePresence>
          {showCardSelector && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <CardCarousel
                cards={availableCards}
                selectedCards={selectedCards}
                onCardSelect={toggleCardSelection}
                compact
              />
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
