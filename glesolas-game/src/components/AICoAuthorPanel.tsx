import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Wand2, Users, MapPin, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface AICoAuthorPanelProps {
  onSuggestScene: () => Promise<string[]>;
  onSuggestCharacter: () => Promise<string[]>;
  onSuggestTwist: () => Promise<string[]>;
  onSelectSuggestion: (type: 'scene' | 'character' | 'twist', suggestion: string) => void;
  isLoading?: boolean;
}

type SuggestionType = 'scene' | 'character' | 'twist';

export function AICoAuthorPanel({
  onSuggestScene,
  onSuggestCharacter,
  onSuggestTwist,
  onSelectSuggestion,
  isLoading = false,
}: AICoAuthorPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState<SuggestionType | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const suggestionTypes = [
    {
      type: 'scene' as SuggestionType,
      label: 'Scene Ideas',
      icon: MapPin,
      description: 'Get suggestions for what happens next',
      handler: onSuggestScene,
    },
    {
      type: 'character' as SuggestionType,
      label: 'Characters',
      icon: Users,
      description: 'Introduce new characters or NPCs',
      handler: onSuggestCharacter,
    },
    {
      type: 'twist' as SuggestionType,
      label: 'Plot Twists',
      icon: Wand2,
      description: 'Add unexpected turns to your story',
      handler: onSuggestTwist,
    },
  ];

  const handleRequestSuggestions = async (
    type: SuggestionType,
    handler: () => Promise<string[]>
  ) => {
    setLoading(true);
    setActiveSuggestion(type);
    try {
      const results = await handler();
      setSuggestions(results);
    } catch (error) {
      console.error('Failed to get suggestions:', error);
      setSuggestions(['Unable to generate suggestions. Please try again.']);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSuggestion = (suggestion: string) => {
    if (activeSuggestion) {
      onSelectSuggestion(activeSuggestion, suggestion);
      setSuggestions([]);
      setActiveSuggestion(null);
    }
  };

  return (
    <Card className="border-accent/30 bg-gradient-to-br from-accent/5 to-background">
      <CardHeader className="pb-3 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <CardTitle className="text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent" />
            <span>AI Co-Author</span>
          </div>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </CardTitle>
      </CardHeader>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <CardContent className="space-y-3">
              {/* Suggestion Type Buttons */}
              <div className="grid grid-cols-1 gap-2">
                {suggestionTypes.map(({ type, label, icon: Icon, description, handler }) => (
                  <Button
                    key={type}
                    variant={activeSuggestion === type ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleRequestSuggestions(type, handler)}
                    disabled={isLoading || loading}
                    className="w-full justify-start h-auto py-3"
                  >
                    <Icon className="w-4 h-4 mr-2 shrink-0" />
                    <div className="flex-1 text-left">
                      <div className="font-semibold text-xs">{label}</div>
                      <div className="text-[10px] opacity-70">{description}</div>
                    </div>
                  </Button>
                ))}
              </div>

              {/* Suggestions Display */}
              <AnimatePresence mode="wait">
                {loading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center py-6"
                  >
                    <Loader2 className="w-6 h-6 animate-spin text-accent" />
                    <span className="ml-2 text-sm text-muted-foreground">
                      Generating suggestions...
                    </span>
                  </motion.div>
                )}

                {!loading && suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-2"
                  >
                    <div className="text-xs text-muted-foreground font-semibold">
                      Choose a suggestion:
                    </div>
                    {suggestions.map((suggestion, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ x: 4 }}
                      >
                        <button
                          onClick={() => handleSelectSuggestion(suggestion)}
                          className="w-full text-left p-3 rounded-lg border border-border hover:border-accent/50 hover:bg-accent/5 transition-all text-sm"
                        >
                          <span className="text-accent font-semibold mr-2">{index + 1}.</span>
                          {suggestion}
                        </button>
                      </motion.div>
                    ))}

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSuggestions([]);
                        setActiveSuggestion(null);
                      }}
                      className="w-full mt-2"
                    >
                      Cancel
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Info */}
              {!loading && suggestions.length === 0 && (
                <div className="text-xs text-muted-foreground text-center py-2">
                  Click a button above to get AI suggestions
                </div>
              )}
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
