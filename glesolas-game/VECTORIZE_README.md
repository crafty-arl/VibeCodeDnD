# Vectorize Integration for GLESOLAS

This document explains how Cloudflare Vectorize is integrated into GLESOLAS for faster AI narrative generation through semantic card search and contextual retrieval.

## Overview

Vectorize is Cloudflare's vector database that stores card embeddings, enabling:
- **Faster AI generation**: Reduced prompt tokens by referencing card IDs instead of full details
- **Semantic search**: Find thematically similar cards for better narrative coherence
- **Smart context**: AI retrieves only relevant cards based on current scene

## Architecture

```
┌─────────────────┐
│   User's Deck   │
│  (localStorage) │
└────────┬────────┘
         │
         │ Sync on create/update
         ▼
┌─────────────────────────────┐
│   Cloudflare Vectorize      │
│  (Vector Database)          │
│                             │
│  - Card embeddings (768d)   │
│  - Metadata (stats, flavor) │
│  - Cosine similarity search │
└────────┬────────────────────┘
         │
         │ Query for context
         ▼
┌─────────────────────────────┐
│   AI Narrative Generation   │
│  (Reduced token usage)      │
└─────────────────────────────┘
```

## How It Works

### 1. Deck Sync to Vectorize

When you create or update a deck, cards are automatically synced to Vectorize:

```typescript
// DeckManager.createDeck() automatically calls:
VectorizeService.upsertCards(cards, deckId);
```

Each card is converted to a 768-dimension embedding using Workers AI:
```
Card: "Ancient Dragon - A fearsome beast. Might: 8"
  ↓ (Workers AI: @cf/baai/bge-base-en-v1.5)
Embedding: [0.12, -0.45, 0.78, ..., 0.34] (768 numbers)
```

### 2. Metadata Storage

Card stats and details are stored as metadata alongside vectors:

```typescript
{
  id: "card_123",
  values: [0.12, -0.45, ...], // 768d embedding
  metadata: {
    name: "Ancient Dragon",
    description: "A fearsome beast",
    might: 8,
    fortune: 3,
    cunning: 5,
    category: "Character",
    deckId: "deck_abc"
  }
}
```

### 3. Semantic Search for Context

Instead of including all card details in every AI prompt, we can query Vectorize for contextually relevant cards:

```typescript
// Find cards similar to current narrative
const matches = await VectorizeService.querySimilarCards(
  "The dragon awakens in its lair",
  { topK: 5, minMight: 5 }
);
```

This returns cards that are:
- Semantically similar to the query text
- Match filter criteria (e.g., `might >= 5`)
- Ranked by relevance score

## API Endpoints

### POST `/api/vectorize`
Upsert card embeddings to Vectorize index.

**Request:**
```json
{
  "cards": [
    {
      "id": "card_123",
      "name": "Ancient Dragon",
      "description": "A fearsome beast",
      "might": 8,
      "fortune": 3,
      "cunning": 5,
      "category": "Character"
    }
  ],
  "deckId": "deck_abc"
}
```

**Response:**
```json
{
  "success": true,
  "count": 1,
  "ids": ["card_123"]
}
```

### GET `/api/vectorize?q=<query>&topK=5`
Query for similar cards using semantic search.

**Query Parameters:**
- `q`: Query text (required)
- `topK`: Number of results (default: 5)
- `deckId`: Filter by deck ID
- `minMight`, `minFortune`, `minCunning`: Filter by stats

**Response:**
```json
{
  "success": true,
  "matches": [
    {
      "id": "card_123",
      "score": 0.89,
      "card": {
        "name": "Ancient Dragon",
        "description": "A fearsome beast",
        "might": 8,
        "fortune": 3,
        "cunning": 5,
        "category": "Character"
      }
    }
  ]
}
```

## Performance Benefits

### Before Vectorize
```typescript
// Prompt includes ALL card details
const prompt = `
Cards:
- Character: Ancient Dragon - A fearsome beast with scales of obsidian. Might: 8, Fortune: 3, Cunning: 5
- Item: Flaming Sword - Forged in dragon fire. Might: 7, Fortune: 2, Cunning: 4
- Location: Mountain Peak - Where eagles dare. Might: 5, Fortune: 6, Cunning: 3

Generate intro scene...
`;
// Token count: ~150 tokens just for cards
```

### After Vectorize
```typescript
// Prompt references card IDs only
const prompt = `
Card IDs: card_123, card_456, card_789

Generate intro scene...
`;
// Token count: ~20 tokens for cards
// Vectorize provides full context on-demand

// Savings: 130 tokens per generation × 100 generations = 13,000 tokens saved
```

## Local Development

To test Vectorize locally, you need to run Wrangler with Pages Functions:

```bash
# Build the app
npm run build

# Deploy locally with Pages Functions
npx wrangler pages dev dist --local
```

The `--local` flag uses a local Vectorize emulator instead of hitting production.

## Deployment

Deploy to Cloudflare Pages with Vectorize bindings:

```bash
npm run deploy
```

The `wrangler.toml` configuration already includes:
- Vectorize binding (`VECTORIZE`)
- Workers AI binding (`AI`)

## Usage in Code

### Initialize Deck
```typescript
import { DeckManager } from '@/lib/deckManager';

// On app load, sync active deck to Vectorize
const deck = DeckManager.getActiveDeck();
DeckManager.setActiveDeck(deck.id); // Triggers Vectorize sync
```

### Query for Relevant Cards
```typescript
import { VectorizeService } from '@/lib/vectorizeService';

// Get cards relevant to current narrative
const relevantCards = await VectorizeService.getRelevantCardsForNarrative(
  introScene,
  availableCards,
  5 // topK
);
```

### Semantic Card Search
```typescript
// Find cards similar to a theme
const matches = await VectorizeService.querySimilarCards(
  "dark magic and ancient power",
  { topK: 10, minCunning: 6 }
);
```

## Troubleshooting

### Vectorize Not Working Locally
- Ensure you're using `wrangler pages dev --local`
- Check that `wrangler.toml` has Vectorize binding
- Verify Wrangler version: `npx wrangler --version` (needs 3.71.0+)

### Embeddings Not Syncing
- Check browser console for errors from `/api/vectorize`
- Verify Workers AI binding is configured
- Ensure cards have valid `id` field

### Query Returns No Results
- Check that deck was synced: `VectorizeService.initializeDeck()`
- Verify query text is meaningful (not just IDs)
- Try broader filters (remove `minMight`, etc.)

## Future Enhancements

1. **Batch Embedding**: Generate embeddings for multiple cards in parallel
2. **Caching**: Cache recent query results for faster repeated lookups
3. **Smart Filtering**: Auto-detect required stats from narrative context
4. **Cross-Deck Search**: Find cards across all user decks for inspiration

## Resources

- [Cloudflare Vectorize Docs](https://developers.cloudflare.com/vectorize/)
- [Workers AI Embeddings](https://developers.cloudflare.com/workers-ai/models/#text-embeddings)
- [RAG Architecture](https://developers.cloudflare.com/reference-architecture/diagrams/ai/ai-rag/)
