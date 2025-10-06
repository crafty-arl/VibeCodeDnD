# Pollinations AI Image Generation Integration

## Overview
Successfully integrated **Pollinations AI** free image generation service to create scene-by-scene illustrations for the GLESOLAS game using the **Flux** model (fast and high-quality).

## Features Implemented

### 1. Image Service (`src/lib/imageService.ts`)
- ✅ Free, no-API-key image generation using Pollinations AI
- ✅ Supports multiple models: Flux, Turbo, Flux Realism, Flux Anime, Flux 3D, Any Dark
- ✅ **Session-based aesthetic persistence** - maintains visual consistency across a play session
- ✅ **Scene continuity** - uses previous scene context for visual coherence
- ✅ Customizable parameters: width, height, seed, model, enhance, nologo
- ✅ Built-in GLESOLAS aesthetic style guide for consistent fantasy art

### 2. Type Updates
- ✅ Added `imageUrl?: string` field to `PlaygroundScene` type
- ✅ Added `imageUrl?: string` field to `Encounter` type

### 3. Integration Points

#### Playground Mode
All playground scene generation functions now automatically generate images:
- `generateOpeningScene()` - Opening story scene
- `processPlayerAction()` - Player-driven narrative scenes
- `generatePlotTwist()` - Plot twist scenes
- `generateToneShift()` - Tone change scenes
- `generateStoryConclusion()` - Story ending scenes

#### UI Display
- ✅ Added image display in `PlaygroundGameView` component
- ✅ Images shown above narrative text in 16:9 aspect ratio
- ✅ Lazy loading for performance
- ✅ Responsive design with rounded borders

## How It Works

### Image Generation Flow
```
1. AI generates narrative text
2. createPlaygroundScene() is called with narrative
3. Image service creates optimized visual prompt
4. Pollinations AI URL is generated with session aesthetic seed
5. Image URL is stored in scene object
6. UI displays image when rendering scene
```

### Visual Consistency
The system maintains visual consistency through:
1. **Session Aesthetic Seed** - Same base style for all scenes in a session
2. **Previous Scene Context** - Continuity between consecutive scenes
3. **Style Guide** - Consistent fantasy tabletop art aesthetic

### API Format
```javascript
https://image.pollinations.ai/prompt/{encoded_prompt}?width=1024&height=768&model=flux&nologo=true&enhance=true
```

## Configuration

### Default Settings
- **Width**: 1024px
- **Height**: 768px (16:9 aspect ratio)
- **Model**: `flux` (balanced speed and quality)
- **Logo**: Disabled (`nologo=true`)
- **Enhance**: Enabled (AI enhances prompts for better results)

### Style Guide
The aesthetic combines:
- Fantasy tabletop game art style
- Hand-painted illustration look
- Warm medieval fantasy color palette
- Dramatic atmospheric lighting
- Classic D&D and Magic: The Gathering inspiration

## Usage Example

```typescript
import { createPlaygroundScene } from './lib/playgroundEngine';

const narrative = "A brave knight enters a dark dungeon...";
const scene = createPlaygroundScene(
  narrative,
  "Enter the dungeon",
  [card1, card2],
  previousSceneNarrative // For continuity
);

// scene.imageUrl is now a Pollinations AI URL
// <img src={scene.imageUrl} alt="Scene illustration" />
```

## Benefits

1. **Free** - No API keys or costs
2. **Fast** - Images generated on-demand
3. **Consistent** - Session-based aesthetic persistence
4. **Contextual** - Uses previous scenes for continuity
5. **High Quality** - Flux model provides excellent results
6. **No Storage** - Images served directly from Pollinations
7. **Automatic** - Integrated into all scene generation functions

## Models Available

| Model | Description | Best For |
|-------|-------------|----------|
| `flux` | High-quality, balanced | **Default - recommended** |
| `turbo` | Faster generation | Quick prototyping |
| `flux-realism` | Photorealistic style | Realistic scenes |
| `flux-anime` | Anime/manga style | Stylized art |
| `flux-3d` | 3D rendered style | 3D-like visuals |
| `any-dark` | Dark, moody aesthetic | Horror/dark themes |

## Future Enhancements

- [ ] Add campaign mode image generation
- [ ] User-configurable model selection
- [ ] Image caching for offline viewing
- [ ] Custom style presets
- [ ] Image regeneration button
- [ ] Gallery view of all scene images

## Testing

To test the integration:
1. Start the game in development mode
2. Enter Playground Mode
3. Generate a story scene
4. Observe the generated image above the narrative text
5. Create multiple scenes to see visual continuity

## Technical Details

### Session Aesthetic Seed
- Stored in localStorage as `glesolas_aesthetic_seed`
- Generated from current date for daily variation
- Ensures all scenes in a session share the same artistic style
- Can be reset with `resetSessionAesthetic()`

### Image Prompt Engineering
The system automatically:
1. Extracts key visual elements from narrative
2. Adds scene type context (intro, challenge, resolution)
3. Applies GLESOLAS style guide
4. Includes previous scene for continuity

### Performance
- Images load lazily (only when visible)
- No storage overhead (served from Pollinations CDN)
- Async generation doesn't block gameplay
- Preload function available for eager loading

## Troubleshooting

**Images not loading?**
- Check browser console for network errors
- Verify Pollinations AI is accessible: https://image.pollinations.ai/
- Try a different model

**Images inconsistent?**
- Aesthetic seed may have reset - normal for new sessions
- Clear localStorage to reset aesthetic

**Slow generation?**
- Try `turbo` model for faster results
- Reduce image dimensions

## Credits
- **Pollinations AI**: https://pollinations.ai
- **Model**: Flux (default)
- **Integration**: GLESOLAS Game Development Team
