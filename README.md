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

We provide commands that always work regardless of the current state:

```bash
# Start development environment (kills existing processes first)
npm run dev:up

# Stop development environment (ensures all processes are stopped)
npm run dev:down

# Check status and logs of development environment
npm run dev:logs

# Deploy to production (interactive, step-by-step process)
npm run prod:deploy
```

These commands ensure consistent behavior every time they're run.

### OpenTelemetry Integration

The site uses OpenTelemetry to collect telemetry data and send it to Dash0:

1. **Client-side**: `static/js/telemetry.js` captures events and sends them to the telemetry endpoint
2. **Cloudflare Worker**: `telemetry-service/worker-js/` contains a Cloudflare Worker that processes telemetry data

For local development, the telemetry endpoint is set to `http://localhost:8080/collect`. In production, it points to your deployed worker URL.

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

The project includes Playwright tests with AI-assisted self-healing capabilities:

```bash
npx playwright test
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