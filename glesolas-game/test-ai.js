// Test AI API connectivity
import OpenAI from 'openai';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env file
dotenv.config({ path: join(__dirname, '.env') });

const API_KEY = process.env.VITE_OPENROUTER_API_KEY;
const MODEL = process.env.VITE_AI_MODEL || 'openai/gpt-4o';

console.log('🔍 Testing AI Service Configuration\n');
console.log('API Key:', API_KEY ? `${API_KEY.slice(0, 20)}...${API_KEY.slice(-10)}` : 'NOT SET');
console.log('Model:', MODEL);
console.log('AI Enabled:', process.env.VITE_AI_ENABLED !== 'false');
console.log('\n' + '='.repeat(60) + '\n');

if (!API_KEY) {
  console.error('❌ ERROR: VITE_OPENROUTER_API_KEY is not set in .env file');
  process.exit(1);
}

const client = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: API_KEY,
  defaultHeaders: {
    'HTTP-Referer': 'http://localhost:5173',
    'X-Title': 'GLESOLAS Game Test',
  },
});

async function testAI() {
  try {
    console.log('📡 Testing API connection...\n');

    const response = await client.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant. Respond with exactly 5 words.',
        },
        {
          role: 'user',
          content: 'Say hello',
        },
      ],
      max_tokens: 20,
      temperature: 0.7,
    });

    const result = response.choices[0]?.message?.content;

    if (result) {
      console.log('✅ SUCCESS! AI is working correctly\n');
      console.log('Response:', result);
      console.log('\nAPI Details:');
      console.log('- Model used:', response.model);
      console.log('- Tokens used:', response.usage?.total_tokens || 'N/A');
      console.log('- Request ID:', response.id);
    } else {
      console.log('⚠️  WARNING: Response received but no content');
      console.log('Full response:', JSON.stringify(response, null, 2));
    }
  } catch (error) {
    console.error('❌ ERROR: AI request failed\n');
    console.error('Error details:');
    if (error.response) {
      console.error('- Status:', error.response.status);
      console.error('- Status Text:', error.response.statusText);
      console.error('- Data:', error.response.data);
    } else if (error.message) {
      console.error('- Message:', error.message);
    } else {
      console.error(error);
    }
    process.exit(1);
  }
}

// Run test
testAI();
