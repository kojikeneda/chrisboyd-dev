// Simple telemetry client for Hugo site
(function() {
  // Determine telemetry endpoint based on environment
  const isProd = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
  
  // Use different endpoints for dev and prod
  const telemetryEndpoint = isProd
    ? 'https://chrisboyd-telemetry.dash0.workers.dev/collect' // Replace with your actual worker URL if different
    : 'http://localhost:8080/collect'; // Local development endpoint
  
  // Queue to batch events
  let eventQueue = [];
  
  // Batch size and timer configuration
  const MAX_BATCH_SIZE = 10;
  const BATCH_TIMEOUT_MS = 3000;
  let batchTimer = null;
  
  function sendEvent(name, eventProperties = {}) {
    // Create event object in the format expected by the server
    const event = {
      eventType: name.split('_')[0] || 'custom', // e.g. 'page' from 'page_view'
      eventName: name,
      timestamp: new Date().toISOString(),
      properties: {
        url: window.location.href,
        userAgent: navigator.userAgent,
        referrer: document.referrer,
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
    
    // Use sendBeacon if available for better performance and to avoid blocking page navigation
    if (navigator.sendBeacon) {
      try {
        const blob = new Blob([JSON.stringify(events)], { type: 'application/json' });
        const success = navigator.sendBeacon(telemetryEndpoint, blob);
        if (!success) {
          console.debug('Telemetry: sendBeacon failed, falling back to fetch');
          sendWithFetch(events);
        }
      } catch (e) {
        console.debug('Telemetry: sendBeacon error, falling back to fetch', e);
        sendWithFetch(events);
      }
    } else {
      sendWithFetch(events);
    }
  }
  
  function sendWithFetch(events) {
    // Use fetch with proper CORS mode
    fetch(telemetryEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(events),
      keepalive: true,
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
    flush: sendBatch  // Expose method to manually flush queue
  };
  
  // Log that telemetry is initialized
  console.debug('Telemetry initialized. Endpoint:', telemetryEndpoint);
})(); 