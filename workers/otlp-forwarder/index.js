/**
 * OTLP Forwarder Worker
 * 
 * This Cloudflare Worker receives OpenTelemetry data in OTLP/HTTP format
 * and forwards it to Dash0 telemetry platform.
 */

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  'https://chrisboyd.dev',
  'https://www.chrisboyd.dev',
  'http://localhost:1313'
];

// Storage class for telemetry data (simple in-memory for now)
class TelemetryStorage {
  constructor() {
    this.traces = [];
    this.maxStorageSize = 100; // Limit storage to prevent memory issues
  }

  addTrace(trace) {
    console.log('Adding trace to storage:', trace.timestamp);
    this.traces.unshift(trace); // Add to beginning
    // Maintain max size
    if (this.traces.length > this.maxStorageSize) {
      this.traces.pop();
    }
    return true;
  }

  getTraces(limit = 20) {
    console.log(`Getting traces (${this.traces.length} available)`);
    return this.traces.slice(0, limit);
  }
}

// Global storage (note: this will reset on worker restarts)
const storage = new TelemetryStorage();

/**
 * Main handler for all incoming requests
 */
async function handleRequest(request, env) {
  const url = new URL(request.url);
  
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return handleCORS(request);
  }
  
  // Handle trace collection
  if (url.pathname === '/v1/traces' || url.pathname === '/collect') {
    if (request.method === 'POST') {
      return await handleTraceCollection(request, env);
    }
  }
  
  // Handle trace viewing (basic UI)
  if (url.pathname === '/traces' || url.pathname === '/') {
    return await handleTraceViewing(request);
  }
  
  // Simple health check
  if (url.pathname === '/health') {
    return new Response(JSON.stringify({ status: 'ok' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
  
  // 404 for any other paths
  return new Response('Not Found', { status: 404 });
}

/**
 * Handle CORS preflight requests
 */
function handleCORS(request) {
  const origin = request.headers.get('Origin');
  const isAllowedOrigin = ALLOWED_ORIGINS.includes(origin);
  
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': isAllowedOrigin ? origin : ALLOWED_ORIGINS[0],
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 
        'Content-Type, Authorization, Accept, Dash0-Dataset',
      'Access-Control-Max-Age': '86400',
    },
  });
}

/**
 * Forward telemetry data to Dash0
 */
async function forwardToDash0(data, env) {
  try {
    // Get configuration from env
    let endpoint = env.DASH0_ENDPOINT || 'https://ingress.us-west-2.aws.dash0.com:4317';
    
    // Ensure the endpoint has the /v1/traces path
    if (!endpoint.endsWith('/v1/traces')) {
      endpoint = endpoint + '/v1/traces';
    }
    
    const apiKey = env.DASH0_API_KEY;
    const dataset = env.DASH0_DATASET || 'default';
    
    if (!apiKey) {
      console.error('DASH0_API_KEY not configured');
      return false;
    }
    
    console.log('Debug - Forwarding telemetry data:');
    console.log('- Endpoint:', endpoint);
    console.log('- Dataset:', dataset);
    console.log('- API Key present?', !!apiKey);
    
    // Prepare headers for Dash0
    const headers = {
      'Content-Type': 'application/json+otlp',
      'Authorization': `Bearer ${apiKey}`,
      'Dash0-Dataset': dataset
    };
    
    console.log('Debug - Request headers:', JSON.stringify(headers, null, 2));
    
    // Send data to Dash0
    console.log('Debug - Sending request to Dash0');
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(data)
    });
    
    console.log('Debug - Received response from Dash0, status:', response.status);
    
    if (!response.ok) {
      const text = await response.text();
      console.error(`Error forwarding to Dash0: HTTP ${response.status} - ${text}`);
      return false;
    }
    
    console.log(`Successfully forwarded telemetry to Dash0 (dataset: ${dataset})`);
    return true;
  } catch (error) {
    console.error('Error forwarding to Dash0:', error);
    return false;
  }
}

/**
 * Handle incoming trace data
 */
async function handleTraceCollection(request, env) {
  // Check authorization if AUTH_TOKEN is set
  if (env.AUTH_TOKEN) {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : null;
      
    if (token !== env.AUTH_TOKEN) {
      return new Response('Unauthorized', { status: 401 });
    }
  }
  
  try {
    // Get content type
    const contentType = request.headers.get('Content-Type') || '';
    let data;
    
    // Parse the request body based on content type
    if (contentType.includes('application/json')) {
      data = await request.json();
    } else if (contentType.includes('application/x-protobuf')) {
      // For protobuf, just pass through as-is
      data = await request.arrayBuffer();
    } else {
      return new Response('Unsupported content type', { status: 415 });
    }
    
    // Store trace locally
    console.log('Processing incoming trace');
    storage.addTrace({
      timestamp: new Date().toISOString(),
      data: contentType.includes('application/json') ? data : { protobuf: true },
      forwarded: false
    });
    
    // Then try to forward to Dash0
    let forwarded = false;
    try {
      forwarded = await forwardToDash0(data, env);
    } catch (e) {
      console.error('Failed to forward to Dash0:', e);
    }
    
    // Return success
    return createCORSResponse(request, JSON.stringify({ 
      status: 'success',
      forwarded: forwarded
    }), 200);
    
  } catch (error) {
    console.error('Error processing telemetry:', error);
    return createCORSResponse(request, JSON.stringify({ 
      status: 'error',
      error: error.message
    }), 500);
  }
}

/**
 * Handle viewing trace data
 */
async function handleTraceViewing(request) {
  const traces = storage.getTraces();
  
  // Simple HTML interface
  const html = `<!DOCTYPE html>
  <html>
    <head>
      <title>Telemetry Viewer</title>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: system-ui, sans-serif; padding: 2rem; max-width: 1200px; margin: 0 auto; }
        h1 { color: #333; }
        .trace { border: 1px solid #ddd; padding: 1rem; margin-bottom: 1rem; border-radius: 0.5rem; }
        .timestamp { color: #666; margin-bottom: 0.5rem; font-size: 0.9rem; }
        pre { background: #f5f5f5; padding: 1rem; overflow-x: auto; border-radius: 0.25rem; }
        .empty { color: #666; font-style: italic; }
        .badge { display: inline-block; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.75rem; font-weight: bold; }
        .badge-success { background-color: #d4edda; color: #155724; }
        .badge-warning { background-color: #fff3cd; color: #856404; }
      </style>
    </head>
    <body>
      <h1>Telemetry Traces</h1>
      <p>Displaying the ${traces.length} most recent traces collected by this worker.</p>
      ${traces.length === 0 ? '<p class="empty">No traces collected yet.</p>' : ''}
      ${traces.map(trace => `
        <div class="trace">
          <div class="timestamp">
            Received: ${trace.timestamp}
            ${trace.forwarded ? 
              '<span class="badge badge-success">Forwarded to Dash0</span>' : 
              '<span class="badge badge-warning">Not forwarded</span>'}
          </div>
          <pre>${
            trace.data.protobuf 
              ? '[Binary Protobuf data]' 
              : JSON.stringify(trace.data, null, 2)
          }</pre>
        </div>
      `).join('')}
    </body>
  </html>`;
  
  return new Response(html, {
    headers: { 'Content-Type': 'text/html' }
  });
}

/**
 * Create a CORS-enabled response
 */
function createCORSResponse(request, body, status = 200) {
  const origin = request.headers.get('Origin');
  const isAllowedOrigin = ALLOWED_ORIGINS.includes(origin);
  
  return new Response(body, {
    status: status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': isAllowedOrigin ? origin : ALLOWED_ORIGINS[0],
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, Dash0-Dataset'
    }
  });
}

// Export the fetch handler for Cloudflare Workers
export default {
  async fetch(request, env, ctx) {
    return await handleRequest(request, env);
  }
}; 