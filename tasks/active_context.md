# ChrisBoyd.dev Active Development Context

## Current Focus
**Telemetry System Stabilization**

We are currently working on stabilizing the telemetry system for the ChrisBoyd.dev blog. The primary goal is to ensure reliable data collection and transmission from the client to the Dash0 analytics platform via the Cloudflare Worker.

## Recent Changes

### Telemetry Script Updates
- Updated the worker URL in the telemetry.js script from `https://chrisboyd-telemetry.dash0.workers.dev/collect` to the correct `https://chrisboyd-telemetry.chrisdboyd.workers.dev/collect`
- Added version and timestamp parameters to the script tag to force cache invalidation
- Modified cache headers for telemetry.js to prevent aggressive caching
- Updated the script to handle network errors gracefully

### Worker Deployment
- Redeployed the Cloudflare Worker with the name "chrisboyd-telemetry"
- Added migrations.toml to handle Durable Objects issues
- Fixed CORS configurations to allow requests from all origins
- Verified worker functionality with manual testing

### Cache Configuration
- Added cache control headers to prevent caching of the telemetry script
- Set `no-cache`, `no-store`, and `must-revalidate` directives
- Added timestamp parameters to URLs to bypass caching

## Current State

### Working Components
- Hugo static site generation and deployment to Cloudflare Pages
- Basic telemetry script with page view and outbound link tracking
- Cloudflare Worker deployment and configuration
- GitHub repository setup and CI/CD pipeline

### Ongoing Issues
- Intermittent connectivity issues between telemetry.js and the worker
- Potential caching issues that may serve outdated script versions
- Need to verify data is correctly reaching Dash0 analytics platform

## Technical Details

### Telemetry Script
Current version: 1.0.5
File: `/static/js/telemetry.js`
Script tag in: `/layouts/partials/extend_head.html`

```html
<script src="{{ "js/telemetry.js" | relURL }}?v=1.0.5&t=20250405"></script>
```

### Telemetry Worker
Worker name: chrisboyd-telemetry
Endpoint: https://chrisboyd-telemetry.chrisdboyd.workers.dev/collect
Config file: `/telemetry-service/worker-js/wrangler.toml`

### Cache Configuration
File: `/static/_headers`
```
/js/telemetry.js
  Cache-Control: no-cache, no-store, must-revalidate
  Pragma: no-cache
  Expires: 0
```

## Decision Log

1. **2025-04-05**: Decided to use the native telemetry.js approach instead of OpenTelemetry bundling due to simpler implementation and fewer dependencies
2. **2025-04-05**: Chose to maintain the original worker name "chrisboyd-telemetry" to avoid migration complexities
3. **2025-04-05**: Implemented aggressive cache-busting strategies after encountering persistent caching issues

## Next Actions

1. **Immediate**:
   - Monitor telemetry connections in production to verify consistency
   - Check data flow in Dash0 dashboard to confirm events are being received

2. **Short-term**:
   - Add comprehensive telemetry tests to verify functionality
   - Create automated verification of telemetry health
   - Document the telemetry system architecture and implementation

3. **Medium-term**:
   - Consider implementing Web Vitals tracking
   - Explore additional event tracking opportunities
   - Develop custom Dash0 dashboards for telemetry data visualization 