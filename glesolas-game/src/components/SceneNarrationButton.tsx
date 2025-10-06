import { useState, useMemo, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { NarratorManager } from '../lib/narratorManager';

interface SceneNarrationButtonProps {
  text: string;
  className?: string;
}

export function SceneNarrationButton({ text, className = '' }: SceneNarrationButtonProps) {
  const [isReady, setIsReady] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const narratorVoice = NarratorManager.getActiveNarrator().voice;

  // Generate audio URL
  const audioUrl = useMemo(() => {
    return `https://text.pollinations.ai/${encodeURIComponent(text)}?model=openai-audio&voice=${narratorVoice}`;
  }, [text, narratorVoice]);

  const handleCanPlay = () => {
    setIsReady(true);
    console.log('🔊 Audio ready for playback');
  };

  const handleError = () => {
    console.warn('Audio load error, showing player anyway');
    setIsReady(true); // Still show player so user can try
  };

  return (
    <div className={`w-full ${className}`}>
      {!isReady && (
        <div className="flex items-center justify-center gap-2 h-10 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Loading audio...</span>
        </div>
      )}
      <audio
        ref={audioRef}
        controls
        preload="auto"
        onCanPlay={handleCanPlay}
        onLoadedData={handleCanPlay}
        onError={handleError}
        className={`w-full h-10 rounded-md transition-opacity ${isReady ? 'opacity-100' : 'opacity-0 absolute'}`}
        style={{
          filter: 'hue-rotate(0deg) saturate(1.2)',
        }}
      >
        <source src={audioUrl} type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
    </div>
  );
}
