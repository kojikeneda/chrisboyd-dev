/**
 * Simplified Cloudflare Worker for telemetry collection
 * This version logs events to the console and doesn't use OpenTelemetry
 * For production, you would integrate with your analytics backend
 */

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event));
});

/**
 * Handle incoming requests
 * @param {FetchEvent} event
 */
async function handleRequest(event) {
  const request = event.request;
  const url = new URL(request.url);
  
  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    return handleCors(request);
  }
  
  // Only handle requests to the /collect endpoint
  if (url.pathname === '/collect') {
    if (request.method === 'POST') {
      try {
        // Parse the JSON request body
        const eventData = await request.json();
        
        // Log the event data (in production we would send this to an analytics backend)
        console.log(`Received telemetry event: ${eventData.name} from ${eventData.url}`);
        
        // Return a successful response
        return new Response(
          JSON.stringify({ status: 'ok' }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders(request)
            }
          }
        );
      } catch (error) {
        // Handle parsing errors
        return new Response(
          JSON.stringify({ error: 'Invalid request body' }),
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders(request)
            }
          }
        );
      }
    } else {
      // Return 405 Method Not Allowed for non-POST requests to /collect
      return new Response(
        null,
        {
          status: 405,
          headers: corsHeaders(request)
        }
      );
    }
  }
  
  // Handle all other requests with a 404
  return new Response(
    'Not Found',
    {
      status: 404,
      headers: corsHeaders(request)
    }
  );
}

/**
 * Handle CORS preflight requests
 * @param {Request} request
 */
function handleCors(request) {
  return new Response(
    null,
    {
      status: 204,
      headers: corsHeaders(request)
    }
  );
}

/**
 * Generate CORS headers based on request origin
 * @param {Request} request
 */
function corsHeaders(request) {
  const origin = request.headers.get('Origin');
  const headers = {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Max-Age': '7200'
  };
  
  // Handle Access-Control-Request-Headers
  const requestHeaders = request.headers.get('Access-Control-Request-Headers');
  if (requestHeaders) {
    headers['Access-Control-Allow-Headers'] = requestHeaders;
  } else {
    headers['Access-Control-Allow-Headers'] = 
      'Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization';
  }
  
  return headers;
} 