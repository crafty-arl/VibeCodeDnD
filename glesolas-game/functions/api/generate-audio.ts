/**
 * Cloudflare Pages Function for ElevenLabs Text-to-Speech
 * Endpoint: /api/generate-audio
 *
 * Uses ElevenLabs API for high-quality voice synthesis
 * Docs: https://elevenlabs.io/docs/api-reference/text-to-speech
 */

interface Env {
  ELEVENLABS_API_KEY: string;
}

interface AudioRequest {
  text: string;
  voice_id?: string;
  model_id?: string;
  voice_settings?: {
    stability?: number;
    similarity_boost?: number;
    style?: number;
    use_speaker_boost?: boolean;
  };
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  try {
    const {
      text,
      voice_id = 'JBFqnCBsd6RMkjVDRZzb', // Default: George voice
      model_id = 'eleven_flash_v2_5', // Fastest, cheapest (50% cost)
      voice_settings = {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.0,
        use_speaker_boost: true
      }
    }: AudioRequest = await context.request.json();

    // Validate input
    if (!text || typeof text !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Text is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Character limit check (free tier: 2,500 per request)
    const MAX_CHARS = 2500;
    if (text.length > MAX_CHARS) {
      return new Response(
        JSON.stringify({
          error: `Text exceeds maximum length of ${MAX_CHARS} characters`,
          current_length: text.length
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Check for API key
    const apiKey = context.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      console.error('❌ ELEVENLABS_API_KEY not found in environment');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`🎙️ Generating audio for ${text.length} characters with voice ${voice_id}`);

    // Call ElevenLabs API
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          model_id: model_id,
          voice_settings: voice_settings,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ ElevenLabs API error:', response.status, errorText);

      return new Response(
        JSON.stringify({
          error: 'Audio generation failed',
          status: response.status,
          details: errorText
        }),
        {
          status: response.status,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Get audio buffer
    const audioBuffer = await response.arrayBuffer();

    console.log(`✅ Audio generated successfully (${audioBuffer.byteLength} bytes)`);

    // Return audio file
    return new Response(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });

  } catch (error) {
    console.error('❌ Audio generation failed:', error);

    return new Response(
      JSON.stringify({
        error: 'Audio generation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
