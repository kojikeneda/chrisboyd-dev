// Simple telemetry client for Hugo site
(function() {
  // Determine telemetry endpoint based on environment
  const isProd = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
  
  // Use different endpoints for dev and prod
  const telemetryEndpoint = isProd
    ? 'https://chrisboyd-telemetry.your-username.workers.dev/collect' // Replace with your actual worker URL
    : 'http://localhost:8080/collect'; // Local development endpoint
  
  function sendEvent(name, attributes = {}) {
    const data = {
      name: name,
      url: window.location.href,
      userAgent: navigator.userAgent,
      referrer: document.referrer,
      attributes: attributes
    };
    
    // Log the event to console for debugging
    console.debug('Telemetry: Sending event', name, data);
    
    // Use sendBeacon if available for better performance and to avoid blocking page navigation
    if (navigator.sendBeacon) {
      try {
        const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
        const success = navigator.sendBeacon(telemetryEndpoint, blob);
        if (!success) {
          console.debug('Telemetry: sendBeacon failed, falling back to fetch');
          sendWithFetch(data);
        }
      } catch (e) {
        console.debug('Telemetry: sendBeacon error, falling back to fetch', e);
        sendWithFetch(data);
      }
    } else {
      sendWithFetch(data);
    }
  }
  
  function sendWithFetch(data) {
    // Use fetch with proper CORS mode
    fetch(telemetryEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(data),
      keepalive: true,
      credentials: 'omit' // Don't send cookies
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
  
  // Expose telemetry functions globally
  window.telemetry = {
    sendEvent: sendEvent
  };
  
  // Log that telemetry is initialized
  console.debug('Telemetry initialized. Endpoint:', telemetryEndpoint);
})(); 