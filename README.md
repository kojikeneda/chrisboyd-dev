# chrisboyd.dev

Personal website for Chris Boyd, built with Hugo and deployed on Cloudflare Pages.

## Features

- Static site generated with Hugo
- OpenTelemetry integration with Dash0 via Cloudflare Workers
- Self-healing Playwright tests with AI assistance
- Automated workflows with MCP (Mechanical Copilot)
- Idempotent development and deployment commands

## Development

### Prerequisites

- Node.js v14+ and npm
- Hugo v0.80+
- Go 1.18+ (if using the Go telemetry service)

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/kojikeneda/chrisboyd-dev.git
   cd chrisboyd-dev
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development environment (idempotent):
   ```bash
   npm run dev:up
   ```
   This will clean up any existing processes and start fresh.

This script starts both:
- Hugo server on http://localhost:1313
- Go telemetry service on http://localhost:8080

### Idempotent Environment Commands

The following NPM scripts are available to manage your development environment:

```bash
# Start the development environment (both Hugo and telemetry service)
# This is a blocking command. Press Ctrl+C to stop.
npm run dev:up

# Stop all development services (Hugo and telemetry service)
npm run dev:down

# Check the status and logs of running services
npm run dev:logs

# Deploy to production (interactive, will prompt for confirmation)
npm run prod:deploy

# Run a dry-run of production deployment to check prerequisites
npm run prod:deploy -- --dry-run
```

These commands are designed to be idempotent - they will produce the same result regardless of how many times you run them or what state the system is in:

- `dev:up` will first shut down any existing services on ports 1313 and 8080 before starting a new instance
- `dev:down` will ensure all development processes are properly terminated
- `dev:logs` will show you the status of all services and their logs
- `prod:deploy` will guide you through the deployment process with confirmations

You can also access all these commands through the Cursor Command Palette.

### OpenTelemetry Integration

The site integrates with [Dash0](https://dash0.com) for telemetry using OpenTelemetry. This allows tracking of page views, outbound link clicks, and custom events.

### Local Development

For local development, telemetry is sent to a local Go service that forwards it to Dash0. 

When running `npm run dev:up`, the local telemetry service is automatically started.

### Production

For production, telemetry is sent to a Cloudflare Worker that forwards it to Dash0. 

To deploy the Cloudflare Worker:

1. Make sure you have a Dash0 account and API key
2. Add your Dash0 API key to the `.env` file
3. Run `npm run telemetry:deploy` to deploy the worker and rebuild the site

### Telemetry Management Commands

The following commands are available to manage telemetry:

- `npm run telemetry` - Interactive menu for all telemetry operations
- `npm run telemetry:dev` - Start local development with telemetry
- `npm run telemetry:worker` - Deploy just the Cloudflare Worker (without rebuilding the site)
- `npm run telemetry:deploy` - Deploy the Cloudflare Worker and rebuild the site
- `npm run telemetry:build` - Rebuild the Hugo site after telemetry changes
- `npm run telemetry:logs` - View telemetry logs in real-time

### Common Issues

- If you get a "Method not allowed" error, check that you're sending a POST request to the collect endpoint
- If you get a CORS error, check that the worker is properly deployed and accessible
- If telemetry is not showing up in Dash0, check that your API key is correct and that the worker is deployed

### Configuration

To configure the telemetry service, set the following environment variables in the `.env` file:

```
# Dash0 Telemetry Configuration
OTEL_EXPORTER_OTLP_ENDPOINT=ingress.us-west-2.aws.dash0.com:4317
OTEL_SERVICE_NAME=chrisboyd-blog

# Replace with your actual Dash0 API key
DASH0_API_KEY=your-dash0-api-key
DASH0_DATASET=default
```

For local development, the telemetry service runs on port 8080 and is started automatically by the `dev.sh` script.

### Tracked Events

The following events are tracked:
- `page_view`: When a user visits any page
- `outbound_link_click`: When a user clicks on an external link

### Testing Telemetry

To verify that the telemetry system is working properly:

```bash
npm run test:telemetry
```

This will run a full test cycle that verifies:
1. Proper telemetry initialization
2. Event sending without errors
3. CORS configuration
4. Dash0 connectivity

### Automated Telemetry Management

We use MCP (Mechanical Copilot) to automate telemetry workflows. You can access these tools in several ways:

#### Using npm scripts

```bash
# Start local development
npm run telemetry:dev

# Deploy the Cloudflare Worker
npm run telemetry:deploy

# Rebuild the Hugo site
npm run telemetry:build

# Interactive telemetry management
npm run telemetry
```

#### Using Cursor Commands

In Cursor, use Command Palette (Cmd+Shift+P) and search for:

**Development Commands**:
- `Dev: Start Environment (Idempotent)`
- `Dev: Stop Environment (Idempotent)`
- `Dev: Check Logs & Status`
- `Prod: Deploy to Production`

**Telemetry Commands**:
- `Telemetry: Start Local Development`
- `Telemetry: Deploy to Cloudflare`
- `Telemetry: Interactive Management`
- `Telemetry: Rebuild Hugo Site`

#### Using MCP Commands

```bash
# Development Commands
npx mcp dev up     # Start dev environment (idempotent)
npx mcp dev down   # Stop dev environment (idempotent)
npx mcp dev logs   # Check logs and status
npx mcp prod deploy # Deploy to production

# Telemetry Commands
npx mcp telemetry dev
npx mcp telemetry deploy
npx mcp telemetry rebuild
```

### Deployment

For a guided, idempotent production deployment:
```bash
npm run prod:deploy
```

This will interactively:
1. Deploy the telemetry worker to Cloudflare
2. Update the worker URL in your code
3. Rebuild the Hugo site
4. Guide you through finishing the Cloudflare Pages deployment

## Testing

### Telemetry Testing

The project includes extensive tests for telemetry functionality to ensure that events are properly captured and sent without errors:

```bash
# Run the full telemetry testing suite
npm run test:telemetry
```

This command performs a complete test cycle:
1. Stops any running development services
2. Verifies all services are stopped
3. Runs the Playwright tests with telemetry error checking
4. Tests production deployment prerequisites
5. Cleans up after testing

The telemetry tests specifically check for:
- Proper initialization of telemetry
- Successful sending of page_view events
- Successful sending of outbound_link_click events
- Any errors in the console related to telemetry

### General Testing

For running all tests:

```bash
# Run all Playwright tests
npx playwright test

# Run with UI
npx playwright test --ui
```

## Directory Structure

- `content/`: Hugo content files
- `layouts/`: Hugo layout templates
- `static/`: Static assets
- `static/js/telemetry.js`: Client-side telemetry collection
- `telemetry-service/`: Go telemetry service for development
- `telemetry-service/worker-js/`: Cloudflare Worker for telemetry processing
- `tests/`: Playwright tests with AI-assisted self-healing
- `dev.sh`: Development environment script
- `scripts/telemetry.mjs`: Interactive telemetry management script

## Custom MCP (Mechanical Copilot) Implementation

This project includes a custom-built MCP implementation in `scripts/mcp.js` that provides simple command execution without external dependencies. All the commands in the `mcp.config.json` file are executed through this lightweight script.

Benefits of our custom MCP implementation:
- Zero external dependencies 
- Simple JavaScript execution
- Easy to understand and modify
- Works with both simple commands and code blocks
- Supports options like dry-run for deployment

To see all available commands:
```bash
npm run mcp
```

### Command Summary

| Command | Description | Options |
|---------|-------------|---------|
| `npm run dev:up` | Start development environment | None |
| `npm run dev:down` | Stop development environment | None |
| `npm run dev:logs` | Check status and logs | None |
| `npm run prod:deploy` | Deploy to production | `--dry-run` |
| `npm run telemetry` | Interactive telemetry management | None |
| `npm run telemetry:dev` | Start local telemetry | None |
| `npm run telemetry:deploy` | Deploy telemetry worker | None |
| `npm run telemetry:build` | Rebuild Hugo site | None |

## Idempotent Environment Commands

The following NPM scripts are available to manage your development environment:

```bash
# Start the development environment (both Hugo and telemetry service)
# This is a blocking command. Press Ctrl+C to stop.
npm run dev:up

# Stop all development services (Hugo and telemetry service)
npm run dev:down

# Check the status and logs of running services
npm run dev:logs

# Deploy to production (interactive, will prompt for confirmation)
npm run prod:deploy
```