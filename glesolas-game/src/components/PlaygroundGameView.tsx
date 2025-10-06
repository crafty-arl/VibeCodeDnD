import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Separator } from './ui/separator';
import { CustomPromptInput } from './CustomPromptInput';
import { StoryControls } from './StoryControls';
import { AICoAuthorPanel } from './AICoAuthorPanel';
import { ExpandableNarrative } from './ExpandableNarrative';
import { CardCarousel } from './CardCarousel';
import type { LoreCard } from '../types/game';
import type { PlaygroundScene, NarrativePrompt, StoryMemory } from '../types/playground';
import { X } from 'lucide-react';

interface PlaygroundGameViewProps {
  scenes: PlaygroundScene[];
  currentNarrative: string;
  availableCards: LoreCard[];
  selectedCards: LoreCard[];
  storyMemory: StoryMemory;
  isLoading: boolean;
  onPlayerAction: (prompt: NarrativePrompt) => void;
  onCardSelect: (card: LoreCard) => void;
  onPlotTwist: () => void;
  onToneChange: () => void;
  onAskAI: () => void;
  onSaveStory: () => void;
  onViewMemory: () => void;
  onSuggestScene: () => Promise<string[]>;
  onSuggestCharacter: () => Promise<string[]>;
  onSuggestTwist: () => Promise<string[]>;
  onSelectSuggestion: (type: 'scene' | 'character' | 'twist', suggestion: string) => void;
  onEndStory: () => void;
}

export function PlaygroundGameView({
  scenes,
  currentNarrative: _currentNarrative,
  availableCards,
  selectedCards,
  storyMemory,
  isLoading,
  onPlayerAction,
  onCardSelect,
  onPlotTwist,
  onToneChange,
  onAskAI,
  onSaveStory,
  onViewMemory,
  onSuggestScene,
  onSuggestCharacter,
  onSuggestTwist,
  onSelectSuggestion,
  onEndStory,
}: PlaygroundGameViewProps) {
  const [showMemory, setShowMemory] = useState(false);

  const handleViewMemory = () => {
    setShowMemory(true);
    onViewMemory();
  };

  return (
    <div className="h-full flex flex-col gap-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gradient-solar">
            {storyMemory.genre ? `${storyMemory.genre} Story` : 'Your Story'}
          </h2>
          <p className="text-sm text-muted-foreground">
            Scene {scenes.length} • {storyMemory.currentTone}
          </p>
        </div>
        <Button variant="destructive" size="sm" onClick={onEndStory}>
          End Story
        </Button>
      </div>

      {/* Main Content Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0">
        {/* Left Column - Story Content */}
        <div className="lg:col-span-2 flex flex-col gap-4 min-h-0">
          {/* Story Scenes */}
          <Card className="flex-1 min-h-0">
            <ScrollArea className="h-full p-4">
              <div className="space-y-6">
                {scenes.map((scene, index) => (
                  <motion.div
                    key={scene.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="space-y-2">
                      {/* Scene Number */}
                      <div className="text-xs text-muted-foreground font-semibold">
                        Scene {index + 1}
                      </div>

                      {/* Player Action (if any) */}
                      {scene.playerAction && (
                        <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
                          <div className="text-xs text-primary font-semibold mb-1">
                            You:
                          </div>
                          <div className="text-sm">{scene.playerAction}</div>
                        </div>
                      )}

                      {/* AI Narrative */}
                      <ExpandableNarrative
                        text={scene.narrative}
                        maxLength={200}
                        variant="story"
                      />

                      {/* Cards Used */}
                      {scene.cardsUsed.length > 0 && (
                        <div className="flex gap-2 flex-wrap">
                          {scene.cardsUsed.map(cardId => {
                            const card = availableCards.find(c => c.id === cardId);
                            return card ? (
                              <span
                                key={cardId}
                                className="text-xs px-2 py-1 rounded-full bg-accent/20 border border-accent/50"
                              >
                                {card.name}
                              </span>
                            ) : null;
                          })}
                        </div>
                      )}
                    </div>

                    {index < scenes.length - 1 && (
                      <Separator className="my-6" />
                    )}
                  </motion.div>
                ))}

                {/* Current Narrative (Loading State) */}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-lg bg-accent/5 border border-accent/30"
                  >
                    <div className="flex items-center gap-2 text-accent">
                      <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                      <div className="w-2 h-2 rounded-full bg-accent animate-pulse delay-100" />
                      <div className="w-2 h-2 rounded-full bg-accent animate-pulse delay-200" />
                      <span className="text-sm ml-2">AI is crafting the story...</span>
                    </div>
                  </motion.div>
                )}
              </div>
            </ScrollArea>
          </Card>

          {/* Player Input */}
          <CustomPromptInput
            onSubmit={onPlayerAction}
            availableCards={availableCards}
            isLoading={isLoading}
            placeholder="What do you do?"
          />

          {/* Selected Cards Display */}
          {selectedCards.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="text-sm font-semibold mb-2">Cards in Play:</div>
                <CardCarousel
                  cards={selectedCards}
                  selectedCards={selectedCards}
                  onCardSelect={onCardSelect}
                  compact
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Controls & AI Tools */}
        <div className="flex flex-col gap-4">
          <StoryControls
            onPlotTwist={onPlotTwist}
            onToneChange={onToneChange}
            onAskAI={onAskAI}
            onSaveStory={onSaveStory}
            onViewMemory={handleViewMemory}
            isLoading={isLoading}
            sceneCount={scenes.length}
            canRewind={scenes.length > 1}
          />

          <AICoAuthorPanel
            onSuggestScene={onSuggestScene}
            onSuggestCharacter={onSuggestCharacter}
            onSuggestTwist={onSuggestTwist}
            onSelectSuggestion={onSelectSuggestion}
            isLoading={isLoading}
          />

          {/* Story Info */}
          <Card className="bg-secondary/5 border-secondary/30">
            <CardContent className="p-4 space-y-2">
              <div className="text-xs font-semibold text-secondary">Story Details</div>
              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Genre:</span>
                  <span className="font-medium">{storyMemory.genre}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tone:</span>
                  <span className="font-medium">{storyMemory.currentTone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Events:</span>
                  <span className="font-medium">{storyMemory.keyEvents.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Characters:</span>
                  <span className="font-medium">
                    {Object.keys(storyMemory.characters).length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Memory Modal */}
      <AnimatePresence>
        {showMemory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowMemory(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="max-w-2xl w-full"
            >
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold">Story Memory</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowMemory(false)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <ScrollArea className="max-h-[60vh]">
                    <div className="space-y-4">
                      {/* Summary */}
                      <div>
                        <div className="text-sm font-semibold mb-2">Summary</div>
                        <div className="text-sm text-muted-foreground">
                          {storyMemory.narrativeSummary || 'No summary yet...'}
                        </div>
                      </div>

                      {/* Key Events */}
                      {storyMemory.keyEvents.length > 0 && (
                        <div>
                          <div className="text-sm font-semibold mb-2">Key Events</div>
                          <ul className="space-y-1 text-sm text-muted-foreground">
                            {storyMemory.keyEvents.map((event, i) => (
                              <li key={i}>• {event}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Characters */}
                      {Object.keys(storyMemory.characters).length > 0 && (
                        <div>
                          <div className="text-sm font-semibold mb-2">Characters</div>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            {Object.entries(storyMemory.characters).map(([name, desc]) => (
                              <div key={name}>
                                <span className="font-medium">{name}:</span> {desc}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Themes */}
                      {storyMemory.themes.length > 0 && (
                        <div>
                          <div className="text-sm font-semibold mb-2">Themes</div>
                          <div className="flex gap-2 flex-wrap">
                            {storyMemory.themes.map((theme, i) => (
                              <span
                                key={i}
                                className="text-xs px-2 py-1 rounded-full bg-primary/20 border border-primary/50"
                              >
                                {theme}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
