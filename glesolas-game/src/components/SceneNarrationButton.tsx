import { useState, useEffect } from 'react';
import { Play, Pause, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { NarratorManager } from '../lib/narratorManager';

interface SceneNarrationButtonProps {
  text: string;
  className?: string;
}

export function SceneNarrationButton({ text, className = '' }: SceneNarrationButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Start in loading state
  const [isReady, setIsReady] = useState(false); // Track if audio is ready
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

  // Pre-generate audio on mount
  useEffect(() => {
    const narratorVoice = NarratorManager.getActiveNarrator().voice;
    const audioUrl = `https://text.pollinations.ai/${encodeURIComponent(text)}?model=openai-audio&voice=${narratorVoice}`;

    // Create audio element and preload
    const audio = new Audio();
    audio.crossOrigin = 'anonymous'; // Handle CORS
    audio.preload = 'auto';
    audio.src = audioUrl;

    const handleCanPlay = () => {
      setIsReady(true);
      setIsLoading(false);
      setCurrentAudio(audio);
      console.log('🔊 Audio ready for playback');
    };

    const handleError = (e: ErrorEvent | Event) => {
      console.warn('Audio preload failed:', e);
      setIsLoading(false);
      setIsReady(true); // Still show button, will try to play on click
      setCurrentAudio(audio);
    };

    // Listen for when audio is ready
    audio.addEventListener('canplaythrough', handleCanPlay);
    audio.addEventListener('error', handleError);
    audio.addEventListener('loadeddata', handleCanPlay); // Additional fallback

    // Timeout fallback after 10 seconds
    const timeout = setTimeout(() => {
      if (!isReady) {
        console.warn('Audio preload timeout, showing button anyway');
        setIsLoading(false);
        setIsReady(true);
        setCurrentAudio(audio);
      }
    }, 10000);

    // Trigger load
    audio.load();

    return () => {
      audio.removeEventListener('canplaythrough', handleCanPlay);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('loadeddata', handleCanPlay);
      clearTimeout(timeout);
      audio.pause();
      audio.src = '';
    };
  }, [text]);

  const handlePlayPause = () => {
    if (!currentAudio || !isReady) return;

    // If currently playing, pause
    if (isPlaying) {
      currentAudio.pause();
      setIsPlaying(false);
      return;
    }

    // Play or resume audio
    currentAudio.play().catch(err => {
      console.warn('Audio playback failed:', err);
      setIsPlaying(false);
    });
    setIsPlaying(true);

    // Listen for audio ending (only add once)
    if (!currentAudio.onended) {
      currentAudio.onended = () => {
        setIsPlaying(false);
      };
    }
  };

  // Don't show button until audio is ready
  if (isLoading || !isReady) {
    return (
      <Button
        variant="outline"
        size="sm"
        className={`gap-2 ${className}`}
        disabled
      >
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Preparing Audio...</span>
      </Button>
    );
  }

  return (
    <Button
      onClick={handlePlayPause}
      variant="outline"
      size="sm"
      className={`gap-2 ${className}`}
    >
      {isPlaying ? (
        <>
          <Pause className="w-4 h-4" />
          <span>Pause</span>
        </>
      ) : (
        <>
          <Play className="w-4 h-4" />
          <span>Play Narration</span>
        </>
      )}
    </Button>
  );
}
