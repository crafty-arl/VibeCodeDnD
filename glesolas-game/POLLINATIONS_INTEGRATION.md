# Pollinations AI Integration Guide

## Overview

This project integrates **Pollinations AI** for scene-by-scene image generation using the **Google Nano Banana** model. The implementation maintains visual consistency across the narrative by tracking prompt conversation history.

## Architecture

### 1. Custom React Hook: `useSceneImageGeneration`

Location: `src/hooks/useSceneImageGeneration.ts`

#### Features:
- ✅ Uses Pollinations AI's `usePollinationsImage` hook
- ✅ Maintains conversation history (up to 10 scenes by default)
- ✅ Builds contextual prompts that reference previous scenes
- ✅ Supports all Pollinations models (nano-banana, turbo, flux, etc.)
- ✅ Automatic visual consistency through prompt chaining

#### Usage Example:

```tsx
import { useSceneImageGeneration } from '@/hooks';

function MyComponent() {
  const {
    imageUrl,
    loading,
    error,
    promptHistory,
    generateImage,
    clearHistory,
    getContextualPrompt,
  } = useSceneImageGeneration();

  const handleGenerateIntro = () => {
    generateImage(
      'A wizard enters a mystical tavern',
      'intro',
      {
        model: 'nano-banana',
        width: 1024,
        height: 768,
        enhance: true,
      }
    );
  };

  return (
    <div>
      <button onClick={handleGenerateIntro}>Generate Scene</button>
      {loading && <p>Generating image...</p>}
      {imageUrl && <img src={imageUrl} alt="Scene" />}
    </div>
  );
}
```

#### API Reference:

**Return Value:**
- `imageUrl: string | null` - Generated image URL from Pollinations
- `loading: boolean` - Loading state
- `error: Error | null` - Error state
- `promptHistory: ScenePromptHistoryItem[]` - Array of previous prompts
- `generateImage(prompt, sceneType, options?)` - Generate new image
- `regenerateImage(historyIndex)` - Regenerate from history
- `clearHistory()` - Clear conversation history
- `getContextualPrompt(prompt, sceneType)` - Preview contextual prompt

**Options:**
```typescript
interface SceneImageOptions {
  width?: number;           // Default: 1024
  height?: number;          // Default: 768
  seed?: number;            // For reproducible results
  nologo?: boolean;         // Default: true
  enhance?: boolean;        // Default: true
  model?: 'nano-banana'     // Default: 'nano-banana'
        | 'turbo'
        | 'flux'
        | 'flux-realism'
        | 'flux-anime'
        | 'flux-3d';
}
```

### 2. Scene Image Store Enhancement

Location: `src/lib/sceneImageStore.ts`

#### Features:
- ✅ Tracks conversation history across all scenes
- ✅ Stores generated image URLs
- ✅ Provides access to recent history (last 3 scenes)
- ✅ Automatic cleanup of old images

#### Usage Example:

```typescript
import { SceneImageStore } from '@/lib/sceneImageStore';

// Store intro scene with image
SceneImageStore.storeIntroImage(introText, aiResponse, imageUrl);

// Get conversation history
const history = SceneImageStore.getConversationHistory();

// Get recent scenes for context
const recent = SceneImageStore.getRecentHistory(3);

// Clear history on new game
SceneImageStore.resetHistory();

// Update last image URL after generation
SceneImageStore.updateLastImageUrl(generatedUrl);
```

### 3. Scene Image Display Component

Location: `src/components/SceneImageDisplay.tsx`

#### Features:
- ✅ Auto-generates images based on scene prompts
- ✅ Loading states with animated spinner
- ✅ Error handling with user feedback
- ✅ Integrates with SceneImageStore
- ✅ Customizable styling

#### Usage Example:

```tsx
import { SceneImageDisplay } from '@/components/SceneImageDisplay';

function GameScene({ introScene }) {
  const imagePrompt = SceneImageStore.getIntroImage(introScene);

  return (
    <div>
      <h2>{introScene}</h2>
      <SceneImageDisplay
        sceneType="intro"
        imagePrompt={imagePrompt}
        autoGenerate={true}
        className="my-4"
        onImageGenerated={(url) => console.log('Generated:', url)}
      />
    </div>
  );
}
```

## Conversation History System

### How it Works:

1. **First Scene**: Simple prompt with fantasy art styling
   ```
   Fantasy art scene: A wizard enters a mystical tavern.
   Digital painting, detailed illustration, atmospheric lighting.
   ```

2. **Second Scene**: References previous scene
   ```
   Continue the visual story from: [Previous intro]: A wizard enters a mystical tavern.
   Now show (dramatic scene showing the obstacle): The wizard faces a dragon.
   Maintain consistent art style, character appearances, and color palette.
   ```

3. **Third Scene**: References last 2-3 scenes
   ```
   Continue the visual story from: [Previous intro]: ... → [Previous challenge]: ...
   Now show (conclusion showing the outcome): The wizard defeats the dragon.
   Maintain consistent art style, character appearances, and color palette.
   ```

### Benefits:
- **Visual Continuity**: Characters, locations, and art style remain consistent
- **Narrative Flow**: Images tell a cohesive visual story
- **Context-Aware**: Nano Banana model leverages conversation history
- **Automatic**: No manual prompt engineering required

## Integration with Game Scenes

### Updating Scene Generation Functions

To integrate with existing scene generation in `src/data/scenes.ts`:

```typescript
// In generateIntroSceneAsync
const structuredResult = await generateStructured(prompt, introSceneSchema, options);

if (structuredResult) {
  // Store with image prompt for later generation
  SceneImageStore.storeIntroImage(structuredResult.scene, structuredResult);
  return structuredResult.scene;
}
```

The `imagePrompt` field from the AI response is now automatically stored and can be used to generate images.

### Scene Types:
- **intro**: Establishing shots showing the beginning
- **challenge**: Dramatic scenes showing obstacles
- **resolution**: Conclusions showing outcomes
- **transition**: Transitional moments connecting scenes

## Model Selection: Nano Banana

### Why Google Nano Banana?

The **nano-banana** model is chosen as the default because:
- ✅ **Contextual Understanding**: Excellent at maintaining consistency across prompts
- ✅ **Fast Generation**: Quick response times for smooth UX
- ✅ **Fantasy Art**: Great for fantasy/RPG style visuals
- ✅ **Free**: No API key required via Pollinations

### Alternative Models:

You can switch models by passing the `model` option:

```typescript
generateImage(prompt, 'intro', { model: 'flux-realism' }); // Photorealistic
generateImage(prompt, 'intro', { model: 'flux-anime' });   // Anime style
generateImage(prompt, 'intro', { model: 'turbo' });        // Fast generation
```

## Performance Considerations

### Optimization Tips:

1. **Preload Images**: Use the loading state to show placeholders
2. **Lazy Loading**: Images use `loading="lazy"` attribute
3. **History Limit**: Default max 10 scenes (configurable)
4. **Cleanup**: Automatic cleanup of images older than 1 hour
5. **Seed for Consistency**: Use same seed for reproducible results

### Example Preloading:

```typescript
const { generateImage } = useSceneImageGeneration();

// Pre-generate next scene while user reads current scene
useEffect(() => {
  if (nextScenePrompt) {
    generateImage(nextScenePrompt, 'challenge');
  }
}, [nextScenePrompt]);
```

## Troubleshooting

### Images Not Loading?
- Check browser console for errors
- Verify Pollinations.ai is accessible
- Ensure prompts are not empty

### Visual Inconsistency?
- Increase history context (more scenes)
- Use consistent seed values
- Add style keywords to prompts

### Slow Generation?
- Use `turbo` model for faster results
- Reduce image dimensions
- Implement preloading strategy

## Next Steps

1. Add the `SceneImageDisplay` component to your game UI
2. Update scene generation to auto-trigger image generation
3. Add image gallery to view conversation history
4. Implement image regeneration controls for users
5. Add ability to download/share generated images

## Resources

- [Pollinations AI Docs](https://pollinations.ai/)
- [Nano Banana Model](https://github.com/pollinations/pollinations)
- [@pollinations/react Package](https://www.npmjs.com/package/@pollinations/react)
