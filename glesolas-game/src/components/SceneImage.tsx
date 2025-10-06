import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { createSceneImagePrompt, getSessionAestheticSeed, generateSceneImageUrl, generateSceneImageWithReplicate, areImagesEnabled } from '../lib/imageService';

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
  width = 1024,
  height = 768,
  className = '',
}: SceneImageProps) {
  // Create optimized prompt for image generation
  const imagePrompt = React.useMemo(() => {
    // Keep prompts short for faster generation - don't add previousNarrative
    return createSceneImagePrompt(sceneType, narrative, setting);
  }, [narrative, sceneType, setting]);

  // Track loading state
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>('');

  // Generate image with Pollinations (with Replicate fallback)
  useEffect(() => {
    let isMounted = true;

    async function generateImage() {
      setIsLoading(true);
      setHasError(false);

      // Try Pollinations first (fast & free)
      console.log('🎨 Trying Pollinations.ai first...');
      const narrativeSeed = narrative.split('').reduce((acc, char) => {
        return ((acc << 5) - acc) + char.charCodeAt(0);
      }, getSessionAestheticSeed());

      const pollinationsUrl = generateSceneImageUrl(imagePrompt, {
        width,
        height,
        seed: Math.abs(narrativeSeed),
        model: 'flux-realism',
        nologo: true,
      });

      // Test if Pollinations loads within 5 seconds
      const pollinationsWorks = await new Promise<boolean>((resolve) => {
        const img = new Image();
        const timeout = setTimeout(() => {
          console.warn('⏱️ Pollinations timeout after 5s');
          resolve(false);
        }, 5000);

        img.onload = () => {
          clearTimeout(timeout);
          console.log('✅ Pollinations loaded successfully');
          resolve(true);
        };

        img.onerror = () => {
          clearTimeout(timeout);
          console.warn('❌ Pollinations failed to load');
          resolve(false);
        };

        img.src = pollinationsUrl;
      });

      if (!isMounted) return;

      if (pollinationsWorks) {
        // Pollinations worked - use it!
        setImageUrl(pollinationsUrl);
      } else {
        // Fallback to Replicate FLUX Schnell
        console.log('⚠️ Pollinations failed, falling back to Replicate FLUX Schnell');
        const replicateUrl = await generateSceneImageWithReplicate(imagePrompt);

        if (!isMounted) return;

        if (replicateUrl) {
          console.log('✅ Using Replicate FLUX Schnell image');
          setImageUrl(replicateUrl);
        } else {
          // Both failed - try Pollinations anyway (user will see error state)
          console.error('❌ Both Pollinations and Replicate failed');
          setImageUrl(pollinationsUrl);
        }
      }
    }

    generateImage();

    return () => {
      isMounted = false;
    };
  }, [imagePrompt, narrative, width, height]);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.warn('🖼️ Image loading failed (Pollinations.ai timeout or error):', {
      url: imageUrl,
      prompt: imagePrompt,
      error: e,
    });
    setIsLoading(false);
    setHasError(true);
  };

  // Add timeout protection - hide loading state after 10 seconds
  React.useEffect(() => {
    if (isLoading) {
      const timeout = setTimeout(() => {
        console.warn('🖼️ Image loading timeout after 10s');
        setIsLoading(false);
        setHasError(true);
      }, 10000);
      return () => clearTimeout(timeout);
    }
  }, [isLoading, imageUrl]);

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
