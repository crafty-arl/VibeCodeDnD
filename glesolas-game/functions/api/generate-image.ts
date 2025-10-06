/**
 * Cloudflare Pages Function for Replicate FLUX Schnell Image Generation
 * Endpoint: /api/generate-image
 *
 * Uses: https://replicate.com/black-forest-labs/flux-schnell
 * Fast, high-quality image generation
 */

import Replicate from 'replicate';

interface Env {
  REPLICATE_API_TOKEN: string;
}

export async function onRequestPost(context: { request: Request; env: Env }) {
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

    // Check for API token
    const apiToken = context.env.REPLICATE_API_TOKEN;
    if (!apiToken) {
      console.error('❌ REPLICATE_API_TOKEN not found in environment');
      return new Response(
        JSON.stringify({ error: 'API token not configured' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('🎨 Generating image with Replicate FLUX Schnell:', prompt);

    // Initialize Replicate client
    const replicate = new Replicate({
      auth: apiToken,
    });

    // Generate image using FLUX Schnell
    const output = await replicate.run(
      "black-forest-labs/flux-schnell",
      {
        input: {
          prompt: prompt,
          num_outputs: 1,
          aspect_ratio: "16:9",
          output_format: "jpg",
          output_quality: 80,
        }
      }
    );

    // FLUX Schnell returns array of image URLs
    if (!output || !Array.isArray(output) || output.length === 0) {
      console.error('❌ No images generated from Replicate');
      return new Response(
        JSON.stringify({ error: 'No images generated' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('✅ Replicate image generated successfully');

    // Return the first image URL
    return new Response(
      JSON.stringify({
        imageUrl: output[0],
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
    console.error('❌ Replicate generation failed:', error);

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
