/**
 * Audio Service for Text-to-Speech using Pollinations AI
 * Generates audio narration for game narratives
 */

export type VoiceType = 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';

const POLLINATIONS_TTS_URL = 'https://text.pollinations.ai';

interface AudioSettings {
  enabled: boolean;
  voice: VoiceType;
  autoPlay: boolean;
}

const AUDIO_SETTINGS_KEY = 'glesolas_audio_settings';

// Default settings
const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  enabled: true,
  voice: 'nova',
  autoPlay: true,
};

/**
 * Get current audio settings from localStorage
 */
export function getAudioSettings(): AudioSettings {
  const stored = localStorage.getItem(AUDIO_SETTINGS_KEY);
  if (!stored) return DEFAULT_AUDIO_SETTINGS;
  try {
    return { ...DEFAULT_AUDIO_SETTINGS, ...JSON.parse(stored) };
  } catch {
    return DEFAULT_AUDIO_SETTINGS;
  }
}

/**
 * Save audio settings to localStorage
 */
export function saveAudioSettings(settings: Partial<AudioSettings>): void {
  const current = getAudioSettings();
  const updated = { ...current, ...settings };
  localStorage.setItem(AUDIO_SETTINGS_KEY, JSON.stringify(updated));
}

/**
 * Generate audio URL for text using Pollinations AI
 * @param text - The text to convert to speech
 * @param voice - The voice to use (default from settings)
 * @returns URL to the generated audio file
 */
export function generateAudioUrl(text: string, voice?: VoiceType): string {
  const settings = getAudioSettings();
  const selectedVoice = voice || settings.voice;

  // URL encode the text
  const encodedText = encodeURIComponent(text);

  // Construct Pollinations AI TTS URL
  return `${POLLINATIONS_TTS_URL}/${encodedText}?model=openai-audio&voice=${selectedVoice}`;
}

/**
 * Play audio narration for text
 * @param text - The text to narrate
 * @param voice - Optional voice override
 * @returns Audio element (null if audio disabled)
 */
export function playNarration(text: string, voice?: VoiceType): HTMLAudioElement | null {
  const settings = getAudioSettings();

  // Check if audio is enabled
  if (!settings.enabled) {
    return null;
  }

  // Generate audio URL
  const audioUrl = generateAudioUrl(text, voice);

  // Create and play audio element
  const audio = new Audio(audioUrl);

  if (settings.autoPlay) {
    audio.play().catch(err => {
      console.warn('Audio autoplay failed (user interaction may be required):', err);
    });
  }

  return audio;
}

/**
 * Preload and play audio narration with loading promise
 * @param text - The text to narrate
 * @param voice - Optional voice override
 * @returns Promise that resolves when audio is ready to play (or null if disabled)
 */
export async function preloadAndPlayNarration(
  text: string,
  voice?: VoiceType
): Promise<HTMLAudioElement | null> {
  const settings = getAudioSettings();

  // Check if audio is enabled
  if (!settings.enabled) {
    return null;
  }

  // Generate audio URL
  const audioUrl = generateAudioUrl(text, voice);

  // Create audio element
  const audio = new Audio(audioUrl);

  // Wait for audio to be loaded and ready
  await new Promise<void>((resolve) => {
    audio.addEventListener('canplaythrough', () => resolve(), { once: true });
    audio.addEventListener('error', () => {
      console.warn('Audio loading failed, continuing without audio');
      resolve(); // Resolve anyway so UI isn't blocked
    }, { once: true });

    // Timeout after 5 seconds
    setTimeout(() => {
      console.warn('Audio loading timeout, continuing without audio');
      resolve();
    }, 5000);
  });

  // Play if autoplay is enabled
  if (settings.autoPlay) {
    audio.play().catch(err => {
      console.warn('Audio autoplay failed (user interaction may be required):', err);
    });
  }

  return audio;
}

/**
 * Preload audio for text (useful for faster playback)
 * @param text - The text to preload audio for
 * @param voice - Optional voice override
 */
export function preloadAudio(text: string, voice?: VoiceType): void {
  const settings = getAudioSettings();
  if (!settings.enabled) return;

  const audioUrl = generateAudioUrl(text, voice);
  const audio = new Audio();
  audio.preload = 'auto';
  audio.src = audioUrl;
}

/**
 * Voice descriptions for UI
 */
export const VOICE_DESCRIPTIONS: Record<VoiceType, string> = {
  alloy: 'Balanced, neutral voice - Great for general narration',
  echo: 'Warm, conversational voice - Friendly and approachable',
  fable: 'Expressive, storytelling voice - Perfect for dramatic scenes',
  onyx: 'Deep, authoritative voice - Commanding presence',
  nova: 'Clear, energetic voice - Dynamic and engaging',
  shimmer: 'Soft, gentle voice - Calm and soothing',
};
