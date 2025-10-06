/**
 * Cloudflare Pages Function for Craiyon Image Generation
 * Endpoint: /api/generate-image
 */

import { Client } from 'craiyon';

export async function onRequestPost(context: any) {
  try {
    const { prompt } = await context.request.json();

    if (!prompt || typeof prompt !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('🎨 Generating image with Craiyon:', prompt);

    // Initialize Craiyon client
    const craiyon = new Client();

    // Generate image
    const result = await craiyon.generate({ prompt });

    // Check if we got images back
    if (!result || !result.images || result.images.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No images generated' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('✅ Craiyon image generated successfully');

    // Return the first image (base64 data URL)
    return new Response(
      JSON.stringify({
        imageUrl: result.images[0],
        prompt: prompt
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
        }
      }
    );

  } catch (error) {
    console.error('❌ Craiyon generation failed:', error);

    return new Response(
      JSON.stringify({
        error: 'Image generation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
