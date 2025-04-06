# ChrisBoyd.dev Architecture Document

## System Overview

The ChrisBoyd.dev blog uses a JAMstack architecture with Hugo static site generation, Cloudflare Pages hosting, and a custom telemetry system for analytics.

## Architecture Diagram

```
+-------------------------+     +----------------------+     +------------------------+
|                         |     |                      |     |                        |
|  Hugo Static Generator  +---->|  Cloudflare Pages    +---->|  End User Browser      |
|                         |     |                      |     |                        |
+------------+------------+     +----------+-----------+     +------------+-----------+
             |                              |                              |
             |                              |                              |
             |                              |                              |
             |                              |                              |
+------------v------------+     +----------v-----------+     +------------v-----------+
|                         |     |                      |     |                        |
|  GitHub Repository      |     |  Cloudflare Worker   |<----+  Telemetry.js Script   |
|                         |     |  (Telemetry Handler) |     |                        |
+-------------------------+     +----------+-----------+     +------------------------+
                                            |
                                            |
                               +------------v-----------+
                               |                        |
                               |  Dash0 Analytics       |
                               |  Platform              |
                               |                        |
                               +------------------------+
```

## Component Descriptions

### 1. Hugo Static Site Generator
- **Purpose**: Generates static HTML, CSS, and JavaScript from markdown content and templates
- **Functions**: Content rendering, layout application, asset processing
- **Outputs**: Static website files deployed to Cloudflare Pages

### 2. GitHub Repository
- **Purpose**: Version control and CI/CD trigger
- **Functions**: Store source code, trigger builds on Cloudflare Pages
- **Components**: Hugo content, templates, telemetry code, and Cloudflare Worker code

### 3. Cloudflare Pages
- **Purpose**: Hosting the static website
- **Functions**: Content delivery, domain management, SSL termination
- **Outputs**: Publicly accessible website at chrisboyd.dev

### 4. Telemetry.js Script
- **Purpose**: Client-side analytics data collection
- **Functions**: Track page views, outbound link clicks, and other user interactions
- **Implementation**: Lightweight JavaScript that sends events to Cloudflare Worker
- **Data Flow**: Browser → Cloudflare Worker → Dash0

### 5. Cloudflare Worker (Telemetry Handler)
- **Purpose**: Process and forward telemetry data
- **Functions**: Receive client events, format to OpenTelemetry standard, forward to Dash0
- **URL**: https://chrisboyd-telemetry.chrisdboyd.workers.dev/collect
- **Implementation**: JavaScript worker running on Cloudflare's edge network

### 6. Dash0 Analytics Platform
- **Purpose**: Store and visualize analytics data
- **Functions**: Data storage, analysis, reporting
- **Implementation**: Third-party observability platform

## Data Flow

1. **Content Publishing Flow**:
   - Author creates content in Markdown format
   - Content is committed to GitHub repository
   - Cloudflare Pages builds the site using Hugo
   - Static assets are deployed to Cloudflare's CDN

2. **User Interaction Flow**:
   - User visits chrisboyd.dev
   - Browser loads HTML, CSS, JS including telemetry.js
   - User navigates the site, generating events
   - Events are batched and sent to Cloudflare Worker
   - Worker processes events and forwards to Dash0
   - Dash0 stores data for later analysis

## Technical Decisions

### Static Site Generation
- **Decision**: Use Hugo over other generators (Jekyll, Gatsby, etc.)
- **Rationale**: Speed, simplicity, good theme support, and minimal JavaScript requirements

### Telemetry Implementation
- **Decision**: Custom lightweight telemetry over third-party analytics (Google Analytics, etc.)
- **Rationale**: Privacy-focused, performance optimized, full control over data

### Serverless Worker
- **Decision**: Cloudflare Worker over AWS Lambda or other serverless platforms
- **Rationale**: Tight integration with Cloudflare Pages, edge computing benefits, cost efficiency

## Security Considerations

1. **Data Privacy**:
   - No personal identifiable information (PII) is collected
   - IP addresses are not stored
   - No cookies used for tracking

2. **Data Transmission**:
   - All communication occurs over HTTPS
   - Worker authenticates with Dash0 using API keys

3. **Access Control**:
   - Cloudflare Workers protected by account credentials
   - GitHub repository uses appropriate access controls
   - Dash0 access limited to authorized personnel

## Future Considerations

1. **Performance Enhancements**:
   - Implement Web Vitals monitoring
   - Consider further asset optimizations

2. **Telemetry Expansion**:
   - Track additional user engagement metrics
   - Implement A/B testing capabilities

3. **Content Delivery Optimization**:
   - Consider localization options
   - Implement automatic image optimization 