/**
 * Audio Service for Text-to-Speech using ElevenLabs
 * Generates audio narration for game narratives
 */

// ElevenLabs voice IDs
export type VoiceType = 'adam' | 'antoni' | 'arnold' | 'callum' | 'george' | 'aria' | 'bella' | 'charlotte' | 'domi' | 'rachel';

const ELEVENLABS_VOICE_IDS: Record<VoiceType, string> = {
  adam: 'pNInz6obpgDQGcFmaJgB',      // Deep, narrative
  antoni: 'ErXwobaYiN019PkySvjV',    // Calm, mature
  arnold: 'VR6AewLTigWG4xSOukaG',    // Strong, crisp
  callum: 'N2lVS1w4EtoT3dr4eOWO',    // Hoarse, middle-aged
  george: 'JBFqnCBsd6RMkjVDRZzb',    // Warm, friendly
  aria: '9BWtsMINqrJLrRacOk9x',      // Expressive, news anchor
  bella: 'EXAVITQu4vr4xnSDxMaL',     // Soft, young
  charlotte: 'XB0fDUnXU5powFXDhCwa', // Seductive, smooth
  domi: 'AZnzlk1XvdvUeBnXmlld',      // Strong, confident
  rachel: '21m00Tcm4TlvDq8ikWAM',    // Calm, narrative
};

interface AudioSettings {
  voice: VoiceType;
  enabled: boolean;
}

const AUDIO_SETTINGS_KEY = 'glesolas_audio_settings';

// Default settings - audio is enabled by default
const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  voice: 'george', // Warm, friendly default
  enabled: true,
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
 * Generate audio using ElevenLabs API
 * @param text - The text to convert to speech
 * @param voice - The voice to use (default from settings)
 * @returns Promise that resolves to audio blob
 */
export async function generateAudio(text: string, voice?: VoiceType): Promise<Blob> {
  const settings = getAudioSettings();
  const selectedVoice = voice || settings.voice;
  const voiceId = ELEVENLABS_VOICE_IDS[selectedVoice];

  const response = await fetch('/api/generate-audio', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      voice_id: voiceId,
      model_id: 'eleven_flash_v2_5', // Fast, cost-effective
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.0,
        use_speaker_boost: true
      }
    }),
  });

  if (!response.ok) {
    let errorMessage = 'Audio generation failed';
    try {
      // Clone the response so we can try reading it multiple ways
      const clonedResponse = response.clone();
      const error = await clonedResponse.json();
      errorMessage = error.error || errorMessage;
    } catch {
      // Response might not be JSON, try to read as text
      try {
        const text = await response.text();
        errorMessage = text || `HTTP ${response.status}: ${response.statusText}`;
      } catch {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
    }
    throw new Error(errorMessage);
  }

  return await response.blob();
}

/**
 * Play audio narration for text (manual playback on button press)
 * Audio is always enabled - users control playback via play buttons
 * @param text - The text to narrate
 * @param voice - Optional voice override
 * @returns Promise that resolves to Audio element
 */
export async function playNarration(text: string, voice?: VoiceType): Promise<HTMLAudioElement> {
  // Generate audio blob
  const audioBlob = await generateAudio(text, voice);
  const audioUrl = URL.createObjectURL(audioBlob);

  // Create and play audio element
  const audio = new Audio(audioUrl);

  // Cleanup URL when audio ends
  audio.onended = () => {
    URL.revokeObjectURL(audioUrl);
  };

  // Always play immediately when called (user pressed button)
  await audio.play().catch(err => {
    console.warn('Audio playback failed:', err);
  });

  return audio;
}

/**
 * Create audio element with loading promise (for preloading)
 * @param text - The text to create audio for
 * @param voice - Optional voice override
 * @returns Promise that resolves with audio element and cleanup function
 */
export async function createAudioElement(
  text: string,
  voice?: VoiceType
): Promise<{ audio: HTMLAudioElement; cleanup: () => void }> {
  // Generate audio blob
  const audioBlob = await generateAudio(text, voice);
  const audioUrl = URL.createObjectURL(audioBlob);

  // Create audio element
  const audio = new Audio(audioUrl);

  // Cleanup function
  const cleanup = () => {
    URL.revokeObjectURL(audioUrl);
  };

  // Wait for audio to be loaded and ready
  await new Promise<void>((resolve) => {
    audio.addEventListener('canplaythrough', () => resolve(), { once: true });
    audio.addEventListener('error', () => {
      console.warn('Audio loading failed');
      resolve(); // Resolve anyway so UI isn't blocked
    }, { once: true });

    // Timeout after 10 seconds (ElevenLabs can be slower)
    setTimeout(() => {
      console.warn('Audio loading timeout');
      resolve();
    }, 10000);
  });

  return { audio, cleanup };
}

/**
 * Preload audio for text (useful for faster playback)
 * @param text - The text to preload audio for
 * @param voice - Optional voice override
 * @returns Promise that resolves when preload is complete
 */
export async function preloadAudio(text: string, voice?: VoiceType): Promise<void> {
  try {
    // Generate and cache the audio
    await generateAudio(text, voice);
  } catch (err) {
    console.warn('Audio preload failed:', err);
  }
}

/**
 * Voice descriptions for UI
 */
export const VOICE_DESCRIPTIONS: Record<VoiceType, string> = {
  adam: 'Deep, narrative voice - Perfect for storytelling',
  antoni: 'Calm, mature voice - Thoughtful and composed',
  arnold: 'Strong, crisp voice - Clear and commanding',
  callum: 'Hoarse, middle-aged voice - Weathered and experienced',
  george: 'Warm, friendly voice - Welcoming and approachable (Default)',
  aria: 'Expressive, news anchor voice - Professional and dynamic',
  bella: 'Soft, young voice - Gentle and youthful',
  charlotte: 'Seductive, smooth voice - Elegant and captivating',
  domi: 'Strong, confident voice - Bold and assertive',
  rachel: 'Calm, narrative voice - Soothing and measured',
};
