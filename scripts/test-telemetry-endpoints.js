#!/usr/bin/env node

/**
 * Test script to check multiple telemetry endpoints
 * Usage: node test-telemetry-endpoints.js
 */

// Use cross-fetch for compatibility
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// List of endpoints to test
const ENDPOINTS = [
  'https://chrisboyd-telemetry.chrisdboyd.workers.dev/collect',
  'https://chrisboyd-telemetry.dash0.workers.dev/collect',
  'https://chrisboyd-telemetry.workers.dev/collect'
];

// Simple test event
const testEvent = {
  resourceSpans: [{
    resource: {
      attributes: [
        { key: "service.name", value: { stringValue: "chrisboyd-blog" } },
        { key: "service.version", value: { stringValue: "1.0.0" } },
        { key: "telemetry.sdk.name", value: { stringValue: "test-script" } },
        { key: "dash0.dataset", value: { stringValue: "testing" } }
      ]
    },
    scopeSpans: [{
      scope: {
        name: "test-script",
        version: "1.0.0"
      },
      spans: [{
        traceId: "abcdef0123456789abcdef0123456789",
        spanId: "abcdef0123456789",
        name: "test_event",
        kind: 1,
        startTimeUnixNano: Date.now() * 1000000,
        endTimeUnixNano: (Date.now() + 1) * 1000000,
        attributes: [
          { key: "event.name", value: { stringValue: "test_event" } },
          { key: "event.type", value: { stringValue: "test" } },
          { key: "url", value: { stringValue: "https://chrisboyd.dev" } }
        ],
        status: { code: 1 }
      }]
    }]
  }]
};

// Test each endpoint
async function testEndpoints() {
  console.log('Testing telemetry endpoints...\n');
  
  for (const endpoint of ENDPOINTS) {
    console.log(`Testing endpoint: ${endpoint}`);
    
    try {
      // Make POST request with test event
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Dash0-Dataset': 'testing'
        },
        body: JSON.stringify(testEvent)
      });
      
      // Check response
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Success! (${response.status}): ${JSON.stringify(data)}`);
      } else {
        console.log(`❌ Failed (${response.status}): ${await response.text()}`);
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
    
    console.log(''); // Add empty line between endpoint tests
  }
  
  console.log('Testing complete.');
}

// Run tests
testEndpoints().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
}); 