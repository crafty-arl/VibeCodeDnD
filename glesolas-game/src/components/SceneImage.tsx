import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { createSceneImagePrompt, getSessionAestheticSeed, generateSceneImageUrl, areImagesEnabled } from '../lib/imageService';

interface SceneImageProps {
  narrative: string;
  sceneType?: 'intro' | 'challenge' | 'resolution' | 'transition' | 'scene';
  setting?: string;
  previousNarrative?: string;
  width?: number;
  height?: number;
  className?: string;
}

/**
 * SceneImage component - Generates and displays AI-generated scene illustrations
 * Uses Pollinations AI React hook for automatic loading states
 */
export function SceneImage({
  narrative,
  sceneType = 'scene',
  setting,
  previousNarrative,
  width = 1024,
  height = 768,
  className = '',
}: SceneImageProps) {
  // Create optimized prompt for image generation
  const imagePrompt = React.useMemo(() => {
    let prompt = createSceneImagePrompt(sceneType, narrative, setting);

    // Add previous scene context for continuity
    if (previousNarrative) {
      prompt = `Continuing from previous scene: "${previousNarrative.slice(0, 100)}...". ${prompt}`;
    }

    return prompt;
  }, [narrative, sceneType, setting, previousNarrative]);

  // Generate image URL directly (React 19 compatible)
  const imageUrl = React.useMemo(() => {
    // Use stable seed based on narrative content for consistency
    const narrativeSeed = narrative.split('').reduce((acc, char) => {
      return ((acc << 5) - acc) + char.charCodeAt(0);
    }, getSessionAestheticSeed());

    return generateSceneImageUrl(imagePrompt, {
      width,
      height,
      seed: Math.abs(narrativeSeed),
      model: 'nanobanana',
    });
  }, [imagePrompt, narrative, width, height]);

  // Track loading state
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
  }, [imageUrl]);

  const handleImageError = () => {
    console.warn('🖼️ Image loading failed:', imageUrl);
    setIsLoading(false);
    setHasError(true);
  };

  // Don't render if images are disabled
  if (!areImagesEnabled()) {
    return null;
  }

  return (
    <div className={`relative w-full aspect-video rounded-lg overflow-hidden border border-border bg-muted ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-secondary/20 to-background z-10">
          <div className="text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
            <p className="text-sm text-muted-foreground">Generating scene illustration...</p>
          </div>
        </div>
      )}

      {hasError ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-destructive/10 to-background">
          <div className="text-center space-y-2 p-4">
            <p className="text-sm text-muted-foreground">Image failed to load</p>
          </div>
        </div>
      ) : (
        <img
          src={imageUrl}
          alt="Scene illustration"
          className={`w-full h-full object-cover transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          onLoad={() => setIsLoading(false)}
          onError={handleImageError}
          loading="lazy"
        />
      )}

      {/* Optional: Overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent pointer-events-none" />
    </div>
  );
}

/**
 * SceneImageStatic - For displaying pre-generated image URLs
 * Use this when you already have an imageUrl (e.g., from saved scenes)
 */
export function SceneImageStatic({
  imageUrl,
  alt = 'Scene illustration',
  className = '',
}: {
  imageUrl: string;
  alt?: string;
  className?: string;
}) {
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasError, setHasError] = React.useState(false);

  return (
    <div className={`relative w-full aspect-video rounded-lg overflow-hidden border border-border bg-muted ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-secondary/20 to-background">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      {hasError ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-destructive/10 to-background">
          <p className="text-sm text-muted-foreground">Failed to load image</p>
        </div>
      ) : (
        <img
          src={imageUrl}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
          loading="lazy"
        />
      )}
    </div>
  );
}
