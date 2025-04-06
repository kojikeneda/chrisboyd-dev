# ChrisBoyd.dev Technical Specification

## Development Environment

| Component | Technology/Version |
|-----------|-------------------|
| Static Site Generator | Hugo v0.145.0 |
| Local Development | npm scripts, Hugo server |
| Source Control | Git, GitHub |
| CI/CD | Cloudflare Pages Integration |
| Deployment | Cloudflare Pages |
| Telemetry Backend | Cloudflare Workers |
| Analytics | Dash0 Platform |

## Technologies

### Frontend
- **Hugo**: Static site generator
- **HTML5/CSS3**: Markup and styling
- **JavaScript**: Client-side interactions and telemetry
- **PaperMod**: Hugo theme with customizations

### Backend
- **Cloudflare Workers**: Serverless JavaScript for telemetry processing
- **OpenTelemetry**: Standardized observability framework
- **Dash0**: Analytics and monitoring platform

### Infrastructure
- **GitHub**: Source control and CI/CD trigger
- **Cloudflare Pages**: Static site hosting
- **Cloudflare Workers**: Edge computing platform

## Technical Details

### Hugo Configuration
- **Theme**: PaperMod
- **Content**: Markdown files organized in content directory
- **Build Command**: `hugo`
- **Output**: Static HTML, CSS, and JS

### Telemetry Implementation

#### Client-Side (telemetry.js)
- **Event Collection**: Page views, outbound links, site performance
- **Batching**: Events collected and sent in batches of 10 or every 3 seconds
- **Format**: Custom events converted to OpenTelemetry format
- **Transport**: HTTP POST to Cloudflare Worker endpoint

#### Server-Side (Cloudflare Worker)
- **Endpoint**: https://chrisboyd-telemetry.chrisdboyd.workers.dev/collect
- **Processing**: Event normalization, validation, and forwarding
- **Authentication**: API key-based authentication with Dash0
- **Error Handling**: Graceful failure with logging

### Data Format

#### Telemetry Event Structure
```javascript
{
  eventType: string,        // e.g., 'page', 'outbound'
  eventName: string,        // e.g., 'page_view', 'outbound_link_click'
  timestamp: ISO8601 date,  // Event timestamp
  properties: {
    url: string,            // Current page URL
    userAgent: string,      // Browser user agent
    referrer: string,       // Referring URL
    environment: string,    // 'production' or 'development'
    dataset: string,        // Dataset in Dash0
    // Additional event-specific properties
  }
}
```

#### OTLP Conversion
- Events are transformed to OpenTelemetry format before sending to Dash0
- Each event becomes a span with appropriate attributes
- Spans are grouped by service name and version

## Development Workflow

### Local Development
1. Clone the repository: `git clone https://github.com/kojikeneda/chrisboyd-dev.git`
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`
4. Make changes to content, templates, or code
5. Test locally at http://localhost:1313/

### Telemetry Testing
1. Local telemetry server runs at http://localhost:8080/collect
2. telemetry.js automatically detects environment and routes accordingly
3. Test scripts: `npm run test:errors`

### Deployment Process
1. Commit changes to GitHub repository
2. Cloudflare Pages automatically builds and deploys the site
3. Telemetry worker deployed separately: `npm run telemetry:deploy`

## Error Handling

### Client-Side
- Telemetry failures don't affect user experience
- Failed requests are logged but don't break site functionality
- Console debugging available in development mode

### Server-Side
- Worker implements robust error handling
- Failed forwarding attempts are logged
- Rate limiting protects against abuse

## Performance Considerations

- Telemetry.js is lightweight (<5KB minified)
- Batch processing reduces network requests
- Browser idle callbacks minimize impact on page performance
- No blocking resources in the critical rendering path

## Security Protocols

- HTTPS enforced for all communications
- API keys stored securely in Cloudflare Worker environment
- CORS properly configured for the worker
- No sensitive data collected in telemetry 