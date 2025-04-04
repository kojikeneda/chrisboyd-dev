# Cloudflare Worker Telemetry Service

This is a simple Cloudflare Worker that collects telemetry data from the Hugo site and logs it.

## Local Development

To test the worker locally:

```bash
cd telemetry-service/worker-js
./dev.sh
```

This will start the worker locally on port 8787 (or another available port if 8787 is in use).

## Deployment

To deploy the worker to Cloudflare:

1. Make sure you're logged in to Cloudflare:

```bash
npx wrangler login
```

2. Deploy the worker:

```bash
cd telemetry-service/worker-js
./deploy.sh
```

3. After deployment, you'll need to update the endpoint in `static/js/telemetry.js`:

```javascript
const telemetryEndpoint = isProd
  ? 'https://chrisboyd-telemetry.your-username.workers.dev/collect' // Replace with your actual worker URL
  : 'http://localhost:8080/collect';
```

Replace `your-username` with your actual Cloudflare username.

4. Rebuild your Hugo site:

```bash
hugo
```

## How It Works

The worker provides a `/collect` endpoint that accepts POST requests with telemetry data. It handles CORS correctly and logs events, but in a production environment, you might want to enhance it to send data to your analytics service.

## Using with the Hugo Site

When running locally, start both the telemetry service and Hugo server using the development script:

```bash
./dev.sh
```

This will:
1. Start the Go telemetry service on port 8080
2. Start the Hugo server
3. Automatically shut down the telemetry service when the Hugo server stops 