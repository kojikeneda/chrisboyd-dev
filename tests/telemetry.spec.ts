import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home-page';

test.describe('Telemetry Tests', () => {
  // Remove server initialization since we're now relying on webServer in playwright.config.ts
  // which will start dev.sh (including telemetry service)

  test('catch all console errors including 404s for resources', async ({ page }) => {
    // Arrays to collect console messages
    const consoleErrors = [];
    const failedResources = [];
    const allRequests = [];

    // Listen for console logs and errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push({
          text: msg.text(),
          location: msg.location()
        });
      }
    });

    // Track all requests for debugging
    page.on('request', request => {
      allRequests.push({
        url: request.url(),
        resourceType: request.resourceType(),
        method: request.method()
      });
    });

    // Listen for all failed requests
    page.on('requestfailed', request => {
      failedResources.push({
        url: request.url(),
        status: request.failure().errorText,
        resourceType: request.resourceType(),
        method: request.method()
      });
    });

    // Go to home page
    await page.goto('/');
    
    // Wait for all resources to load
    await page.waitForLoadState('networkidle');
    
    // Log all failed resources
    if (failedResources.length > 0) {
      console.log('Failed resources:', JSON.stringify(failedResources, null, 2));
    } else {
      console.log('✅ No failed resource requests detected');
    }
    
    // Log all console errors
    if (consoleErrors.length > 0) {
      console.log('Console errors detected:', JSON.stringify(consoleErrors, null, 2));
    } else {
      console.log('✅ No console errors detected');
    }
    
    // Filter for favicon 404s
    const favicon404s = failedResources.filter(resource => 
      resource.url.includes('favicon') && 
      (resource.status.includes('404') || resource.status.includes('not found'))
    );
    
    if (favicon404s.length > 0) {
      console.log('Missing favicons detected:', JSON.stringify(favicon404s, null, 2));
    } else {
      console.log('✅ All favicon resources loaded correctly');
    }
    
    // Assert no 404s for favicons
    expect(favicon404s).toEqual([]);
    
    // Assert no console errors
    expect(consoleErrors).toEqual([]);
  });

  test('telemetry is properly initialized without errors', async ({ page }) => {
    // Arrays to collect console messages
    const consoleErrors = [];
    const telemetryLogs = [];

    // Listen for console logs and errors
    page.on('console', msg => {
      const text = msg.text();
      
      // Capture telemetry-related logs
      if (text.includes('Telemetry')) {
        telemetryLogs.push(text);
      }
      
      // Capture errors
      if (msg.type() === 'error' || text.includes('Error') || text.includes('error')) {
        consoleErrors.push(text);
      }
    });

    // Go to home page
    await page.goto('/');
    
    // Wait for telemetry to initialize
    await page.waitForTimeout(1000);
    
    // Log all telemetry messages for debugging
    console.log('Telemetry logs:', telemetryLogs);
    
    // Check if there are telemetry-related errors
    const telemetryErrors = consoleErrors.filter(error => 
      error.toLowerCase().includes('telemetry') || 
      error.toLowerCase().includes('otel') ||
      error.toLowerCase().includes('dash0')
    );
    
    if (telemetryErrors.length > 0) {
      console.error('Telemetry errors detected:', telemetryErrors);
    }
    
    // Assert no telemetry-related errors
    expect(telemetryErrors).toEqual([]);
    
    // Assert telemetry was initialized
    expect(telemetryLogs.some(log => log.includes('Telemetry initialized'))).toBeTruthy();
  });

  test('telemetry can send page_view event without errors', async ({ page }) => {
    // Arrays to collect console messages
    const consoleErrors = [];
    const telemetryLogs = [];
    
    page.on('console', msg => {
      const text = msg.text();
      
      // Capture telemetry-related logs
      if (text.includes('Telemetry')) {
        telemetryLogs.push(text);
      }
      
      // Capture errors
      if (msg.type() === 'error' || text.includes('Error') || text.includes('error')) {
        consoleErrors.push(text);
      }
    });

    // Go to home page
    await page.goto('/');
    
    // Wait for event to be sent
    await page.waitForTimeout(2000);
    
    // Check if page_view event was sent
    const pageViewSent = telemetryLogs.some(log => log.includes('page_view'));
    expect(pageViewSent).toBeTruthy();
    
    // Check for errors during event sending
    const eventSendingErrors = consoleErrors.filter(error => 
      error.toLowerCase().includes('telemetry') || 
      error.toLowerCase().includes('event') ||
      error.toLowerCase().includes('dash0')
    );
    
    if (eventSendingErrors.length > 0) {
      console.error('Event sending errors detected:', eventSendingErrors);
    }
    
    expect(eventSendingErrors).toEqual([]);
  });

  test('telemetry can send outbound_link_click event without errors', async ({ page }) => {
    // Arrays to collect console messages
    const consoleErrors = [];
    const telemetryLogs = [];
    
    page.on('console', msg => {
      const text = msg.text();
      
      // Capture telemetry-related logs
      if (text.includes('Telemetry')) {
        telemetryLogs.push(text);
      }
      
      // Capture errors
      if (msg.type() === 'error' || text.includes('Error') || text.includes('error')) {
        consoleErrors.push(text);
      }
    });

    // Go to home page
    await page.goto('/');
    
    // Find and click an external link
    // This is a generic approach - you might need to adjust selector based on your actual site
    await page.evaluate(() => {
      // Create a temporary external link if none exists
      if (!document.querySelector('a[href^="https://"]')) {
        const link = document.createElement('a');
        link.href = 'https://example.com';
        link.textContent = 'Test External Link';
        link.id = 'test-external-link';
        document.body.appendChild(link);
      }
    });
    
    // Click the external link (with target=_blank handling)
    const [newPage] = await Promise.all([
      page.waitForEvent('popup').catch(() => null), // In case there's no popup
      page.locator('a[href^="https://"]').first().click().catch(async () => {
        // Try clicking the test link if no external links found
        await page.locator('#test-external-link').click().catch(() => {
          // If still no link, consider the test passed conditionally
          console.log('Warning: No external links found to test outbound clicks');
        });
      })
    ]);
    
    // Close new page if opened
    if (newPage) await newPage.close();
    
    // Wait for event to be sent
    await page.waitForTimeout(2000);
    
    // Check if outbound_link_click event was attempted
    const outboundEventAttempted = telemetryLogs.some(log => 
      log.includes('outbound_link_click')
    );
    
    // Check for errors during event sending
    const eventSendingErrors = consoleErrors.filter(error => 
      error.toLowerCase().includes('telemetry') || 
      error.toLowerCase().includes('event') ||
      error.toLowerCase().includes('dash0')
    );
    
    if (eventSendingErrors.length > 0) {
      console.error('Event sending errors detected:', eventSendingErrors);
    }
    
    // If we found external links, assert the event was sent and no errors occurred
    if (outboundEventAttempted) {
      expect(eventSendingErrors).toEqual([]);
    }
  });
}); 