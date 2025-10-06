import { motion } from 'framer-motion';
import { Lightbulb, Theater, HelpCircle, FastForward, Rewind, Save, BookOpen } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';

interface StoryControlsProps {
  onPlotTwist: () => void;
  onToneChange: () => void;
  onAskAI: () => void;
  onSkipAhead?: () => void;
  onRewind?: () => void;
  onSaveStory: () => void;
  onViewMemory: () => void;
  isLoading?: boolean;
  canRewind?: boolean;
  sceneCount?: number;
}

export function StoryControls({
  onPlotTwist,
  onToneChange,
  onAskAI,
  onSkipAhead,
  onRewind,
  onSaveStory,
  onViewMemory,
  isLoading = false,
  canRewind = false,
  sceneCount = 0,
}: StoryControlsProps) {
  const controls = [
    {
      icon: Lightbulb,
      label: 'Plot Twist',
      description: 'Add an unexpected turn to the story',
      onClick: onPlotTwist,
      variant: 'default' as const,
      show: true,
    },
    {
      icon: Theater,
      label: 'Change Tone',
      description: 'Shift the story\'s mood or atmosphere',
      onClick: onToneChange,
      variant: 'secondary' as const,
      show: true,
    },
    {
      icon: HelpCircle,
      label: 'Ask AI',
      description: 'Get suggestions or ask questions',
      onClick: onAskAI,
      variant: 'outline' as const,
      show: true,
    },
    {
      icon: FastForward,
      label: 'Skip Ahead',
      description: 'Move forward in time',
      onClick: onSkipAhead,
      variant: 'ghost' as const,
      show: !!onSkipAhead,
    },
    {
      icon: Rewind,
      label: 'Rewind',
      description: 'Go back to a previous scene',
      onClick: onRewind,
      variant: 'ghost' as const,
      show: !!onRewind && canRewind,
      disabled: !canRewind,
    },
  ];

  return (
    <Card className="border-secondary/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center justify-between">
          <span>🌀 Story Controls</span>
          <span className="text-xs text-muted-foreground font-normal">
            Scene {sceneCount}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Primary Controls */}
        <TooltipProvider>
          <div className="grid grid-cols-2 gap-2">
            {controls
              .filter(control => control.show)
              .map(control => (
                <Tooltip key={control.label}>
                  <TooltipTrigger asChild>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        variant={control.variant}
                        size="sm"
                        onClick={control.onClick}
                        disabled={isLoading || control.disabled}
                        className="w-full h-auto py-3 flex flex-col gap-1"
                      >
                        <control.icon className="w-4 h-4" />
                        <span className="text-xs">{control.label}</span>
                      </Button>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">{control.description}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
          </div>
        </TooltipProvider>

        {/* Story Management */}
        <div className="pt-2 border-t border-border space-y-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onViewMemory}
            className="w-full"
            disabled={isLoading}
          >
            <BookOpen className="w-4 h-4 mr-2" />
            View Story Memory
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onSaveStory}
            className="w-full"
            disabled={isLoading || sceneCount === 0}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Story
          </Button>
        </div>

        {/* Info */}
        <div className="text-xs text-muted-foreground text-center pt-2">
          Use these tools to guide your story's direction
        </div>
      </CardContent>
    </Card>
  );
}
