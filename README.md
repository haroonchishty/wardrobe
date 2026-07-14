# Wardrobe VTON

A mobile-first React app for the Replicate virtual try-on model, with a Cloudflare Workers backend proxy.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy the example env file and add your Replicate token:
   ```bash
   cp .env.example .env
   ```
   The `.env` file should contain:
   ```
   REPLICATE_API_TOKEN=your_token_here
   ```

## Local development

Run the Cloudflare Worker in development mode:

```bash
npm run worker:dev
```

In another terminal, start the React app:

```bash
npm run dev
```

The React app will call `http://localhost:8787/api/run-vton` (the local worker).

## Deployment

Deploy both the worker and frontend in one command:

```bash
npm run deploy
```

This will:
1. Build the React app
2. Deploy the Cloudflare Worker
3. Provide your worker URL

After deployment, update your frontend `VITE_API_URL`:

```bash
VITE_API_URL=https://your-worker.your-subdomain.workers.dev npm run build
```

Then redeploy the worker.

## How it works

- **Frontend**: React app hosted on GitHub Pages (static)
- **Backend**: Cloudflare Workers proxy that:
  - Receives requests from the frontend
  - Calls Replicate with your token (server-side)
  - Polls for completion
  - Returns the result with CORS headers

## Why Cloudflare Workers

- Free tier: 100k requests/day
- No cold starts
- Global edge network
- Secrets stored securely on Cloudflare (not in code)
- Single deploy command

## Notes

- `.env` is used locally only — never exposed in frontend or deployed code
- Token is stored securely as a Cloudflare secret
- GitHub Pages hosts the frontend
- Cloudflare Workers handles all Replicate communication

