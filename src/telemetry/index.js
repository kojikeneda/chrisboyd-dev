// OpenTelemetry imports
import { trace, context, SpanStatusCode, SpanKind } from '@opentelemetry/api';
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { XMLHttpRequestInstrumentation } from '@opentelemetry/instrumentation-xml-http-request';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { resourceFromAttributes, defaultResource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

// Global diagnostics object for debugging
window.telemetryDiagnostics = {
  initialized: false,
  endpoint: null,
  errors: []
};

/**
 * Initialize OpenTelemetry
 */
function initTelemetry() {
  try {
    // Set up environment detection
    const isProd = window.location.hostname === 'chrisboyd.dev';
    const telemetryEndpoint = isProd
      ? 'https://chrisboyd-otel-worker.chrisdboyd.workers.dev/collect'
      : 'http://localhost:8080/collect';

    // Store endpoint for diagnostics
    window.telemetryDiagnostics.endpoint = telemetryEndpoint;

    // Create a custom resource
    const resource = resourceFromAttributes({
      [SemanticResourceAttributes.SERVICE_NAME]: 'chrisboyd-website',
      [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',
      [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: isProd ? 'production' : 'development'
    }).merge(defaultResource());

    // Configure the OTLP exporter
    const otlpExporter = new OTLPTraceExporter({
      url: telemetryEndpoint,
      headers: {}, // can be used to add custom headers
    });

    // Create the span processor with the exporter
    const spanProcessor = new SimpleSpanProcessor(otlpExporter);

    // Create a provider with the resource
    const provider = new WebTracerProvider({
      resource,
      // In v2, processors are added in the constructor
      spanProcessors: [spanProcessor]
    });

    // Register the provider with the OpenTelemetry API
    provider.register();

    // Register instrumentations for automatic tracing of fetch and XHR
    registerInstrumentations({
      instrumentations: [
        new FetchInstrumentation({
          // Ignore the telemetry endpoint to prevent infinite loops
          ignoreUrls: [telemetryEndpoint]
        }),
        new XMLHttpRequestInstrumentation({
          ignoreUrls: [telemetryEndpoint]
        })
      ],
    });

    // Get a tracer
    const tracer = trace.getTracer('chrisboyd-website');

    // Track page view
    function trackPageView() {
      const url = window.location.href;
      const pathname = window.location.pathname;
      const referrer = document.referrer;
      
      const span = tracer.startSpan('pageview', {
        kind: SpanKind.CLIENT,
        attributes: {
          'page.url': url,
          'page.path': pathname,
          'page.referrer': referrer,
          'page.title': document.title
        }
      });
      
      span.end();
    }

    // Track outbound link clicks
    function trackOutboundLinkClicks() {
      document.addEventListener('click', (event) => {
        const target = event.target.closest('a');
        if (!target) return;
        
        const href = target.href;
        if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;
        
        // Check if this is an outbound link
        if (target.hostname !== window.location.hostname) {
          const span = tracer.startSpan('outbound_link_click', {
            kind: SpanKind.CLIENT,
            attributes: {
              'link.url': href,
              'link.text': target.textContent?.trim() || '',
            }
          });
          
          span.end();
        }
      });
    }

    // Initialize tracking
    trackPageView();
    trackOutboundLinkClicks();

    // Mark as initialized
    window.telemetryDiagnostics.initialized = true;

  } catch (error) {
    console.error('Telemetry initialization failed:', error);
    window.telemetryDiagnostics.errors.push(error.toString());
  }
}

// Initialize telemetry when the page loads
window.addEventListener('load', initTelemetry);

export { initTelemetry }; 