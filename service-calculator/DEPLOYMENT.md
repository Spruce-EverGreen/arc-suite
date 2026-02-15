# Deployment Guide - Service Calculator

## Quick Deploy to Vercel (Recommended)

### Option 1: Deploy via Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Navigate to client directory**:
   ```bash
   cd /Users/aiuser/.openclaw/workspace/projects/ARC_Suite/service-calculator/client
   ```

3. **Deploy**:
   ```bash
   vercel
   ```

4. **Follow prompts**:
   - Link to existing project or create new one
   - Set build settings (auto-detected for Vite)
   - Deploy!

### Option 2: Deploy via Vercel Dashboard

1. **Push to GitHub**:
   ```bash
   cd /Users/aiuser/.openclaw/workspace/projects/ARC_Suite/service-calculator
   git init
   git add .
   git commit -m "Initial commit - Service Calculator"
   git branch -M main
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Connect to Vercel**:
   - Go to https://vercel.com
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Vite settings

3. **Configure Settings** (should be auto-detected):
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. **Deploy**: Click "Deploy" and wait ~1 minute

### Vercel Configuration File (Optional)

Create `vercel.json` in the `client/` directory:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite"
}
```

## Deploy to Netlify

### Via Netlify CLI

1. **Install Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```

2. **Build the project**:
   ```bash
   cd client
   npm run build
   ```

3. **Deploy**:
   ```bash
   netlify deploy --prod --dir=dist
   ```

### Via Netlify Dashboard

1. **Push to Git** (GitHub, GitLab, or Bitbucket)

2. **Connect to Netlify**:
   - Go to https://netlify.com
   - Click "Add new site" → "Import an existing project"
   - Connect your Git provider
   - Select your repository

3. **Configure Build Settings**:
   - **Base directory**: `client`
   - **Build command**: `npm run build`
   - **Publish directory**: `client/dist`

4. **Deploy**: Click "Deploy site"

## Deploy to GitHub Pages

1. **Install gh-pages**:
   ```bash
   cd client
   npm install --save-dev gh-pages
   ```

2. **Update package.json**:
   ```json
   {
     "homepage": "https://<username>.github.io/<repo-name>",
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     }
   }
   ```

3. **Update vite.config.js**:
   ```javascript
   export default defineConfig({
     base: '/<repo-name>/',
     plugins: [react()],
   })
   ```

4. **Deploy**:
   ```bash
   npm run deploy
   ```

## Environment Variables

For production, you'll need to set these environment variables:

- `VITE_API_URL`: Your backend API URL (Supabase or custom)
- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Supabase anon/public key

**Vercel**: Add in Project Settings → Environment Variables  
**Netlify**: Add in Site Settings → Environment Variables

## Custom Domain Setup

### Vercel
1. Go to Project Settings → Domains
2. Add your domain (e.g., `calculator.rodneyramirez.com`)
3. Follow DNS configuration instructions

### Netlify
1. Go to Site Settings → Domain Management
2. Add custom domain
3. Configure DNS records

## Production Checklist

- [ ] Build completes without errors: `npm run build`
- [ ] Preview works locally: `npm run preview`
- [ ] Environment variables configured
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate enabled (auto on Vercel/Netlify)
- [ ] Analytics added (optional)
- [ ] Error tracking added (optional - Sentry)

## Performance Optimization

### Already Included
- ✅ Vite's automatic code splitting
- ✅ Minification in production build
- ✅ Tree-shaking for smaller bundles
- ✅ CSS purging via Tailwind

### Optional Improvements
- Add `react-lazy` for code splitting large components
- Implement service worker for offline support
- Add image optimization (when adding images/logos)
- Enable gzip/brotli compression (auto on Vercel/Netlify)

## Monitoring & Analytics

### Google Analytics (Optional)
```bash
npm install react-ga4
```

Add to `main.jsx`:
```javascript
import ReactGA from 'react-ga4';
ReactGA.initialize('G-XXXXXXXXXX');
```

### Sentry (Error Tracking)
```bash
npm install @sentry/react
```

### Vercel Analytics
Enable in Vercel dashboard (free for hobby plan)

## Rollback

**Vercel**: Go to Deployments → Click previous deployment → Promote to Production  
**Netlify**: Go to Deploys → Click previous deploy → Publish deploy

## Support

- Vercel Docs: https://vercel.com/docs
- Netlify Docs: https://docs.netlify.com
- Vite Docs: https://vitejs.dev/guide/

---

**Recommended**: Deploy to Vercel for best Vite/React experience
