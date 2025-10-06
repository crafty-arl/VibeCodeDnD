/**
 * Image Generation Service using Pollinations AI
 * Provides free, no-API-key image generation for game scenes
 * Maintains consistent aesthetic across all sessions
 */

export interface ImageGenerationOptions {
  width?: number;
  height?: number;
  seed?: number;
  nologo?: boolean;
  enhance?: boolean;
  model?: string;
  previousPrompt?: string; // For continuity between scenes
}

/**
 * /quest Aesthetic Style Guide
 * These style parameters ensure visual consistency across all sessions
 */
const QUEST_AESTHETIC = {
  // Core visual style
  baseStyle: 'fantasy tabletop game art, hand-painted illustration style',

  // Color palette guidance
  colorPalette: 'warm medieval fantasy tones, rich earthy colors with magical accents',

  // Art direction
  artDirection: 'reminiscent of classic D&D and Magic: The Gathering card art',

  // Technical quality
  quality: 'detailed digital painting, professional game art quality, sharp focus',

  // Lighting and mood
  lighting: 'dramatic atmospheric lighting with depth',

  // Composition
  composition: 'dynamic composition, rule of thirds, clear focal point',

  // Avoid these (negative prompts conceptually)
  avoid: 'photograph, photorealistic, modern, sci-fi, anime',
};

/**
 * Builds the complete style guide string
 */
function getStyleGuide(): string {
  return [
    QUEST_AESTHETIC.baseStyle,
    QUEST_AESTHETIC.colorPalette,
    QUEST_AESTHETIC.artDirection,
    QUEST_AESTHETIC.quality,
    QUEST_AESTHETIC.lighting,
    QUEST_AESTHETIC.composition,
  ].join(', ');
}

/**
 * Session-based aesthetic persistence
 */
const AESTHETIC_STORAGE_KEY = 'glesolas_aesthetic_seed';
const IMAGES_ENABLED_KEY = 'glesolas_images_enabled';

/**
 * Check if images are enabled
 */
export function areImagesEnabled(): boolean {
  const stored = localStorage.getItem(IMAGES_ENABLED_KEY);
  return stored === null ? true : stored === 'true'; // Default to enabled
}

/**
 * Toggle images on/off
 */
export function toggleImages(enabled: boolean): void {
  localStorage.setItem(IMAGES_ENABLED_KEY, enabled.toString());
}

/**
 * Get or create a session aesthetic seed
 * This ensures visual consistency within a play session
 */
export function getSessionAestheticSeed(): number {
  const stored = localStorage.getItem(AESTHETIC_STORAGE_KEY);
  if (stored) {
    return parseInt(stored, 10);
  }

  // Create a new seed for this session (based on date to vary across days)
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const seed = generateSeedFromString(`glesolas-${today}`);
  localStorage.setItem(AESTHETIC_STORAGE_KEY, seed.toString());
  return seed;
}

/**
 * Reset the session aesthetic (for new campaigns)
 */
export function resetSessionAesthetic(): void {
  localStorage.removeItem(AESTHETIC_STORAGE_KEY);
}

/**
 * Generates an image URL using Pollinations AI
 * @param prompt - The scene description to visualize
 * @param options - Optional parameters for image generation
 * @returns URL that will generate and serve the image
 */
export function generateSceneImageUrl(
  prompt: string,
  options: ImageGenerationOptions = {}
): string {
  const {
    width = 1024,
    height = 768,
    seed,
    nologo = true,
    model = 'flux',
  } = options;

  // Encode the prompt for URL
  const encodedPrompt = encodeURIComponent(prompt);

  // Build query parameters
  const params = new URLSearchParams();
  params.append('width', width.toString());
  params.append('height', height.toString());
  params.append('model', model);

  if (seed !== undefined) {
    params.append('seed', seed.toString());
  }

  if (nologo) {
    params.append('nologo', 'true');
  }

  // Correct Pollinations AI endpoint: https://pollinations.ai/p/{prompt}
  return `https://pollinations.ai/p/${encodedPrompt}?${params.toString()}`;
}

/**
 * Creates an optimized image prompt from scene data with consistent aesthetic
 * @param sceneType - The type of scene (intro, challenge, resolution)
 * @param description - The narrative description
 * @param setting - Optional setting/environment details
 * @returns An enhanced prompt for image generation with GLESOLAS style guide
 */
export function createSceneImagePrompt(
  sceneType: string,
  description: string,
  setting?: string
): string {
  // Scene-specific framing
  const sceneContext = setting ? `${setting}, ` : '';
  const typeContext = sceneType === 'challenge'
    ? 'dramatic conflict scene, '
    : sceneType === 'resolution'
    ? 'epic conclusion moment, '
    : sceneType === 'transition'
    ? 'transitional scene, '
    : 'establishing shot, ';

  // Combine scene content with consistent style guide
  const styleGuide = getStyleGuide();

  return `${typeContext}${sceneContext}${description}. Style: ${styleGuide}`;
}

/**
 * Preloads an image by creating an Image object
 * @param url - The image URL to preload
 * @returns Promise that resolves when image is loaded
 */
export function preloadImage(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = url;
  });
}

/**
 * Generates a deterministic seed from a string
 * Useful for consistent image generation based on scene ID
 * @param str - Input string (e.g., scene ID)
 * @returns Numeric seed
 */
export function generateSeedFromString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}
