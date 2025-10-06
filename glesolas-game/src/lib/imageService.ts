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
 * Concise style guide for image generation
 * Optimized for Pollinations.ai - short keywords for faster generation
 */
const STYLE_KEYWORDS = 'fantasy RPG art, D&D style, painterly, dramatic lighting';

/**
 * Builds the style guide string (now concise)
 */
function getStyleGuide(): string {
  return STYLE_KEYWORDS;
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
 * @returns Concise prompt optimized for Pollinations.ai
 */
export function createSceneImagePrompt(
  sceneType: string,
  description: string,
  _setting?: string
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

  // Combine: [type] [short description], [style]
  // Format: "battle tavern brawl, fantasy RPG art, D&D style, painterly, dramatic lighting"
  return `${typeContext} ${shortDesc}, ${getStyleGuide()}`;
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
