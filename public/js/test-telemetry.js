// Test helper for OpenTelemetry on localhost
console.log('🔍 OpenTelemetry Test Helper loaded');

// Helper function to monitor network requests to Dash0
const monitorDash0Requests = () => {
  console.log('🔍 Setting up network request monitoring for Dash0');
  
  // Create a monitoring function for fetch
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    const url = args[0]?.url || args[0];
    
    if (typeof url === 'string' && url.includes('dash0.com')) {
      console.log('📡 Fetch request to Dash0 detected:', url);
      
      // Log request details
      const requestInit = args[1] || {};
      console.log('📡 Request method:', requestInit.method || 'GET');
      
      if (requestInit.headers) {
        const headersCopy = {};
        if (requestInit.headers instanceof Headers) {
          requestInit.headers.forEach((value, key) => {
            headersCopy[key] = key.toLowerCase() === 'authorization' 
              ? value.substring(0, 10) + '...' 
              : value;
          });
        } else {
          Object.keys(requestInit.headers).forEach(key => {
            headersCopy[key] = key.toLowerCase() === 'authorization' 
              ? requestInit.headers[key].substring(0, 10) + '...' 
              : requestInit.headers[key];
          });
        }
        console.log('📡 Request headers:', headersCopy);
      }
      
      if (requestInit.body) {
        try {
          const bodyContent = typeof requestInit.body === 'string' 
            ? JSON.parse(requestInit.body) 
            : requestInit.body;
          console.log('📡 Request body sample:', bodyContent);
        } catch (e) {
          console.log('📡 Request body (non-JSON):', requestInit.body);
        }
      }
      
      // Log the success or failure
      return originalFetch.apply(this, args)
        .then(response => {
          console.log(`✅ Dash0 request completed with status: ${response.status}`);
          response.clone().text().then(text => {
            try {
              const json = JSON.parse(text);
              console.log('📡 Response body:', json);
            } catch (e) {
              if (text.length > 500) {
                console.log('📡 Response text (truncated):', text.substring(0, 500) + '...');
              } else {
                console.log('📡 Response text:', text);
              }
            }
          }).catch(err => {
            console.log('📡 Unable to read response body:', err);
          });
          return response;
        })
        .catch(error => {
          console.error('❌ Dash0 request failed:', error);
          throw error;
        });
    }
    return originalFetch.apply(this, args);
  };
  
  // Create a monitoring function for XMLHttpRequest
  const originalXhrOpen = XMLHttpRequest.prototype.open;
  const originalXhrSetRequestHeader = XMLHttpRequest.prototype.setRequestHeader;
  const originalXhrSend = XMLHttpRequest.prototype.send;
  
  XMLHttpRequest.prototype.requestHeaders = {};
  
  XMLHttpRequest.prototype.open = function(method, url, ...rest) {
    this.url = url;
    this.method = method;
    this.requestHeaders = {};
    
    if (typeof url === 'string' && url.includes('dash0.com')) {
      console.log('📡 XHR request to Dash0 detected:', url);
      console.log('📡 XHR method:', method);
    }
    return originalXhrOpen.apply(this, [method, url, ...rest]);
  };
  
  XMLHttpRequest.prototype.setRequestHeader = function(header, value) {
    if (typeof this.url === 'string' && this.url.includes('dash0.com')) {
      const displayValue = header.toLowerCase() === 'authorization' 
        ? value.substring(0, 10) + '...' 
        : value;
      console.log(`📡 XHR setting header: ${header}:`, displayValue);
      
      if (header.toLowerCase() === 'user-agent' || header.toLowerCase() === 'origin') {
        console.warn(`⚠️ WARNING: Browser will block setting restricted header: ${header}`);
      }
      
      this.requestHeaders[header] = value;
    }
    return originalXhrSetRequestHeader.apply(this, [header, value]);
  };
  
  XMLHttpRequest.prototype.send = function(body) {
    if (typeof this.url === 'string' && this.url.includes('dash0.com')) {
      console.log('📡 XHR headers being sent:', this.requestHeaders);
      
      if (body) {
        try {
          const bodyContent = typeof body === 'string' ? JSON.parse(body) : body;
          console.log('📡 XHR request body sample:', bodyContent);
        } catch (e) {
          if (body && body.length > 500) {
            console.log('📡 XHR request body (truncated):', body.substring(0, 500) + '...');
          } else {
            console.log('📡 XHR request body:', body);
          }
        }
      }
      
      // Monitor the response
      this.addEventListener('load', () => {
        console.log(`✅ Dash0 XHR request completed with status: ${this.status}`);
        try {
          const responseText = this.responseText;
          if (responseText) {
            try {
              const json = JSON.parse(responseText);
              console.log('📡 XHR Response body:', json);
            } catch (e) {
              if (responseText.length > 500) {
                console.log('📡 XHR Response text (truncated):', responseText.substring(0, 500) + '...');
              } else {
                console.log('📡 XHR Response text:', responseText);
              }
            }
          }
        } catch (e) {
          console.log('📡 Unable to read XHR response:', e);
        }
      });
      
      this.addEventListener('error', (e) => {
        console.error('❌ Dash0 XHR request failed:', e);
      });
    }
    return originalXhrSend.apply(this, [body]);
  };
  
  console.log('✅ Network monitoring for Dash0 requests is active');
};

// Patch XHR to check for Unauthorized errors
const patchDash0Authentication = () => {
  // Check for the presence of specific Dash0 auth errors
  const checkResponseForAuthErrors = (responseText) => {
    if (!responseText) return false;
    
    try {
      // If it's JSON, check for auth error messages
      const response = JSON.parse(responseText);
      if (response.error && response.error.includes('auth')) {
        console.error('🔑 AUTHENTICATION ERROR DETECTED:', response.error);
        console.log('⚠️ Token issue detected. Verify your token is correct and not expired.');
        return true;
      }
    } catch (e) {
      // If it's not JSON, check for auth-related text
      if (responseText.includes('Unauthorized') || 
          responseText.includes('Authentication failed') ||
          responseText.includes('invalid token')) {
        console.error('🔑 AUTHENTICATION ERROR DETECTED in response text');
        console.log('⚠️ Token issue detected. Verify your token is correct and not expired.');
        return true;
      }
    }
    return false;
  };
  
  // Monitor XHR responses for auth errors
  const originalXhrSend = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.send = function(body) {
    if (typeof this.url === 'string' && this.url.includes('dash0.com')) {
      this.addEventListener('load', () => {
        if (this.status === 401 || this.status === 403) {
          console.error(`⛔ AUTHENTICATION FAILURE: Received ${this.status} from Dash0`);
          console.log('⚠️ Check that your token is correct and not expired.');
          
          // Get the current token from DASH0_CONFIG
          if (window.DASH0_CONFIG && window.DASH0_CONFIG.auth) {
            const token = window.DASH0_CONFIG.auth;
            console.log(`📋 Token format check: ${token.length} characters, starts with "${token.substring(0, 4)}..."`);
            
            // Check for common token issues
            if (token.includes(' ')) {
              console.warn('⚠️ Token contains spaces. This may cause authentication issues.');
            }
            if (token.includes('\n') || token.includes('\r')) {
              console.warn('⚠️ Token contains newlines. This may cause authentication issues.');
            }
            if (token.startsWith('"') || token.endsWith('"')) {
              console.warn('⚠️ Token has quote characters. This may cause authentication issues.');
            }
          }
          
          checkResponseForAuthErrors(this.responseText);
        }
      });
    }
    return originalXhrSend.apply(this, [body]);
  };
  
  console.log('✅ Dash0 authentication monitoring is active');
};

// Run the monitors as early as possible
monitorDash0Requests();
patchDash0Authentication();

// Wait for OpenTelemetry to initialize
window.addEventListener('load', () => {
  setTimeout(() => {
    console.log('🔍 Checking OpenTelemetry initialization...');
    
    // Check if OpenTelemetry global object exists
    if (window.__OTEL__) {
      console.log('✅ OpenTelemetry is initialized');
      
      // Check Dash0 configuration
      if (window.DASH0_CONFIG && window.DASH0_CONFIG.auth) {
        console.log('✅ Dash0 configuration found');
        console.log(`✅ Environment: ${window.DASH0_CONFIG.environment || 'Not set'}`);
        
        // Mask token for security
        const token = window.DASH0_CONFIG.auth;
        const maskedToken = token.substring(0, 4) + '...' + token.substring(token.length - 4);
        console.log(`✅ Auth token: ${maskedToken}`);
      } else {
        console.error('❌ Dash0 configuration not found');
      }
      
      // Trigger a test span
      if (window.__OTEL__.tracer) {
        const testSpan = window.__OTEL__.tracer.startSpan('test-span');
        testSpan.setAttribute('test.attribute', 'test-value');
        testSpan.addEvent('test-event');
        setTimeout(() => {
          testSpan.end();
          console.log('✅ Test span created and completed');
        }, 1000);
      } else {
        console.error('❌ Tracer not found');
      }
    } else {
      console.error('❌ OpenTelemetry not initialized');
      console.log('📋 Troubleshooting checklist:');
      console.log('1. Check that otel.js is loaded correctly');
      console.log('2. Check that HUGO_DASH0_AUTH_TOKEN is set');
      console.log('3. Check browser console for any errors');
    }
  }, 2000); // Wait 2 seconds to ensure OpenTelemetry has time to initialize
});

// Add a test button to the page
const addTestButton = () => {
  if (document.body) {
    const buttonContainer = document.createElement('div');
    buttonContainer.style.position = 'fixed';
    buttonContainer.style.bottom = '20px';
    buttonContainer.style.right = '20px';
    buttonContainer.style.zIndex = '9999';
    
    const button = document.createElement('button');
    button.textContent = 'Test OpenTelemetry';
    button.style.padding = '10px 20px';
    button.style.backgroundColor = '#4CAF50';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.borderRadius = '4px';
    button.style.cursor = 'pointer';
    
    button.addEventListener('click', () => {
      console.log('🔍 Manual test triggered');
      if (window.__OTEL__ && window.__OTEL__.tracer) {
        const manualTestSpan = window.__OTEL__.tracer.startSpan('manual-test-span');
        manualTestSpan.setAttribute('test.type', 'manual');
        manualTestSpan.addEvent('button-clicked');
        setTimeout(() => {
          manualTestSpan.end();
          console.log('✅ Manual test span created and completed');
          alert('OpenTelemetry test span sent! Check console for details.');
        }, 500);
      } else {
        console.error('❌ Could not create test span - OpenTelemetry not initialized');
        alert('Error: OpenTelemetry not initialized. Check console for details.');
      }
    });
    
    buttonContainer.appendChild(button);
    document.body.appendChild(buttonContainer);
  }
};

// Add the test button once the DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', addTestButton);
} else {
  addTestButton();
} 