/**
 * Image Generation Service using Craiyon AI
 * Provides free, reliable image generation for game scenes
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
 * Builds a dynamic style guide based on narrator and story context
 * Optimized for Pollinations.ai - short keywords for faster generation
 */
function getStyleGuide(narratorTone?: string, storyGenre?: string): string {
  // Import at runtime to avoid circular dependencies
  const NarratorManager = require('./narratorManager').NarratorManager;

  // Get active narrator context
  const activeNarrator = NarratorManager.getActiveNarrator();
  const tone = narratorTone || activeNarrator.tone;
  const personality = activeNarrator.personality;

  // Map narrative tones to visual styles
  const toneStyles: Record<string, string> = {
    'dark': 'dark fantasy, gothic, shadows',
    'horror': 'horror art, terrifying, dark atmosphere',
    'grim': 'grim dark, noir, moody',
    'mysterious': 'mysterious, mystical, ethereal',
    'noir': 'film noir, black and white, dramatic shadows',
    'dramatic': 'dramatic, epic, cinematic',
    'heroic': 'heroic fantasy, epic, bright',
    'epic': 'epic fantasy, grand scale, majestic',
    'light': 'bright fantasy, colorful, cheerful',
    'humorous': 'whimsical, cartoonish, playful',
    'comedy': 'cartoon style, funny, exaggerated',
    'wholesome': 'cozy, warm, inviting',
    'upbeat': 'vibrant, energetic, colorful',
    'sarcastic': 'stylized, comic book, bold colors',
    'chaotic': 'surreal, chaotic, wild colors',
  };

  // Map story genres to visual themes
  const genreStyles: Record<string, string> = {
    'fantasy': 'fantasy art, magical',
    'scifi': 'sci-fi, futuristic, tech',
    'sci-fi': 'sci-fi, futuristic, tech',
    'cyberpunk': 'cyberpunk, neon, dystopian',
    'steampunk': 'steampunk, Victorian, brass',
    'horror': 'horror, dark, ominous',
    'mystery': 'detective noir, mysterious',
    'western': 'western, dusty, frontier',
    'medieval': 'medieval, knights, castles',
    'modern': 'modern, contemporary, realistic',
    'space': 'space opera, cosmic, stars',
  };

  // Extract style from tone and personality
  let visualStyle = '';

  // Check tone
  for (const [key, style] of Object.entries(toneStyles)) {
    if (tone.toLowerCase().includes(key)) {
      visualStyle = style;
      break;
    }
  }

  // Check personality if no tone match
  if (!visualStyle) {
    for (const [key, style] of Object.entries(toneStyles)) {
      if (personality.toLowerCase().includes(key)) {
        visualStyle = style;
        break;
      }
    }
  }

  // Check story genre
  let genreStyle = '';
  if (storyGenre) {
    for (const [key, style] of Object.entries(genreStyles)) {
      if (storyGenre.toLowerCase().includes(key)) {
        genreStyle = style;
        break;
      }
    }
  }

  // Default to generic if no matches
  if (!visualStyle && !genreStyle) {
    visualStyle = 'painterly, dramatic lighting';
  }

  // Combine styles
  const combinedStyle = [genreStyle, visualStyle]
    .filter(s => s)
    .join(', ') || 'painterly art, dramatic lighting';

  return combinedStyle;
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
 * Generate image using Replicate FLUX Schnell via Cloudflare Function
 * Returns an image URL
 */
export async function generateSceneImageWithReplicate(prompt: string): Promise<string | null> {
  try {
    console.log('🎨 Generating image with Replicate FLUX Schnell:', prompt);

    // Call our Cloudflare Function endpoint
    const response = await fetch('/api/generate-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      console.error('❌ Craiyon API error:', response.status, response.statusText);
      return null;
    }

    const data = await response.json();

    if (data.imageUrl) {
      console.log('✅ Replicate image generated successfully');
      return data.imageUrl; // Returns Replicate image URL
    }

    console.warn('⚠️ No image URL in response');
    return null;
  } catch (error) {
    console.error('❌ Replicate generation failed:', error);
    return null;
  }
}

/**
 * Generates an image URL using Pollinations AI (fallback)
 * Exact format: https://image.pollinations.ai/prompt/apple?model=nanobanna
 * @param prompt - The scene description to visualize
 * @param options - Optional parameters for image generation
 * @returns URL that will generate and serve the image
 */
export function generateSceneImageUrl(
  prompt: string,
  options: ImageGenerationOptions = {}
): string {
  // Encode the prompt for URL
  const encodedPrompt = encodeURIComponent(prompt);

  // Build query parameters exactly as Pollinations expects
  const params = new URLSearchParams();
  if (options.model) params.set('model', options.model);
  if (options.width) params.set('width', options.width.toString());
  if (options.height) params.set('height', options.height.toString());
  if (options.seed) params.set('seed', options.seed.toString());
  if (options.nologo !== undefined) params.set('nologo', options.nologo.toString());
  if (options.enhance !== undefined) params.set('enhance', options.enhance.toString());

  const queryString = params.toString();

  // EXACT format: https://image.pollinations.ai/prompt/{prompt}?model=nanobanna
  return `https://image.pollinations.ai/prompt/${encodedPrompt}${queryString ? '?' + queryString : ''}`;
}

/**
 * Creates an optimized image prompt from scene data with consistent aesthetic
 * @param sceneType - The type of scene (intro, challenge, resolution)
 * @param description - The narrative description
 * @param setting - Optional setting/environment details
 * @param genre - Optional story genre for context
 * @returns Concise prompt optimized for Pollinations.ai
 */
export function createSceneImagePrompt(
  sceneType: string,
  description: string,
  _setting?: string,
  genre?: string
): string {
  // Keep description VERY short - 60 chars max for fast generation
  const shortDesc = description.length > 60
    ? description.substring(0, 60).trim()
    : description;

  // Scene-specific framing (minimal)
  const typeContext = sceneType === 'challenge'
    ? 'battle'
    : sceneType === 'resolution'
    ? 'victory'
    : 'adventure';

  // Get dynamic style based on narrator and genre
  const styleGuide = getStyleGuide(undefined, genre);

  // Combine: [type] [short description], [dynamic style]
  // Format: "battle tavern brawl, cyberpunk, neon, dystopian" or "adventure forest path, dark fantasy, gothic, shadows"
  return `${typeContext} ${shortDesc}, ${styleGuide}`;
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
