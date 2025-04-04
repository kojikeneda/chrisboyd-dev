# OpenTelemetry Configuration for chrisboyd.dev

This document outlines how OpenTelemetry is implemented in this Hugo blog to send telemetry data to Dash0.

## Overview

We've implemented browser-based telemetry using the OpenTelemetry JavaScript SDK to collect:
- Page load events and performance metrics
- User interactions (clicks, scrolls)
- External link navigation 
- Search queries
- Error monitoring

## Implementation Details

Unlike the bundled approach recommended in Dash0 documentation, this implementation uses CDN-loaded scripts to simplify deployment in a static Hugo site. The implementation consists of:

1. **`static/js/telemetry.js`** - The main telemetry script
2. **`layouts/partials/extend_head.html`** - The partial that includes the script in production environments

## Configuration

To fully configure the telemetry script for Dash0:

1. Edit `static/js/telemetry.js` and update the exporter configuration:

```javascript
const exporter = new OtelExporterTraceOtlpHttp.OTLPTraceExporter({
  url: 'https://ingress.us-west-2.aws.dash0.com/v1/traces',  // Dash0 ingestion endpoint
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_DASH0_AUTH_TOKEN'  // Replace with your actual Dash0 auth token
  },
});
```

2. Update the service information in the resource attributes:

```javascript
resource: new OtelResources.Resource({
  [OtelSemanticConventions.SemanticResourceAttributes.SERVICE_NAME]: 'chrisboyd-blog',
  [OtelSemanticConventions.SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',
  [OtelSemanticConventions.SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: 'production'
}),
```

## Testing

The telemetry script is configured to only load in production environments (not on localhost). To test locally:

1. Temporarily modify `layouts/partials/extend_head.html` to remove the production condition
2. Open browser console to check for initialization logs or errors
3. Use the Network tab to verify data is being sent to Dash0 endpoint

## Security Considerations

As recommended by Dash0:
- Use an authentication token with restricted permissions for in-browser telemetry 
- Restrict the token to a single dataset and only ingesting permissions
- Consider user privacy when collecting telemetry data

## Extending the Implementation

To customize the telemetry collection:

1. Add more instrumentations in the `instrumentations` array
2. Create additional custom span tracking functions similar to `trackPageView()`
3. Monitor additional user interactions by extending `setupEventTracking()`

## Benefits of this Setup

- **Simplicity**: No build step required for Hugo deployment
- **Performance**: Script loads deferred and only in production
- **Correlation**: Captures data that can correlate with backend services
- **Insights**: Provides real user monitoring data for performance optimization 