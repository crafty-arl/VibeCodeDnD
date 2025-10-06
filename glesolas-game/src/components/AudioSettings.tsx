import { useState } from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX, Play, X } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { getAudioSettings, saveAudioSettings, type VoiceType, VOICE_DESCRIPTIONS, playNarration } from '../lib/audioService';

interface AudioSettingsProps {
  onClose: () => void;
}

export function AudioSettings({ onClose }: AudioSettingsProps) {
  const [settings, setSettings] = useState(getAudioSettings());
  const [testingVoice, setTestingVoice] = useState<VoiceType | null>(null);

  const handleToggleEnabled = () => {
    const newEnabled = !settings.enabled;
    setSettings(prev => ({ ...prev, enabled: newEnabled }));
    saveAudioSettings({ enabled: newEnabled });
  };

  const handleToggleAutoPlay = () => {
    const newAutoPlay = !settings.autoPlay;
    setSettings(prev => ({ ...prev, autoPlay: newAutoPlay }));
    saveAudioSettings({ autoPlay: newAutoPlay });
  };

  const handleVoiceChange = (voice: VoiceType) => {
    setSettings(prev => ({ ...prev, voice }));
    saveAudioSettings({ voice });
  };

  const handleTestVoice = (voice: VoiceType) => {
    setTestingVoice(voice);
    const testText = `Hello adventurer! I am the ${voice} voice, ready to narrate your GLESOLAS journey!`;
    playNarration(testText, voice);

    // Reset testing state after a delay
    setTimeout(() => setTestingVoice(null), 2000);
  };

  const voices: VoiceType[] = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];

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
              <Volume2 className="w-5 h-5" />
              <span>Audio Settings</span>
            </div>
            <Button onClick={onClose} variant="ghost" size="sm">
              <X className="w-4 h-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable/Disable Audio */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              {settings.enabled ? (
                <Volume2 className="w-5 h-5 text-primary" />
              ) : (
                <VolumeX className="w-5 h-5 text-muted-foreground" />
              )}
              <div>
                <p className="font-semibold">Voice Narration</p>
                <p className="text-sm text-muted-foreground">
                  {settings.enabled ? 'Enabled' : 'Disabled'}
                </p>
              </div>
            </div>
            <Button
              onClick={handleToggleEnabled}
              variant={settings.enabled ? 'default' : 'outline'}
            >
              {settings.enabled ? 'Disable' : 'Enable'}
            </Button>
          </div>

          {/* Auto-play Toggle */}
          {settings.enabled && (
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-semibold">Auto-play Narration</p>
                <p className="text-sm text-muted-foreground">
                  Automatically play audio for new scenes
                </p>
              </div>
              <Button
                onClick={handleToggleAutoPlay}
                variant={settings.autoPlay ? 'default' : 'outline'}
                size="sm"
              >
                {settings.autoPlay ? 'On' : 'Off'}
              </Button>
            </div>
          )}

          {/* Voice Selection */}
          {settings.enabled && (
            <div className="space-y-3">
              <h3 className="font-semibold">Select Voice</h3>
              <div className="grid gap-3">
                {voices.map((voice) => (
                  <div
                    key={voice}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      settings.voice === voice
                        ? 'border-primary bg-primary/10'
                        : 'border-muted hover:border-primary/50'
                    }`}
                    onClick={() => handleVoiceChange(voice)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-semibold capitalize">{voice}</p>
                        <p className="text-sm text-muted-foreground">
                          {VOICE_DESCRIPTIONS[voice]}
                        </p>
                      </div>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTestVoice(voice);
                        }}
                        variant="ghost"
                        size="sm"
                        className="ml-2"
                        disabled={testingVoice === voice}
                      >
                        <Play className="w-4 h-4" />
                      </Button>
                    </div>
                    {settings.voice === voice && (
                      <div className="mt-2 text-xs text-primary font-semibold">
                        ✓ Currently Selected
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Info */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Voice narration is powered by Pollinations AI. Audio will play automatically
              for intro scenes, challenges, and resolutions when enabled.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
