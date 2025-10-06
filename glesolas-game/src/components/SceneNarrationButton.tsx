import { useState, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { NarratorManager } from '../lib/narratorManager';
import { generateAudio } from '../lib/audioService';
import type { VoiceType } from '../lib/audioService';

interface SceneNarrationButtonProps {
  text: string;
  className?: string;
}

export function SceneNarrationButton({ text, className = '' }: SceneNarrationButtonProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const narratorVoice = NarratorManager.getActiveNarrator().voice as VoiceType;

  // Generate audio when component mounts or text changes
  useEffect(() => {
    let cleanup: (() => void) | null = null;

    const loadAudio = async () => {
      setIsLoading(true);
      setError(null);

      try {
        console.log('🎙️ Generating audio with ElevenLabs...');
        const audioBlob = await generateAudio(text, narratorVoice);
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);

        // Store cleanup function
        cleanup = () => URL.revokeObjectURL(url);

        console.log('✅ Audio ready for playback');
      } catch (err) {
        console.error('❌ Audio generation failed:', err);
        setError(err instanceof Error ? err.message : 'Failed to generate audio');
      } finally {
        setIsLoading(false);
      }
    };

    loadAudio();

    // Cleanup on unmount
    return () => {
      if (cleanup) cleanup();
    };
  }, [text, narratorVoice]);

  const handleCanPlay = () => {
    console.log('🔊 Audio ready for playback');
  };

  const handleError = () => {
    console.warn('Audio playback error');
    setError('Audio playback failed');
  };

  return (
    <div className={`w-full ${className}`}>
      {isLoading && (
        <div className="flex items-center justify-center gap-2 h-10 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Generating audio...</span>
        </div>
      )}

      {error && !isLoading && (
        <div className="flex items-center justify-center h-10 text-sm text-red-500">
          {error}
        </div>
      )}

      {audioUrl && !isLoading && (
        <audio
          ref={audioRef}
          controls
          preload="auto"
          onCanPlay={handleCanPlay}
          onError={handleError}
          className="w-full h-10 rounded-md"
          style={{
            filter: 'hue-rotate(0deg) saturate(1.2)',
          }}
        >
          <source src={audioUrl} type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
      )}
    </div>
  );
}
