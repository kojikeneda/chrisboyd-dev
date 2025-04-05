// Simple telemetry client for Hugo site
// Version: 1.0.2 - Clean implementation
(function() {
  // Determine telemetry endpoint based on environment
  const isProd = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
  
  // Use different endpoints for dev and prod
  // IMPORTANT: Do not change this URL without thorough testing
  const telemetryEndpoint = isProd ? 'https://chrisboyd-telemetry.chrisdboyd.workers.dev/v1/traces' // OpenTelemetry OTLP/HTTP endpoint
    : 'http://localhost:24318/v1/traces'; // Local OTLP development endpoint
  
  // Authentication token - in production, this would be set securely
  const authToken = isProd ? null : 'chrisboyd-dev-token-123';
  
  // Dataset configuration
  const dataset = isProd ? 'production' : 'development';
  
  // Queue to batch events
  let eventQueue = [];
  
  // Batch size and timer configuration
  const MAX_BATCH_SIZE = 10;
  const BATCH_TIMEOUT_MS = 3000;
  let batchTimer = null;
  
  // Helper to format timestamp to OTLP format (nanoseconds)
  function formatTimestamp(date) {
    return {
      seconds: Math.floor(date.getTime() / 1000),
      nanos: (date.getTime() % 1000) * 1000000
    };
  }
  
  // Convert our simple events to OTLP format
  function eventsToOTLP(events) {
    const now = new Date();
    const resource = {
      attributes: [
        { key: "service.name", value: { stringValue: "chrisboyd-blog" } },
        { key: "service.version", value: { stringValue: "1.0.0" } },
        { key: "telemetry.sdk.name", value: { stringValue: "custom-js" } },
        { key: "telemetry.sdk.version", value: { stringValue: "1.0.0" } },
        { key: "service.environment", value: { stringValue: isProd ? "production" : "development" } },
        { key: "dash0.dataset", value: { stringValue: dataset } }
      ]
    };
    
    const scopeSpans = [{
      scope: {
        name: "chrisboyd-telemetry",
        version: "1.0.0"
      },
      spans: events.map(event => {
        const startTime = new Date(event.timestamp);
        const endTime = new Date(startTime.getTime() + 1); // 1ms duration
        
        const attributes = [
          { key: "event.name", value: { stringValue: event.eventName } },
          { key: "event.type", value: { stringValue: event.eventType } }
        ];
        
        // Add all properties as attributes
        for (const [key, value] of Object.entries(event.properties || {})) {
          if (value !== undefined && value !== null) {
            attributes.push({
              key: key,
              value: { stringValue: String(value) }
            });
          }
        }
        
        return {
          traceId: crypto.randomUUID().replace(/-/g, ''),
          spanId: crypto.randomUUID().replace(/-/g, '').substring(0, 16),
          name: event.eventName,
          kind: 1, // SPAN_KIND_INTERNAL
          startTimeUnixNano: startTime.getTime() * 1000000,
          endTimeUnixNano: endTime.getTime() * 1000000,
          attributes: attributes,
          status: { code: 1 } // STATUS_CODE_OK
        };
      })
    }];
    
    return {
      resourceSpans: [{
        resource: resource,
        scopeSpans: scopeSpans
      }]
    };
  }
  
  function sendEvent(name, eventProperties = {}) {
    // Create event object
    const event = {
      eventType: name.split('_')[0] || 'custom', // e.g. 'page' from 'page_view'
      eventName: name,
      timestamp: new Date().toISOString(),
      properties: {
        url: window.location.href,
        userAgent: navigator.userAgent,
        referrer: document.referrer,
        environment: isProd ? "production" : "development",
        dataset: dataset,
        ...eventProperties
      }
    };
    
    // Log the event to console for debugging
    console.debug('Telemetry: Queueing event', name, event);
    
    // Add to queue
    eventQueue.push(event);
    
    // Send immediately if batch size reached
    if (eventQueue.length >= MAX_BATCH_SIZE) {
      sendBatch();
    } else if (!batchTimer) {
      // Start timer to send batch after timeout
      batchTimer = setTimeout(sendBatch, BATCH_TIMEOUT_MS);
    }
  }
  
  function sendBatch() {
    // Clear timer
    if (batchTimer) {
      clearTimeout(batchTimer);
      batchTimer = null;
    }
    
    // Skip if queue is empty
    if (eventQueue.length === 0) return;
    
    // Get events to send
    const events = [...eventQueue];
    eventQueue = [];
    
    // Log for debugging
    console.debug('Telemetry: Sending batch of', events.length, 'events');
    
    // Convert events to OTLP format
    const otlpData = eventsToOTLP(events);
    
    // Headers for the request
    const headers = {
      'Content-Type': 'application/json',
    };
    
    // Add authentication if available
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    // Add dataset header for Dash0
    headers['Dash0-Dataset'] = dataset;
    
    // Use fetch for the request
    fetch(telemetryEndpoint, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(otlpData),
      keepalive: true,
      mode: 'cors',
      credentials: 'omit' // Don't send cookies to avoid CORS issues
    }).then(response => {
      if (response.ok) {
        console.debug('Telemetry: Successfully sent data');
      } else {
        console.debug('Telemetry: HTTP error', response.status);
      }
    }).catch(error => {
      // Silently fail - telemetry should never affect user experience
      console.debug('Telemetry error:', error);
    });
  }
  
  // Track page views - use requestIdleCallback if available to avoid impacting page load performance
  if (window.requestIdleCallback) {
    window.requestIdleCallback(function() {
      sendEvent('page_view');
    });
  } else {
    // Fallback for browsers without requestIdleCallback
    window.addEventListener('load', function() {
      setTimeout(function() {
        sendEvent('page_view');
      }, 1000); // Delay by 1 second to ensure page is fully loaded
    });
  }
  
  // Track outbound links
  document.addEventListener('click', function(e) {
    const link = e.target.closest('a');
    if (!link) return;
    
    try {
      const url = new URL(link.href, window.location.origin);
      if (url.hostname !== window.location.hostname) {
        sendEvent('outbound_link_click', { 
          target_url: link.href 
        });
      }
    } catch (e) {
      // Silently fail on invalid URLs
      console.debug('Telemetry: error tracking link click', e);
    }
  });
  
  // Send any queued events before page unload
  window.addEventListener('beforeunload', function() {
    if (eventQueue.length > 0) {
      sendBatch();
    }
  });
  
  // Expose telemetry functions globally
  window.telemetry = {
    sendEvent: sendEvent,
    flush: sendBatch,  // Expose method to manually flush queue
    getDataset: () => dataset // Expose method to get current dataset
  };
  
  // Log that telemetry is initialized
  console.debug(`Telemetry initialized. Endpoint: ${telemetryEndpoint}, Dataset: ${dataset}`);
})(); 