#!/usr/bin/env node

// Using dynamic import for node-fetch
const { default: fetch } = await import('node-fetch');
const dotenv = await import('dotenv');
dotenv.config();

// URL of Dash0 endpoint
const DASH0_ENDPOINT = 'https://ingress.us-west-2.aws.dash0.com:4317/v1/traces';

// Dash0 API key from environment
const DASH0_API_KEY = process.env.DASH0_API_KEY;

// Dataset to use for tests
const DATASET = 'test-direct-dash0';

if (!DASH0_API_KEY) {
  console.error('Error: DASH0_API_KEY not found in environment');
  process.exit(1);
}

// Create a sample OTLP trace
const createSampleTrace = () => {
  const traceId = randomId(32); // 16 bytes trace ID
  const spanId = randomId(16); // 8 bytes span ID
  
  const now = Date.now();
  const startTime = now - 1000; // 1 second ago
  const endTime = now;
  
  return {
    resourceSpans: [
      {
        resource: {
          attributes: [
            { key: "service.name", value: { stringValue: "test-direct-dash0" } },
            { key: "service.version", value: { stringValue: "1.0.0" } },
            { key: "telemetry.sdk.name", value: { stringValue: "manual-test" } },
            { key: "service.environment", value: { stringValue: "test" } },
            { key: "dash0.dataset", value: { stringValue: DATASET } }
          ]
        },
        scopeSpans: [
          {
            scope: {
              name: "test-scope",
              version: "1.0.0"
            },
            spans: [
              {
                traceId: traceId,
                spanId: spanId,
                name: "test-direct-dash0",
                kind: 1, // INTERNAL
                startTimeUnixNano: startTime * 1000000,
                endTimeUnixNano: endTime * 1000000,
                attributes: [
                  { key: "test.attribute", value: { stringValue: "direct-test-value" } },
                  { key: "event.type", value: { stringValue: "direct-test" } }
                ],
                status: { code: 1 } // OK
              }
            ]
          }
        ]
      }
    ]
  };
};

// Generate a random ID of specified length (hex characters)
function randomId(length) {
  return Array.from(
    { length: length },
    () => Math.floor(Math.random() * 16).toString(16)
  ).join('');
}

// Send the trace directly to Dash0
async function sendDirectToDash0() {
  const trace = createSampleTrace();
  
  console.log('Sending test trace directly to Dash0 at:', DASH0_ENDPOINT);
  console.log('Using dataset:', DATASET);
  
  try {
    const headers = {
      'Content-Type': 'application/json+otlp',
      'Dash0-Dataset': DATASET,
      'Authorization': `Bearer ${DASH0_API_KEY}`
    };
    
    console.log('Request headers (excluding authorization):', JSON.stringify({
      'Content-Type': headers['Content-Type'],
      'Dash0-Dataset': headers['Dash0-Dataset']
    }));
    
    const response = await fetch(DASH0_ENDPOINT, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(trace)
    });
    
    if (response.ok) {
      console.log('Success! Response status:', response.status);
      try {
        const text = await response.text();
        console.log('Response body:', text);
      } catch (e) {
        console.log('No response body or could not parse');
      }
    } else {
      console.error('Error:', response.status, await response.text());
    }
  } catch (error) {
    console.error('Failed to send trace directly to Dash0:', error);
  }
}

// Run the test
await sendDirectToDash0(); 