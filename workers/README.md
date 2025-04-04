# chrisboyd-telemetry

This Cloudflare Worker collects telemetry from chrisboyd.dev and sends it to Dash0 using OpenTelemetry. It integrates with the [otel-cf-workers](https://github.com/evanderkoogh/otel-cf-workers) package for OpenTelemetry support in Cloudflare Workers.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   
   For local development, set them in wrangler.toml or use `wrangler secret put`:
   ```bash
   npx wrangler secret put DASH0_API_KEY
   npx wrangler secret put DASH0_ENDPOINT
   npx wrangler secret put DASH0_DATASET
   ```

   For production, set them in the Cloudflare Dashboard.

## Development

Run the worker locally:
```bash
npm run dev
```

This will start a local server at http://localhost:8089.

## Deployment

Deploy to Cloudflare:
```bash
npm run deploy
```

## Using with Your Hugo Site

Update the telemetry.js file to point to your deployed worker:

```javascript
const telemetryEndpoint = 'https://telemetry.chrisboyd.dev/collect';
```

Or when testing locally:
```javascript
const telemetryEndpoint = 'http://localhost:8089/collect';
```

## How It Works

1. The client sends telemetry data to the `/collect` endpoint
2. The worker creates OpenTelemetry spans from this data
3. The spans are exported to Dash0 using the OTLP exporter
4. CORS is handled automatically for cross-origin requests

## Environment Variables

- `DASH0_API_KEY`: Your Dash0 API key
- `DASH0_ENDPOINT`: The Dash0 endpoint (defaults to 'https://ingress.us-west-2.aws.dash0.com:4317')
- `DASH0_DATASET`: The Dash0 dataset to use (defaults to 'default') 