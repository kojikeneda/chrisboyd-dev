import { test, expect } from '@playwright/test';

test.describe('HTTP Headers Tests', () => {
  test('telemetry script has correct cache control headers', async ({ page, request }) => {
    // Navigate to the home page
    await page.goto('/');
    
    // Find the telemetry script URL
    const scriptElements = await page.$$('script[src*="telemetry"]');
    let telemetryScriptUrl = null;
    
    for (const element of scriptElements) {
      const src = await element.getAttribute('src');
      if (src && src.includes('telemetry')) {
        // Get the full URL
        telemetryScriptUrl = new URL(src, page.url()).toString();
        break;
      }
    }
    
    expect(telemetryScriptUrl, 'Telemetry script not found in page').not.toBeNull();
    
    if (telemetryScriptUrl) {
      // Make a direct request to check headers
      const response = await request.get(telemetryScriptUrl);
      
      // Check status
      expect(response.status(), 'Telemetry script request failed').toBe(200);
      
      // Get and log headers
      const headers = response.headers();
      console.log('Telemetry script headers:', headers);
      
      // Check important headers
      // For cache control - should have some cache limitation
      const cacheControl = headers['cache-control'] || '';
      console.log('Cache-Control:', cacheControl);
      
      // Verify cache control settings - either no-cache or a short max-age
      const hasProperCaching = 
        cacheControl.includes('no-cache') || 
        cacheControl.includes('no-store') ||
        (cacheControl.includes('max-age=') && !cacheControl.includes('max-age=31536000'));
      
      expect(hasProperCaching, 
        'Telemetry script should have proper cache control headers').toBeTruthy();
      
      // Verify content type
      expect(headers['content-type'], 'Wrong content type for telemetry script')
        .toContain('application/javascript');
    }
  });
  
  test('critical resources are loaded without errors', async ({ page }) => {
    // Arrays to track success/failure
    const criticalResources = [
      { type: 'script', includes: 'telemetry' },
      { type: 'stylesheet', includes: 'css' },
      { type: 'img', includes: 'favicon' }
    ];
    
    const resourceStatus = {};
    
    // Listener for successful requests
    page.on('requestfinished', request => {
      const url = request.url();
      
      criticalResources.forEach(resource => {
        if (url.includes(resource.includes)) {
          resourceStatus[`${resource.type}-${resource.includes}`] = {
            status: 'loaded',
            url
          };
        }
      });
    });
    
    // Listener for failed requests
    page.on('requestfailed', request => {
      const url = request.url();
      
      criticalResources.forEach(resource => {
        if (url.includes(resource.includes)) {
          resourceStatus[`${resource.type}-${resource.includes}`] = {
            status: 'failed',
            url,
            error: request.failure().errorText
          };
        }
      });
    });
    
    // Navigate to the home page
    await page.goto('/');
    
    // Wait for network to be idle
    await page.waitForLoadState('networkidle');
    
    // Log resource statuses
    console.log('Critical resource statuses:', resourceStatus);
    
    // Check telemetry resource specifically
    const telemetryResource = resourceStatus['script-telemetry'];
    if (telemetryResource) {
      expect(telemetryResource.status, 
        `Telemetry script failed: ${telemetryResource.error || 'unknown error'}`)
        .toBe('loaded');
    } else {
      // If we don't have a status, the request might not have been detected
      // So we should check if the telemetry script exists and loaded
      const telemetryExists = await page.$$eval(
        'script[src*="telemetry"]',
        scripts => scripts.length > 0
      );
      
      expect(telemetryExists, 'Telemetry script not found or not loaded').toBeTruthy();
    }
  });
}); 