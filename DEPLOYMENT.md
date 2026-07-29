# Deployment Guide

## Frontend (Vercel)

1. Deploy the client to Vercel:
   ```bash
   cd client
   npm run build
   ```
2. Connect your GitHub repo to Vercel
3. Set environment variable in Vercel:
   - `VITE_API_URL`: Your deployed backend URL (e.g., https://shapentic-server.onrender.com)

## Backend (Render)

1. Create a Render account
2. Connect your GitHub repo
3. Use the provided `render.yaml` configuration
4. Set environment variables in Render dashboard:
   - `PORT`: 10000
   - `MONGO_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Your JWT secret
   - Optional: AI API keys (ANTHROPIC_API_KEY, GROQ_API_KEY, etc.)

## Troubleshooting

**Start button not working:**
- Ensure backend server is running
- Check `VITE_API_URL` is set correctly in client `.env`
- Verify CORS configuration in server allows your frontend URL

**"Failed to connect to AI backend" error:**
- Backend server must be deployed separately from frontend
- Check browser console for exact error message
- Verify backend is accessible at configured URL

## Local Development Setup

1. Copy environment files:
   ```bash
   cp .env.example server/.env
   cp client/.env.example client/.env
   ```

2. For local development, set `VITE_API_URL=http://localhost:10000` in `client/.env`

3. Start servers:
   ```bash
   npm run dev
   ```
