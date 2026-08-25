# Deploying to Vercel

This repository is pre-configured to deploy seamlessly to **Vercel** with full client-side React (Vite) and serverless backend API support.

---

## Method 1: Deploy via Vercel Dashboard (Recommended with GitHub)

1. Go to [vercel.com/new](https://vercel.com/new) and log in.
2. Select your imported GitHub repository (`webappstore` or your fork).
3. Vercel will automatically detect the settings:
   - **Framework Preset**: Vite
   - **Build Command**: `vite build`
   - **Output Directory**: `dist`
4. Click **Deploy**.
5. Your app and backend API routes (`/api/*`) will be live instantly!

---

## Method 2: Deploy via Vercel CLI

1. Install Vercel CLI locally:
   ```bash
   npm i -g vercel
   ```
2. In the project root directory, run:
   ```bash
   vercel
   ```
3. To deploy to production:
   ```bash
   vercel --prod
   ```

---

## Architecture on Vercel
- **Frontend**: High-speed edge CDN delivery of React + Tailwind SPA from `dist/`.
- **Backend API**: Serverless Node.js functions running under `/api` handling safety checking, favicon resolution, and application management.
