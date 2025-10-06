import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Wand2, BookOpen, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import type { PlaygroundStartMode, ThemeOption } from '../types/playground';

interface PlaygroundModeProps {
  onStartMode: (mode: PlaygroundStartMode, theme?: ThemeOption) => void;
  onBack: () => void;
}

export function PlaygroundMode({ onStartMode, onBack }: PlaygroundModeProps) {
  const [selectedTheme, setSelectedTheme] = useState<ThemeOption | null>(null);

  const themes: { value: ThemeOption; label: string; emoji: string; description: string }[] = [
    { value: 'mystery', label: 'Mystery', emoji: '🔍', description: 'Uncover secrets and solve puzzles' },
    { value: 'action', label: 'Action', emoji: '⚔️', description: 'High-stakes combat and adventure' },
    { value: 'comedy', label: 'Comedy', emoji: '😄', description: 'Lighthearted and humorous tales' },
    { value: 'horror', label: 'Horror', emoji: '👻', description: 'Dark and terrifying encounters' },
    { value: 'romance', label: 'Romance', emoji: '💕', description: 'Stories of love and connection' },
    { value: 'epic', label: 'Epic', emoji: '🏰', description: 'Grand quests and legendary heroes' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1 text-center">
          <motion.h2
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-4xl md:text-5xl font-bold text-gradient-solar"
          >
            🎨 PLAYGROUND MODE
          </motion.h2>
          <p className="text-muted-foreground mt-2">Create your own story adventure</p>
        </div>
        <div className="w-20" /> {/* Spacer for centering */}
      </div>

      {/* Start Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Quick Start */}
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Card
            className="border-2 border-primary/50 bg-gradient-to-br from-primary/10 via-background to-background hover:border-primary hover:shadow-xl hover:shadow-primary/20 transition-all cursor-pointer h-full"
            onClick={() => onStartMode('quick')}
          >
            <CardContent className="p-6 flex flex-col items-center justify-center space-y-4 h-full min-h-[240px]">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold">⚡ Quick Start</h3>
                <p className="text-sm text-muted-foreground">
                  AI generates opening scene with random cards
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Custom Start */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Card
            className="border-2 border-accent/50 bg-gradient-to-br from-accent/10 via-background to-background hover:border-accent hover:shadow-xl hover:shadow-accent/20 transition-all cursor-pointer h-full"
            onClick={() => onStartMode('custom')}
          >
            <CardContent className="p-6 flex flex-col items-center justify-center space-y-4 h-full min-h-[240px]">
              <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center">
                <Wand2 className="w-8 h-8 text-accent" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold">✍️ Custom Start</h3>
                <p className="text-sm text-muted-foreground">
                  Describe your own opening scene and choose cards
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Theme Starter */}
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Card
            className="border-2 border-secondary/50 bg-gradient-to-br from-secondary/10 via-background to-background hover:border-secondary hover:shadow-xl hover:shadow-secondary/20 transition-all cursor-pointer h-full"
            onClick={() => {
              // Show theme selector
              const card = document.getElementById('theme-selector');
              card?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <CardContent className="p-6 flex flex-col items-center justify-center space-y-4 h-full min-h-[240px]">
              <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-secondary" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold">🎲 Theme Starter</h3>
                <p className="text-sm text-muted-foreground">
                  Pick a genre and let AI build the world
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Theme Selector */}
      <motion.div
        id="theme-selector"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="border-secondary/50">
          <CardHeader>
            <CardTitle className="text-center">Choose Your Theme</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {themes.map(theme => (
                <motion.div
                  key={theme.value}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedTheme === theme.value
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-secondary/50 hover:bg-secondary/5'
                    }`}
                    onClick={() => setSelectedTheme(theme.value)}
                  >
                    <div className="text-center space-y-1">
                      <div className="text-3xl mb-2">{theme.emoji}</div>
                      <h4 className="font-semibold">{theme.label}</h4>
                      <p className="text-xs text-muted-foreground">{theme.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {selectedTheme && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="pt-2"
              >
                <Button
                  onClick={() => onStartMode('theme', selectedTheme)}
                  className="w-full"
                  size="lg"
                >
                  Start {themes.find(t => t.value === selectedTheme)?.label} Story
                </Button>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <Card className="bg-primary/5 border-primary/30">
          <CardContent className="p-4">
            <div className="text-sm text-center space-y-2">
              <p className="font-semibold">✨ In Playground Mode:</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Write custom actions and shape your story</li>
                <li>• Cards are narrative tools, not just stats</li>
                <li>• AI adapts to your creative choices</li>
                <li>• Stories naturally conclude when the tale is complete</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
