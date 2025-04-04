/**
 * Cloudflare Worker for telemetry collection
 * Uses OpenTelemetry for tracing
 */

import { instrument } from '@microlabs/otel-cf-workers';
import { trace } from '@opentelemetry/api';

/**
 * Configure OpenTelemetry
 */
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
      name: env.OTEL_SERVICE_NAME || 'chrisboyd-blog',
      version: '1.0.0'
    }
  };
};

/**
 * Main request handler
 */
const handleRequest = async (request, env, ctx) => {
  const url = new URL(request.url);
  
  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    return handleCors(request, new Response(null, { status: 204 }));
  }
  
  // Only handle requests to the /collect endpoint
  if (url.pathname === '/collect') {
    if (request.method === 'POST') {
      try {
        // Parse the JSON request body - expect an array of events
        const events = await request.json();
        
        // Get tracer from the instrumentation
        const tracer = trace.getTracer('chrisboyd-telemetry');
        
        // Process array of events
        if (Array.isArray(events)) {
          console.log(`Processing ${events.length} telemetry events`);
          
          // Process each event
          for (const event of events) {
            processEvent(event, tracer);
          }
        } else {
          // Handle single event object
          console.log('Processing single telemetry event');
          processEvent(events, tracer);
        }
        
        // Return success response
        return respondWithJson({ 
          status: 'success', 
          message: `Processed ${Array.isArray(events) ? events.length : 1} events` 
        }, 200, request);
      } catch (error) {
        console.error('Error processing telemetry events:', error);
        return respondWithJson({ error: 'Failed to process events' }, 400, request);
      }
    } else {
      // Only accept POST requests
      return respondWithJson({ error: 'Method not allowed' }, 405, request);
    }
  }
  
  // Return 404 for other paths
  return respondWithJson({ error: 'Not found' }, 404, request);
};

/**
 * Process a single telemetry event
 */
function processEvent(event, tracer) {
  try {
    // Extract event properties or use defaults
    const eventType = event.eventType || 'custom';
    const eventName = event.eventName || 'unknown';
    const properties = event.properties || {};
    
    // Create span name from event type and name
    const spanName = `process_${eventType}`;
    
    // Create and configure span
    tracer.startActiveSpan(spanName, span => {
      // Add all properties as span attributes
      for (const [key, value] of Object.entries(properties)) {
        if (value !== undefined && value !== null) {
          span.setAttribute(key, String(value));
        }
      }
      
      // Add event metadata
      span.setAttribute('telemetry.event_type', eventType);
      span.setAttribute('telemetry.event_name', eventName);
      
      if (event.timestamp) {
        span.setAttribute('telemetry.timestamp', event.timestamp);
      }
      
      // Log the event for debugging in dashboard
      console.log(`Processed event: ${eventType}/${eventName}`);
      
      // End the span
      span.end();
    });
  } catch (error) {
    console.error(`Error processing event: ${error.message}`);
  }
}

/**
 * Helper function to handle CORS and return JSON
 */
function respondWithJson(data, status, request) {
  return handleCors(
    request,
    new Response(JSON.stringify(data), {
      status,
      headers: { 'Content-Type': 'application/json' }
    })
  );
}

/**
 * Helper function to handle CORS
 */
function handleCors(request, response) {
  // Get the origin from the request
  const origin = request.headers.get('Origin') || '*';
  
  // Set CORS headers
  response.headers.set('Access-Control-Allow-Origin', origin);
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 
    'Content-Type, Authorization, Accept, Dash0-Dataset');
  response.headers.set('Access-Control-Max-Age', '7200');
  
  return response;
}

// Apply OpenTelemetry instrumentation
export default {
  fetch: instrument(resolveConfig)(handleRequest)
}; 