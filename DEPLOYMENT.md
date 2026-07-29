# Deployment Guide

## Quick Fix for Current Issue

Your frontend is deployed but the backend is not running. I've added a **fallback mode** so the Start button will work even without the backend - it will create a basic blueprint locally.

**To enable full AI features, deploy the backend:**

## Backend Deployment (Render)

1. Go to [render.com](https://render.com) and create an account
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: shapentic-server
   - **Branch**: main
   - **Root Directory**: server
   - **Build Command**: npm install
   - **Start Command**: npm start
   - **Runtime**: Node

5. Add Environment Variables:
   - `PORT`: 10000
   - `NODE_ENV`: production
   - `MONGO_URI`: Your MongoDB connection string (get from MongoDB Atlas)
   - `JWT_SECRET`: Generate a random string (use: `openssl rand -base64 32`)
   - Optional AI keys for enhanced features:
     - `ANTHROPIC_API_KEY`: sk-ant-xxxxx
     - `GROQ_API_KEY`: gsk_xxxxx

6. Click "Deploy Web Service"

7. Once deployed, copy your backend URL (e.g., `https://shapentic-server.onrender.com`)

## Frontend Configuration (Vercel)

1. Go to your Vercel project dashboard
2. Go to Settings → Environment Variables
3. Add:
   - `VITE_API_URL`: Your Render backend URL (e.g., `https://shapentic-server.onrender.com`)
4. Redeploy your frontend

## Alternative: Use Local Backend

If you want to run the backend locally while frontend is deployed:

1. Run backend locally:
   ```bash
   cd server
   npm start
   ```

2. Use a tunnel service (ngrok) to expose local backend:
   ```bash
   ngrok http 10000
   ```

3. Update Vercel `VITE_API_URL` to the ngrok URL

## Troubleshooting

**Start button not working:**
- Now has fallback mode - will work without backend
- For full AI features, backend must be deployed

**"Failed to connect to AI backend" error:**
- Backend server must be deployed separately from frontend
- Check browser console for exact error message
- Verify backend is accessible at configured URL

## Local Development Setup

1. Copy environment files:
   ```bash
   cp .env.example server/.env
   cp client/.env.example client/.env.local
   ```

2. For local development, set `VITE_API_URL=http://localhost:10000` in `client/.env.local`

3. Start servers:
   ```bash
   npm run dev
   ```
