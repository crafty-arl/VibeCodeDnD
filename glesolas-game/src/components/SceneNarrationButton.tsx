import { useEffect, useMemo } from 'react';
import { NarratorManager } from '../lib/narratorManager';

interface SceneNarrationButtonProps {
  text: string;
  className?: string;
}

export function SceneNarrationButton({ text, className = '' }: SceneNarrationButtonProps) {
  const narratorVoice = NarratorManager.getActiveNarrator().voice;

  // Generate audio URL with cache busting based on text content
  const audioUrl = useMemo(() => {
    return `https://text.pollinations.ai/${encodeURIComponent(text)}?model=openai-audio&voice=${narratorVoice}`;
  }, [text, narratorVoice]);

  return (
    <div className={`w-full ${className}`}>
      <audio
        controls
        preload="metadata"
        className="w-full h-10 rounded-md"
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
