#!/usr/bin/env node

// Using dynamic import for node-fetch
const { default: fetch } = await import('node-fetch');
const dotenv = await import('dotenv');
dotenv.config();

// URL of our telemetry endpoint
const TELEMETRY_ENDPOINT = 'https://chrisboyd-telemetry.chrisdboyd.workers.dev/v1/traces';

// Auth token from environment
const AUTH_TOKEN = process.env.AUTH_TOKEN;

// Dataset to use for tests
const DATASET = 'test-script-dataset';

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
            { key: "service.name", value: { stringValue: "test-script" } },
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
                name: "test-span",
                kind: 1, // INTERNAL
                startTimeUnixNano: startTime * 1000000,
                endTimeUnixNano: endTime * 1000000,
                attributes: [
                  { key: "test.attribute", value: { stringValue: "test-value" } },
                  { key: "event.type", value: { stringValue: "test" } }
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

// Send the trace to our endpoint
async function sendTrace() {
  const trace = createSampleTrace();
  
  console.log('Sending test trace to:', TELEMETRY_ENDPOINT);
  console.log('Using dataset:', DATASET);
  
  try {
    const headers = {
      'Content-Type': 'application/json',
      'Dash0-Dataset': DATASET
    };
    
    if (AUTH_TOKEN) {
      headers['Authorization'] = `Bearer ${AUTH_TOKEN}`;
      console.log('Using authorization token from environment');
    } else {
      console.log('No authorization token found in environment');
    }
    
    console.log('Request headers:', JSON.stringify(headers));
    
    const response = await fetch(TELEMETRY_ENDPOINT, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(trace)
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('Success! Response:', data);
    } else {
      console.error('Error:', response.status, await response.text());
    }
  } catch (error) {
    console.error('Failed to send trace:', error);
  }
}

// Run the test
await sendTrace(); 