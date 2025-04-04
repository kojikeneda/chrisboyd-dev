import { instrument } from 'otel-cf-workers';
import { trace } from '@opentelemetry/api';

// Configure OpenTelemetry
const resolveConfig = (env, trigger) => {
  return {
    exporter: {
      url: env.DASH0_ENDPOINT || 'https://ingress.us-west-2.aws.dash0.com:4317',
      headers: {
        'Authorization': `Bearer ${env.DASH0_API_KEY || ''}`,
        'Dash0-Dataset': env.DASH0_DATASET || 'default'
      }
    },
    service: {
      name: 'chrisboyd-blog',
      version: '1.0.0'
    }
  };
};

// Create the worker handler with instrumentation
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // CORS handling for preflight requests
    if (request.method === 'OPTIONS') {
      return handleCors(request, new Response(null, { status: 204 }));
    }
    
    // Handle telemetry collection endpoint
    if (url.pathname === '/collect' && request.method === 'POST') {
      try {
        const data = await request.json();
        
        // Get a tracer from OpenTelemetry
        const tracer = trace.getTracer('chrisboyd-telemetry');
        
        // Create a span for the received event
        tracer.startActiveSpan(data.name || 'telemetry_event', async (span) => {
          // Add attributes to the span based on incoming data
          for (const [key, value] of Object.entries(data)) {
            if (key !== 'attributes') {
              span.setAttribute(key, value);
            }
          }
          
          // Add custom attributes if provided
          if (data.attributes) {
            for (const [key, value] of Object.entries(data.attributes)) {
              span.setAttribute(key, value);
            }
          }
          
          // End the span
          span.end();
        });
        
        // Return success response
        return handleCors(request, new Response(JSON.stringify({ status: 'ok' }), {
          headers: { 'Content-Type': 'application/json' }
        }));
      } catch (error) {
        // Return error response
        return handleCors(request, new Response(JSON.stringify({ 
          status: 'error', 
          message: error.message 
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }));
      }
    }
    
    // Handle static site content if requested
    // This is optional if you want this worker to also serve your site
    
    // Return 404 for other routes
    return handleCors(request, new Response('Not Found', { status: 404 }));
  }
};

// Helper function to handle CORS
function handleCors(request, response) {
  // Get the origin from the request
  const origin = request.headers.get('Origin') || '*';
  
  // Set CORS headers on the response
  response.headers.set('Access-Control-Allow-Origin', origin);
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  
  // Handle the Access-Control-Request-Headers
  const requestHeaders = request.headers.get('Access-Control-Request-Headers');
  if (requestHeaders) {
    response.headers.set('Access-Control-Allow-Headers', requestHeaders);
  } else {
    response.headers.set('Access-Control-Allow-Headers', 
      'Content-Type, Authorization, Accept, Dash0-Dataset');
  }
  
  // Cache preflight requests for 2 hours
  response.headers.set('Access-Control-Max-Age', '7200');
  
  return response;
}

// Apply OpenTelemetry instrumentation to the worker
export const handler = instrument(resolveConfig); 