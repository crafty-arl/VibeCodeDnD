# 🔗 Connect GitHub to Cloudflare Pages

## ✅ What's Done

- ✅ Code committed to git
- ✅ Code pushed to GitHub: https://github.com/crafty-arl/VibeCodeDnD
- ✅ Latest version deployed to Cloudflare: https://1161e793.glesolas-game.pages.dev
- ✅ Cloudflare Pages project exists: `glesolas-game`

## 🎯 Next Step: Enable Automatic Deployments

To automatically deploy on every git push, connect your GitHub repository to Cloudflare Pages:

### Option 1: Via Cloudflare Dashboard (Recommended)

1. **Go to Cloudflare Dashboard**
   - Visit: https://dash.cloudflare.com/
   - Navigate to: **Workers & Pages** → **glesolas-game**

2. **Connect to GitHub**
   - Click on **Settings** tab
   - Scroll to **Builds & deployments**
   - Click **Connect to Git** or **Set up Git integration**

3. **Select Repository**
   - Choose **crafty-arl/VibeCodeDnD**
   - Select production branch: **main**
   - Set build directory: `glesolas-game`

4. **Configure Build Settings**
   ```
   Framework preset: Vite
   Build command: npm run build
   Build output directory: dist
   Root directory: glesolas-game
   ```

5. **Add Environment Variables**
   - Add the same variables from your `.env` file:
   ```
   VITE_OPENROUTER_API_KEY = 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
   VITE_AI_MODEL = qwen/qwen3-coder-flash
   VITE_AI_ENABLED = true
   ```

6. **Configure Bindings** (for Vectorize)
   - Go to **Settings** → **Functions**
   - Add binding:
     - **Variable name:** `VECTORIZE`
     - **Vectorize index:** `glesolas-cards`
   - Add binding:
     - **Variable name:** `AI`
     - **Type:** Workers AI (auto-configured)

7. **Save and Deploy**
   - Click **Save**
   - Cloudflare will automatically deploy from GitHub

### Option 2: Via GitHub Actions (Alternative)

If you prefer using GitHub Actions, create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    name: Deploy to Cloudflare Pages
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        working-directory: ./glesolas-game
        run: npm install

      - name: Build
        working-directory: ./glesolas-game
        run: npm run build
        env:
          VITE_OPENROUTER_API_KEY: ${{ secrets.VITE_OPENROUTER_API_KEY }}
          VITE_AI_MODEL: qwen/qwen3-coder-flash
          VITE_AI_ENABLED: true

      - name: Publish to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: 6c235bb622d4bca66876392df398234b
          projectName: glesolas-game
          directory: glesolas-game/dist
          gitHubToken: ${{ secrets.GITHUB_TOKEN }}
```

Then add secrets in GitHub Settings → Secrets:
- `VITE_OPENROUTER_API_KEY`
- `CLOUDFLARE_API_TOKEN`

## 🚀 After Setup

Once connected, every time you push to GitHub:

1. Cloudflare Pages automatically detects the push
2. Runs the build command (`npm run build`)
3. Deploys the `dist` folder
4. Creates a unique preview URL for each commit
5. Updates the production URL on main branch

## 📊 Monitor Deployments

- **View deployments:** https://dash.cloudflare.com/ → Workers & Pages → glesolas-game
- **Production URL:** Will be assigned after connecting (e.g., `glesolas-game.pages.dev`)
- **Preview deployments:** Each PR gets its own URL

## 🎮 Current Status

**Latest Deployment:** https://1161e793.glesolas-game.pages.dev

**Features Now Live:**
- ✅ Playground Mode UI
- ✅ AI narrative generation with Qwen3 Coder Flash
- ✅ Campaign Mode with dynamic storytelling
- ✅ Deck management and builder
- ✅ Audio narration
- ✅ PWA support
- ⏸️ Vectorize (needs bindings configuration)

**Next Actions:**
1. Connect GitHub repo (5 minutes)
2. Configure environment variables
3. Add Vectorize bindings
4. Push changes → automatic deployment! 🎉

---

**GitHub Repo:** https://github.com/crafty-arl/VibeCodeDnD
**Latest Commit:** Add playground mode, fix AI generation, and optimize performance
