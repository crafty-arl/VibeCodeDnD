/**
 * TypeScript types for ElevenLabs API integration
 */

export interface VoiceSettings {
  stability: number;           // 0-1, default: 0.5
  similarity_boost: number;    // 0-1, default: 0.75
  style?: number;              // 0-1, default: 0
  use_speaker_boost?: boolean; // default: true
}

export interface Voice {
  voice_id: string;
  name: string;
  category: string;
  description?: string;
  labels?: Record<string, string>;
  preview_url?: string;
}

export interface TextToSpeechRequest {
  text: string;
  model_id?: string;
  voice_settings?: VoiceSettings;
}

export interface AudioGenerationResponse {
  audio: ArrayBuffer;
  contentType: string;
  size: number;
}

export interface ElevenLabsError {
  error: string;
  status: number;
  details?: string;
}

// Available models
export const ElevenLabsModel = {
  FLASH_V2_5: 'eleven_flash_v2_5',        // Fastest, cheapest (50% cost)
  TURBO_V2_5: 'eleven_turbo_v2_5',        // Balanced quality & speed
  V3: 'eleven_multilingual_v2',           // Highest quality, most emotional
};

// Voice ID mapping
export const ELEVENLABS_VOICES = {
  // Male voices
  ADAM: 'pNInz6obpgDQGcFmaJgB',      // Deep, narrative
  ANTONI: 'ErXwobaYiN019PkySvjV',    // Calm, mature
  ARNOLD: 'VR6AewLTigWG4xSOukaG',    // Strong, crisp
  CALLUM: 'N2lVS1w4EtoT3dr4eOWO',    // Hoarse, middle-aged
  GEORGE: 'JBFqnCBsd6RMkjVDRZzb',    // Warm, friendly (DEFAULT)

  // Female voices
  ARIA: '9BWtsMINqrJLrRacOk9x',      // Expressive, news anchor
  BELLA: 'EXAVITQu4vr4xnSDxMaL',     // Soft, young
  CHARLOTTE: 'XB0fDUnXU5powFXDhCwa', // Seductive, smooth
  DOMI: 'AZnzlk1XvdvUeBnXmlld',      // Strong, confident
  RACHEL: '21m00Tcm4TlvDq8ikWAM',    // Calm, narrative
};
