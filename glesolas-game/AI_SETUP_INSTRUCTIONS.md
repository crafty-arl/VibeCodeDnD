# 🤖 AI Service Setup Instructions

## ⚠️ Current Issue

**The AI service is not working because the OpenRouter API key is invalid.**

Error: `{"error":{"message":"User not found.","code":401}}`

## 🔧 Quick Fix

### Option 1: Get a New OpenRouter API Key (Recommended)

1. **Go to OpenRouter**: https://openrouter.ai/keys
2. **Sign up or log in**
3. **Create a new API key**
4. **Add credits** (minimum $5 recommended)
5. **Update `.env` file**:
   ```bash
   VITE_OPENROUTER_API_KEY=sk-or-v1-YOUR_NEW_KEY_HERE
   ```
6. **Restart dev server**:
   ```bash
   # Kill current server (Ctrl+C)
   npm run dev
   ```

### Option 2: Use Free Models

OpenRouter offers some free models you can use without credits:

1. **Update `.env`** to use a free model:
   ```bash
   VITE_OPENROUTER_API_KEY=sk-or-v1-YOUR_KEY_HERE
   VITE_AI_MODEL=qwen/qwen-2.5-72b-instruct
   # or
   VITE_AI_MODEL=meta-llama/llama-3.2-3b-instruct:free
   ```

2. **Restart dev server**

### Option 3: Disable AI (Use Templates)

If you don't want to use AI right now:

1. **Update `.env`**:
   ```bash
   VITE_AI_ENABLED=false
   ```

2. **Restart dev server**

The game will work perfectly with hand-crafted template narratives.

## 📊 Testing the API Key

Test your API key with curl:

```bash
curl -X POST https://openrouter.ai/api/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "openai/gpt-4o",
    "messages": [{"role": "user", "content": "Hello"}],
    "max_tokens": 10
  }'
```

**Success response:**
```json
{
  "id": "gen-...",
  "choices": [{
    "message": {
      "content": "Hello! How can I help..."
    }
  }]
}
```

**Error response:**
```json
{
  "error": {
    "message": "User not found.",
    "code": 401
  }
}
```

## 🎮 How AI Enhances the Game

When AI is working, you get:

### Campaign Mode
- ✨ **Dynamic intro scenes** based on your cards
- 🎲 **Contextual challenges** that reference the story
- 📖 **Personalized resolutions** that reflect your choices
- 🔄 **Smooth transitions** between encounters

### Playground Mode
- 🎨 **Custom story generation** based on your prompts
- 🧠 **Semantic card search** with Vectorize
- 💡 **AI co-author suggestions** for plot twists
- 🎭 **Dynamic tone shifting**

### With Templates (No AI)
The game still works great! You get:
- 📝 Hand-crafted narrative templates
- 🎯 Consistent quality stories
- ⚡ Instant generation (no API calls)
- 💰 Zero cost

## 🚀 Recommended Models

### Best for Quality
```bash
VITE_AI_MODEL=openai/gpt-4o
# Cost: $2.50 per 1M input tokens
# Speed: Fast
# Quality: Excellent
```

### Best for Free
```bash
VITE_AI_MODEL=qwen/qwen-2.5-72b-instruct
# Cost: FREE
# Speed: Very fast
# Quality: Good
```

### Best for Speed
```bash
VITE_AI_MODEL=meta-llama/llama-3.1-8b-instruct
# Cost: $0.18 per 1M tokens
# Speed: Very fast
# Quality: Good
```

## 🔍 Debugging

Check browser console for AI service status:

### Success:
```
✅ AI service initialized
🎭 Active Narrator: Kai Shadowstorm
✨ Generating narrative with AI...
```

### Error:
```
❌ AI generation error: 401 Unauthorized
⚠️ Falling back to template generation
```

### Disabled:
```
ℹ️ AI service disabled, using templates
```

## 💡 Troubleshooting

### "User not found" Error
- **Cause**: Invalid or expired API key
- **Fix**: Get a new key from https://openrouter.ai/keys

### "Insufficient credits" Error
- **Cause**: OpenRouter account has no credits
- **Fix**: Add credits or switch to free model

### "Rate limit exceeded" Error
- **Cause**: Too many requests
- **Fix**: Wait a minute, then try again

### "Model not found" Error
- **Cause**: Invalid model name in `.env`
- **Fix**: Check available models at https://openrouter.ai/models

### "CORS error" in browser
- **Cause**: OpenRouter blocking request
- **Fix**: This shouldn't happen with `dangerouslyAllowBrowser: true`, but if it does, you may need to proxy through Cloudflare Workers

## 📚 Additional Resources

- **OpenRouter Docs**: https://openrouter.ai/docs
- **Model Pricing**: https://openrouter.ai/models
- **API Keys**: https://openrouter.ai/keys
- **Free Models**: Look for `:free` suffix in model list

## 🎯 Current Status

Based on testing:
- ❌ **AI Service**: Not working (invalid API key)
- ✅ **Fallback Templates**: Working perfectly
- ✅ **Vectorize Integration**: Ready (needs Cloudflare deployment)
- ✅ **Playground Mode**: UI complete, needs AI for generation

**Next Step**: Update your OpenRouter API key in `.env` and restart the dev server!
