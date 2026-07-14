# Wardrobe VTON

A mobile-first React app for the Replicate virtual try-on model, with a Cloudflare Workers backend proxy.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy the example env file and add your Replicate and imgbb keys:
   ```bash
   cp .env.example .env
   ```
   The `.env` file should contain:
   ```
   REPLICATE_API_TOKEN=your_token_here
   IMGBB_API_KEY=your_imgbb_api_key
   ```

   Note: Cloudflare Workers do not automatically load values from `.env`. You must also configure these keys as worker secrets for local `wrangler dev` and production deploys.

   ```bash
   wrangler secret put REPLICATE_API_TOKEN
   wrangler secret put IMGBB_API_KEY
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
1. Deploy the Cloudflare Worker
2. Build the React app
3. Publish the frontend to GitHub Pages

Before running this command, set `VITE_API_URL` to your worker URL if you want the built frontend to point to the deployed worker:

```bash
VITE_API_URL=https://your-worker.your-subdomain.workers.dev npm run deploy
```

If you do not set `VITE_API_URL`, the app will build with the default local API URL and may not work in production.

## How it works

- **Frontend**: React app hosted on GitHub Pages (static)
- **Backend**: Cloudflare Workers proxy that:
  - Receives requests from the frontend
  - Calls Replicate with your token (server-side)
  - Polls for completion
  - Returns the result with CORS headers

## New category option

A new optional category field has been added to the app:
- The UI lets you select `upper_body`, `lower_body`, or `dresses`
- That category is forwarded as `category` to the Replicate backend
- If you leave it blank, the model still runs using the existing description field

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

