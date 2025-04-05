// OpenTelemetry browser instrumentation
(function() {
  // Load required dependencies
  // These would typically be bundled, but for simplicity we'll use CDN
  const baseUrl = 'https://cdn.jsdelivr.net/npm';
  const dependencies = [
    `${baseUrl}/@opentelemetry/api@1.7.0/build/esm/index.js`,
    `${baseUrl}/@opentelemetry/sdk-trace-web@1.19.0/build/esm/index.js`,
    `${baseUrl}/@opentelemetry/sdk-trace-base@1.19.0/build/esm/index.js`,
    `${baseUrl}/@opentelemetry/resources@1.19.0/build/esm/index.js`,
    `${baseUrl}/@opentelemetry/semantic-conventions@1.19.0/build/esm/index.js`,
    `${baseUrl}/@opentelemetry/instrumentation-xml-http-request@0.46.0/build/esm/index.js`,
    `${baseUrl}/@opentelemetry/instrumentation-fetch@0.46.0/build/esm/index.js`,
    `${baseUrl}/@opentelemetry/instrumentation-user-interaction@0.35.0/build/esm/index.js`,
    `${baseUrl}/@opentelemetry/instrumentation-document-load@0.35.0/build/esm/index.js`,
    `${baseUrl}/@opentelemetry/exporter-trace-otlp-http@0.46.0/build/esm/index.js`
  ];

  // Load all dependencies
  Promise.all(dependencies.map(url => {
    return import(url).catch(err => {
      console.error(`Failed to load dependency from ${url}:`, err);
      return null;
    });
  })).then(modules => {
    if (modules.some(m => m === null)) {
      console.error('Failed to load all OpenTelemetry dependencies');
      return;
    }

    const api = modules[0];
    const webTrace = modules[1];
    const baseTrace = modules[2];
    const resources = modules[3];
    const semconv = modules[4];
    const xhrInstrumentation = modules[5];
    const fetchInstrumentation = modules[6];
    const userInteractionInstrumentation = modules[7];
    const documentLoadInstrumentation = modules[8];
    const otlpTraceExporter = modules[9];

    try {
      // Determine environment
      const isProd = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
      
      // Set up the OTLP HTTP exporter
      const endpoint = isProd 
        ? 'https://chrisboyd-telemetry.chrisdboyd.workers.dev/v1/traces' 
        : 'http://localhost:24318/v1/traces';
      
      // Additional attributes for identification
      const additionalAttributes = {
        'dash0.dataset': isProd ? 'production' : 'development',
      };

      // Create a resource that identifies your application
      const resource = new resources.Resource({
        [semconv.SEMRESATTRS_SERVICE_NAME]: 'chrisboyd-blog',
        [semconv.SEMRESATTRS_SERVICE_VERSION]: '1.0.0',
        ...additionalAttributes
      });

      // Configure the OTLP exporter
      const exporter = new otlpTraceExporter.OTLPTraceExporter({
        url: endpoint,
        headers: {
          'Content-Type': 'application/json',
          'Dash0-Dataset': isProd ? 'production' : 'development'
        }
      });

      // Configure span processor to batch and export completed spans
      const processor = new baseTrace.BatchSpanProcessor(exporter);

      // Create and configure a trace provider
      const provider = new webTrace.WebTracerProvider({
        resource: resource
      });

      // Add the span processor to the provider
      provider.addSpanProcessor(processor);

      // Register the trace provider
      provider.register();

      // Set up instrumentations
      const instrumentations = [
        new xhrInstrumentation.XMLHttpRequestInstrumentation(),
        new fetchInstrumentation.FetchInstrumentation(),
        new userInteractionInstrumentation.UserInteractionInstrumentation(),
        new documentLoadInstrumentation.DocumentLoadInstrumentation()
      ];

      // Register instrumentations
      registerInstrumentations({
        instrumentations: instrumentations,
        tracerProvider: provider,
      });

      // Helper function to register instrumentations (since we don't have the SDK register function in ESM)
      function registerInstrumentations({ instrumentations, tracerProvider }) {
        for (const instrumentation of instrumentations) {
          instrumentation.setTracerProvider(tracerProvider);
          instrumentation.enable();
        }
      }

      // Get a tracer
      const tracer = api.trace.getTracer('chrisboyd-telemetry', '1.0.0');

      // Track outbound links manually (since this is custom behavior we want to keep)
      document.addEventListener('click', function(e) {
        const link = e.target.closest('a');
        if (!link) return;
        
        try {
          const url = new URL(link.href, window.location.origin);
          if (url.hostname !== window.location.hostname) {
            const span = tracer.startSpan('outbound_link_click', {
              attributes: {
                'target_url': link.href,
                'target_hostname': url.hostname
              }
            });
            span.end();
          }
        } catch (e) {
          // Silently fail on invalid URLs
          console.debug('Telemetry: error tracking link click', e);
        }
      });

      // Initialize global diagnostics for debugging purposes
      window.otelDebug = {
        tracer,
        provider,
        api,
        manualEvent: (name, attributes = {}) => {
          const span = tracer.startSpan(name, {
            attributes: {
              ...attributes,
              manual: true
            }
          });
          span.end();
          console.debug(`Telemetry: Manual event ${name} sent`);
        }
      };

      console.debug(`OpenTelemetry initialized successfully. Endpoint: ${endpoint}`);
    } catch (e) {
      console.error('Error initializing OpenTelemetry:', e);
    }
  });
})(); 