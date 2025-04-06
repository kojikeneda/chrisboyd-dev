import { test, expect } from '@playwright/test';

test.describe('Comprehensive Site Health Check', () => {
  test('validates entire page structure and resources', async ({ page }) => {
    // Collect different types of issues
    const consoleErrors = [];
    const networkIssues = [];
    const javascriptErrors = [];
    const resourceSizes = new Map();
    const loadTimes = new Map();
    const startTime = Date.now();

    // Listen for all console messages
    page.on('console', msg => {
      // Save all messages for inspection
      if (msg.type() === 'error' || msg.text().toLowerCase().includes('error')) {
        consoleErrors.push({
          type: msg.type(),
          text: msg.text(),
          location: msg.location()
        });
      }
      
      // Watch specifically for JS errors
      if (msg.type() === 'error' && msg.text().includes('Error')) {
        javascriptErrors.push(msg.text());
      }
    });

    // Track all requests
    page.on('request', request => {
      const startTime = Date.now();
      loadTimes.set(request.url(), { startTime });
    });

    page.on('response', response => {
      const request = response.request();
      const url = request.url();
      const data = loadTimes.get(url) || {};
      
      // Record response time
      data.endTime = Date.now();
      data.duration = data.endTime - (data.startTime || data.endTime);
      
      // Record response status
      data.status = response.status();
      
      // Record content length if available
      const headers = response.headers();
      if (headers['content-length']) {
        data.size = parseInt(headers['content-length'], 10);
      }
      
      // Record content type
      data.contentType = headers['content-type'] || 'unknown';
      
      // Update data
      loadTimes.set(url, data);
      
      // Track if any essential resources are excessively large
      if (
        data.size && 
        ((url.includes('.js') && data.size > 500000) || // JS over 500KB
         (url.includes('.css') && data.size > 100000) || // CSS over 100KB
         (url.includes('.jpg') && data.size > 1000000)) // Images over 1MB
      ) {
        resourceSizes.set(url, {
          size: data.size,
          type: data.contentType
        });
      }
      
      // Track slow responses
      if (data.duration > 1000) { // Responses taking over 1 second
        networkIssues.push({
          url,
          duration: data.duration,
          status: data.status,
          type: request.resourceType()
        });
      }
      
      // Track non-successful responses for important resources
      if (data.status >= 400 && !url.includes('favicon')) {
        networkIssues.push({
          url,
          status: data.status,
          type: request.resourceType(),
          errorText: 'HTTP error'
        });
      }
    });

    // Track failed requests
    page.on('requestfailed', request => {
      networkIssues.push({
        url: request.url(),
        type: request.resourceType(),
        errorText: request.failure()?.errorText || 'Unknown error'
      });
    });

    // Navigate to the home page with a generous timeout
    await page.goto('/', { timeout: 30000 });
    
    // Wait for the network to be fully idle
    await page.waitForLoadState('networkidle', { timeout: 30000 });
    
    // Calculate total page load time
    const totalLoadTime = Date.now() - startTime;
    console.log(`Total page load time: ${totalLoadTime}ms`);
    
    // Check for telemetry script
    const telemetryScripts = await page.$$('script[src*="telemetry"]');
    console.log(`Found ${telemetryScripts.length} telemetry scripts`);
    expect(telemetryScripts.length, 'No telemetry script found').toBeGreaterThan(0);
    
    // Check if any telemetry script is broken (has wrong src format)
    for (const script of telemetryScripts) {
      const src = await script.getAttribute('src');
      console.log(`Telemetry script src: ${src}`);
      
      // Verify src format - should include version and timestamp for cache busting
      const hasVersion = src.includes('v=') || src.includes('version=');
      if (!hasVersion) {
        console.error(`Telemetry script missing version parameter: ${src}`);
      }
      
      expect(hasVersion, 'Telemetry script missing version parameter').toBeTruthy();
    }
    
    // Check for meta tags
    const metaTags = await page.$$('meta');
    console.log(`Found ${metaTags.length} meta tags`);
    
    // Check for basic required meta tags (viewport, description)
    const hasViewport = await page.$('meta[name="viewport"]') !== null;
    const hasDescription = await page.$('meta[name="description"]') !== null;
    
    expect(hasViewport, 'Missing viewport meta tag').toBeTruthy();
    expect(hasDescription, 'Missing description meta tag').toBeTruthy();
    
    // Check for broken images
    const images = await page.$$('img');
    for (const img of images) {
      const src = await img.getAttribute('src');
      if (src) {
        // Verify image has loaded properly
        const isLoaded = await img.evaluate(el => el.complete && el.naturalWidth > 0);
        if (!isLoaded) {
          console.error(`Broken image found: ${src}`);
          networkIssues.push({
            url: src,
            type: 'img',
            errorText: 'Image failed to load'
          });
        }
      }
    }
    
    // Record all findings
    console.log('Console errors:', consoleErrors);
    console.log('Network issues:', networkIssues);
    console.log('JavaScript errors:', javascriptErrors);
    console.log('Large resources:', [...resourceSizes.entries()]);
    
    // Filter out known acceptable issues (like favicon 404s)
    const significantNetworkIssues = networkIssues.filter(issue => 
      !issue.url.includes('favicon')
    );
    
    // Perform assertions
    expect(consoleErrors, 'Console errors detected').toEqual([]);
    expect(significantNetworkIssues, 'Network issues detected').toEqual([]);
    expect(javascriptErrors, 'JavaScript errors detected').toEqual([]);
    
    // Check page performance
    expect(totalLoadTime, 'Page load time exceeds threshold').toBeLessThan(5000);
  });
  
  test('verifies telemetry functionality', async ({ page }) => {
    // Arrays to collect telemetry-related information
    const telemetryMessages = [];
    const telemetryRequests = [];
    
    // Listen for console messages related to telemetry
    page.on('console', msg => {
      if (msg.text().toLowerCase().includes('telemetry')) {
        telemetryMessages.push({
          type: msg.type(),
          text: msg.text()
        });
      }
    });
    
    // Track telemetry network requests
    page.on('request', request => {
      const url = request.url();
      if (url.includes('telemetry') || url.includes('collect')) {
        telemetryRequests.push({
          url,
          method: request.method(),
          headers: request.headers(),
          time: Date.now()
        });
      }
    });
    
    // Track telemetry responses
    page.on('response', response => {
      const url = response.url();
      if (url.includes('telemetry') || url.includes('collect')) {
        const request = telemetryRequests.find(r => r.url === url);
        if (request) {
          request.status = response.status();
          request.responseTime = Date.now();
          request.duration = request.responseTime - request.time;
        }
      }
    });
    
    // Navigate to home page
    await page.goto('/');
    
    // Wait for telemetry to initialize and send initial pageview
    await page.waitForTimeout(2000);
    
    // Print telemetry information for debugging
    console.log('Telemetry messages:', telemetryMessages);
    console.log('Telemetry requests:', telemetryRequests);
    
    // Check if telemetry was initialized
    const telemetryInitialized = telemetryMessages.some(msg => 
      msg.text.includes('initialized') || msg.text.includes('init')
    );
    
    expect(telemetryInitialized, 'Telemetry not initialized').toBeTruthy();
    
    // Check if a page_view event was sent
    const pageViewSent = telemetryMessages.some(msg => 
      msg.text.includes('page_view') || msg.text.includes('pageview')
    );
    
    expect(pageViewSent, 'No page_view event was sent').toBeTruthy();
    
    // Check that telemetry requests were actually made
    expect(telemetryRequests.length, 'No telemetry network requests detected').toBeGreaterThan(0);
    
    // Check that telemetry requests were successful
    const failedRequests = telemetryRequests.filter(req => req.status && req.status >= 400);
    expect(failedRequests, 'Failed telemetry requests detected').toEqual([]);
  });
  
  test('checks markup validity', async ({ page }) => {
    // Navigate to home page
    await page.goto('/');
    
    // Wait for everything to load
    await page.waitForLoadState('networkidle');
    
    // Check for common HTML validation issues
    
    // 1. Check for duplicate IDs
    const duplicateIds = await page.evaluate(() => {
      const ids = {};
      const duplicates = [];
      document.querySelectorAll('[id]').forEach(el => {
        const id = el.getAttribute('id');
        if (ids[id]) {
          duplicates.push(id);
        } else {
          ids[id] = true;
        }
      });
      return duplicates;
    });
    
    console.log('Duplicate IDs found:', duplicateIds);
    expect(duplicateIds, 'Duplicate ID attributes found').toEqual([]);
    
    // 2. Check for missing alt attributes on images
    const imagesWithoutAlt = await page.evaluate(() => {
      const images = [];
      document.querySelectorAll('img').forEach(img => {
        if (!img.hasAttribute('alt')) {
          images.push({
            src: img.getAttribute('src'),
            parent: img.parentElement?.tagName
          });
        }
      });
      return images;
    });
    
    console.log('Images without alt attributes:', imagesWithoutAlt);
    expect(imagesWithoutAlt.length, 'Images missing alt attributes').toBe(0);
    
    // 3. Check for empty links
    const emptyLinks = await page.evaluate(() => {
      const links = [];
      document.querySelectorAll('a').forEach(a => {
        const href = a.getAttribute('href') || '';
        // Skip social media links and those with images or aria-labels
        const isSocialLink = /github|linkedin|twitter|facebook|instagram|mailto:|tel:/.test(href);
        const hasImage = a.querySelector('img, svg') !== null;
        const hasAriaLabel = a.hasAttribute('aria-label');
        const isIcon = a.classList.contains('social-icons') || 
                      a.parentElement?.classList.contains('social-icons') ||
                      a.closest('.social-icons, .social') !== null;
        
        if (!a.textContent.trim() && 
            !hasImage && 
            !hasAriaLabel && 
            !isSocialLink &&
            !isIcon)
        {
          links.push({
            href: href,
            parent: a.parentElement?.tagName
          });
        }
      });
      return links;
    });
    
    console.log('Empty links found:', emptyLinks);
    expect(emptyLinks, 'Empty links without text or images').toEqual([]);
    
    // 4. Check for broken href attributes
    const brokenHrefs = await page.evaluate(() => {
      const hrefs = [];
      document.querySelectorAll('a[href]').forEach(a => {
        const href = a.getAttribute('href');
        if (href === '#' || href === '') {
          hrefs.push({
            text: a.textContent.trim(),
            parent: a.parentElement?.tagName
          });
        }
      });
      return hrefs;
    });
    
    console.log('Links with empty/placeholder hrefs:', brokenHrefs);
    
    // 5. Check required telemetry script attributes
    const telemetryScriptAttributes = await page.evaluate(() => {
      const scripts = document.querySelectorAll('script[src*="telemetry"]');
      return Array.from(scripts).map(script => {
        const src = script.getAttribute('src');
        const hasAsync = script.hasAttribute('async');
        const hasDeferAttribute = script.hasAttribute('defer');
        const hasType = script.hasAttribute('type');
        
        return {
          src,
          hasAsync,
          hasDeferAttribute,
          hasType,
          type: script.getAttribute('type')
        };
      });
    });
    
    console.log('Telemetry script attributes:', telemetryScriptAttributes);
    
    // Verify telemetry scripts have proper attributes
    const properlyConfiguredScripts = telemetryScriptAttributes.filter(
      script => script.hasAsync || script.hasDeferAttribute
    );
    
    expect(properlyConfiguredScripts.length, 'Telemetry scripts missing async or defer attribute')
      .toBe(telemetryScriptAttributes.length);
  });
}); 