/**
 * Cloudflare Pages Function for Vectorize operations
 * Handles card embedding storage and retrieval
 */

interface Env {
  VECTORIZE: Vectorize;
  AI: Ai;
}

interface CardVector {
  id: string;
  values: number[];
  metadata: {
    name: string;
    description: string;
    might: number;
    fortune: number;
    cunning: number;
    category: string;
    deckId?: string;
  };
}

// POST /api/vectorize/upsert - Upsert card embeddings
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
    const { cards, deckId } = await request.json() as {
      cards: Array<{
        id: string;
        name: string;
        description: string;
        might: number;
        fortune: number;
        cunning: number;
        category: string;
      }>;
      deckId?: string;
    };

    if (!cards || !Array.isArray(cards)) {
      return new Response(JSON.stringify({ error: 'Invalid cards array' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Generate embeddings for each card
    const vectors: CardVector[] = [];

    for (const card of cards) {
      // Create text representation for embedding
      const cardText = `${card.name}: ${card.description}. Stats - Might: ${card.might}, Fortune: ${card.fortune}, Cunning: ${card.cunning}`;

      // Generate embedding using Workers AI
      const embeddings = await env.AI.run('@cf/baai/bge-base-en-v1.5', {
        text: [cardText]
      });

      const values = embeddings.data[0];
      if (!values) {
        console.warn(`Failed to generate embedding for card ${card.id}`);
        continue;
      }

      vectors.push({
        id: card.id,
        values,
        metadata: {
          name: card.name,
          description: card.description,
          might: card.might,
          fortune: card.fortune,
          cunning: card.cunning,
          category: card.category,
          ...(deckId && { deckId })
        }
      });
    }

    // Upsert vectors to Vectorize
    const result = await env.VECTORIZE.upsert(vectors);

    return new Response(JSON.stringify({
      success: true,
      count: result.count,
      ids: result.ids
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Vectorize upsert error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to upsert vectors',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// GET /api/vectorize/query - Query similar cards
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
    const url = new URL(request.url);
    const queryText = url.searchParams.get('q');
    const topK = parseInt(url.searchParams.get('topK') || '5');
    const deckId = url.searchParams.get('deckId');
    const minMight = url.searchParams.get('minMight');
    const minFortune = url.searchParams.get('minFortune');
    const minCunning = url.searchParams.get('minCunning');

    if (!queryText) {
      return new Response(JSON.stringify({ error: 'Query text required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Generate embedding for query
    const embeddings = await env.AI.run('@cf/baai/bge-base-en-v1.5', {
      text: [queryText]
    });

    const queryVector = embeddings.data[0];
    if (!queryVector) {
      return new Response(JSON.stringify({ error: 'Failed to generate query embedding' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Build filter for metadata
    const filter: Record<string, any> = {};
    if (deckId) filter.deckId = deckId;
    if (minMight) filter.might = { $gte: parseInt(minMight) };
    if (minFortune) filter.fortune = { $gte: parseInt(minFortune) };
    if (minCunning) filter.cunning = { $gte: parseInt(minCunning) };

    // Query Vectorize
    const results = await env.VECTORIZE.query(queryVector, {
      topK,
      returnValues: false,
      returnMetadata: 'all',
      ...(Object.keys(filter).length > 0 && { filter })
    });

    return new Response(JSON.stringify({
      success: true,
      matches: results.matches.map(match => ({
        id: match.id,
        score: match.score,
        card: match.metadata
      }))
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Vectorize query error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to query vectors',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
