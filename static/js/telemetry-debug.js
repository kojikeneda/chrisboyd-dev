// Debug script for telemetry issues
(function() {
  // Collect telemetry configuration
  const telemetryScript = document.querySelector('script[src*="telemetry.js"]');
  
  // Check if window.telemetry exists
  const hasGlobalTelemetry = window.telemetry !== undefined;
  
  // Get telemetry endpoint if available
  let telemetryEndpoint = '';
  let datasetValue = '';
  
  try {
    // Try to extract endpoint from the telemetry script
    const scriptContent = Array.from(document.querySelectorAll('script'))
      .filter(script => !script.src) // Inline scripts only
      .map(script => script.textContent)
      .join('\n');
    
    const endpointMatch = scriptContent.match(/telemetryEndpoint\s*=\s*isProd\s*\?\s*['"]([^'"]+)['"]/);
    if (endpointMatch && endpointMatch[1]) {
      telemetryEndpoint = endpointMatch[1];
    }
    
    // Try to get dataset if available
    datasetValue = window.telemetry?.getDataset?.() || '';
  } catch (e) {
    console.error('Error extracting telemetry info:', e);
  }
  
  // Create debug info
  const debugInfo = {
    url: window.location.href,
    telemetryScriptFound: !!telemetryScript,
    telemetryScriptSrc: telemetryScript ? telemetryScript.src : 'Not found',
    hasGlobalTelemetry: hasGlobalTelemetry,
    extractedEndpoint: telemetryEndpoint,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
    datasetValue: datasetValue
  };
  
  // Log debug info to console
  console.log('=== TELEMETRY DEBUG INFO ===');
  console.log(JSON.stringify(debugInfo, null, 2));
  console.log('===========================');
  
  // Add debug info to page
  const debugDiv = document.createElement('div');
  debugDiv.style.position = 'fixed';
  debugDiv.style.bottom = '0';
  debugDiv.style.right = '0';
  debugDiv.style.backgroundColor = 'rgba(0,0,0,0.8)';
  debugDiv.style.color = 'white';
  debugDiv.style.padding = '10px';
  debugDiv.style.fontSize = '12px';
  debugDiv.style.fontFamily = 'monospace';
  debugDiv.style.zIndex = '9999';
  debugDiv.style.maxWidth = '400px';
  debugDiv.style.maxHeight = '200px';
  debugDiv.style.overflow = 'auto';
  
  // Add title and info to debug div
  const title = document.createElement('h4');
  title.textContent = 'Telemetry Debug';
  title.style.margin = '0 0 5px 0';
  debugDiv.appendChild(title);
  
  // Add content as preformatted text
  const pre = document.createElement('pre');
  pre.textContent = JSON.stringify(debugInfo, null, 2);
  pre.style.margin = '0';
  pre.style.fontSize = '10px';
  debugDiv.appendChild(pre);
  
  // Add a test button
  const testButton = document.createElement('button');
  testButton.textContent = 'Test Telemetry Endpoint';
  testButton.style.marginTop = '5px';
  testButton.style.padding = '5px';
  testButton.onclick = function() {
    // Try both endpoints
    const endpoints = [
      telemetryEndpoint,
      telemetryEndpoint.replace('/v1/traces', '/collect'),
      'https://chrisboyd-telemetry.chrisdboyd.workers.dev/v1/traces',
      'https://chrisboyd-telemetry.dash0.workers.dev/collect'
    ];
    
    endpoints.forEach(endpoint => {
      if (!endpoint) return;
      
      fetch(endpoint, {
        method: 'OPTIONS',
        mode: 'cors'
      })
      .then(response => {
        console.log(`Test result for ${endpoint}: ${response.status} ${response.statusText}`);
        
        // Update debug info with test result
        const resultDiv = document.createElement('div');
        resultDiv.textContent = `${endpoint.split('/').pop()}: ${response.status}`;
        resultDiv.style.color = response.ok ? 'lightgreen' : 'salmon';
        debugDiv.appendChild(resultDiv);
      })
      .catch(error => {
        console.error(`Test error for ${endpoint}:`, error);
        
        // Update debug info with error result
        const resultDiv = document.createElement('div');
        resultDiv.textContent = `${endpoint.split('/').pop()}: Error: ${error.message}`;
        resultDiv.style.color = 'salmon';
        debugDiv.appendChild(resultDiv);
      });
    });
  };
  
  debugDiv.appendChild(testButton);
  
  // Add close button
  const closeButton = document.createElement('button');
  closeButton.textContent = 'Close';
  closeButton.style.marginTop = '5px';
  closeButton.style.marginLeft = '5px';
  closeButton.style.padding = '5px';
  closeButton.onclick = function() {
    document.body.removeChild(debugDiv);
  };
  
  debugDiv.appendChild(closeButton);
  
  // Add to page when loaded
  if (document.body) {
    document.body.appendChild(debugDiv);
  } else {
    window.addEventListener('load', function() {
      document.body.appendChild(debugDiv);
    });
  }
})(); 