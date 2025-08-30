import { test, expect } from '@playwright/test';
import { ROUTE_CANON } from '../src/config/routes';

test.describe('Smoke Tests', () => {
  
  test.describe('Page Load Performance', () => {
    Object.entries(ROUTE_CANON).forEach(([route, config]) => {
      test(`${route} loads within performance budget`, async ({ page }) => {
        // Start timing
        const start = Date.now();
        
        await page.goto(route, { waitUntil: 'networkidle' });
        
        const loadTime = Date.now() - start;
        
        // Basic performance budget check (3 second LCP equivalent)
        expect(loadTime).toBeLessThan(3000);
        
        // Verify page loaded successfully
        await expect(page).toHaveTitle(config.title);
        
        // Check no 404 assets
        const failed404s = await page.evaluate(() => {
          const resources = performance.getEntriesByType('resource');
          return resources.filter((r: any) => r.responseStatus === 404).length;
        });
        
        expect(failed404s).toBe(0);
      });
    });
  });

  test.describe('Console Error Monitoring', () => {
    Object.entries(ROUTE_CANON).forEach(([route, config]) => {
      test(`${route} has no severe console errors`, async ({ page }) => {
        const consoleErrors: string[] = [];
        const networkErrors: string[] = [];
        
        // Monitor console errors
        page.on('console', msg => {
          if (msg.type() === 'error') {
            consoleErrors.push(msg.text());
          }
        });
        
        // Monitor network failures
        page.on('response', response => {
          if (response.status() >= 400) {
            networkErrors.push(`${response.status()}: ${response.url()}`);
          }
        });
        
        await page.goto(route);
        await page.waitForLoadState('networkidle');
        
        // Filter out known non-critical errors
        const criticalErrors = consoleErrors.filter(error => 
          !error.includes('favicon.ico') &&
          !error.includes('manifest.json') &&
          !error.includes('service-worker') &&
          !error.toLowerCase().includes('warning')
        );
        
        const criticalNetworkErrors = networkErrors.filter(error =>
          !error.includes('favicon.ico') &&
          !error.includes('manifest.json')
        );
        
        expect(criticalErrors).toEqual([]);
        expect(criticalNetworkErrors).toEqual([]);
      });
    });
  });

  test.describe('Mobile Viewport Tests', () => {
    const mobileViewports = [
      { width: 375, height: 667, name: 'iPhone SE' },
      { width: 414, height: 896, name: 'iPhone XR' },
      { width: 360, height: 740, name: 'Galaxy S20' }
    ];

    mobileViewports.forEach(viewport => {
      test(`Core routes work on ${viewport.name}`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        
        // Test core routes only on mobile to keep tests fast
        const coreRoutes = ['/', '/intelligence', '/auth'];
        
        for (const route of coreRoutes) {
          await page.goto(route);
          
          // Basic load check
          await page.waitForLoadState('domcontentloaded');
          
          // Verify no horizontal scroll (responsive design)
          const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
          expect(bodyWidth).toBeLessThanOrEqual(viewport.width + 1); // +1 for rounding
          
          // Verify main content is visible
          const mainContent = page.locator('main, [role="main"], .main-content').first();
          if (await mainContent.count() > 0) {
            await expect(mainContent).toBeVisible();
          }
        }
      });
    });
  });

  test.describe('Critical Path Validation', () => {
    test('User can navigate through critical user journey', async ({ page }) => {
      // Start at home
      await page.goto('/');
      await expect(page).toHaveTitle(ROUTE_CANON['/'].title);
      
      // Navigate to intelligence dashboard  
      await page.getByTestId('nav-intelligence').click();
      await expect(page).toHaveURL('/intelligence');
      
      // Navigate to auth if not authenticated
      await page.getByTestId('cta-get-started').click();
      await expect(page).toHaveURL('/auth');
      
      // Return home
      await page.goto('/');
      await expect(page).toHaveURL('/');
    });
  });

  test.describe('SEO & Meta Tags', () => {
    Object.entries(ROUTE_CANON).forEach(([route, config]) => {
      test(`${route} has proper SEO meta tags`, async ({ page }) => {
        await page.goto(route);
        
        // Verify title
        await expect(page).toHaveTitle(config.title);
        
        // Verify meta description exists
        const metaDescription = page.locator('meta[name="description"]');
        const description = await metaDescription.getAttribute('content');
        expect(description).toBeTruthy();
        expect(description!.length).toBeGreaterThan(50);
        expect(description!.length).toBeLessThan(160);
        
        // Verify viewport meta tag
        const viewport = page.locator('meta[name="viewport"]');
        await expect(viewport).toHaveAttribute('content', /width=device-width/);
        
        // Verify canonical URL structure if applicable
        const canonical = page.locator('link[rel="canonical"]');
        if (await canonical.count() > 0) {
          const href = await canonical.getAttribute('href');
          expect(href).toContain(route === '/' ? '' : route);
        }
      });
    });
  });

  test.describe('Core Functionality Smoke Test', () => {
    test('Interactive elements respond correctly', async ({ page }) => {
      await page.goto('/');
      
      // Test buttons respond to hover/focus
      const buttons = page.locator('button');
      const firstButton = buttons.first();
      
      if (await firstButton.count() > 0) {
        // Focus test
        await firstButton.focus();
        await expect(firstButton).toBeFocused();
        
        // Hover state test (visual regression would be better but this ensures no JS errors)
        await firstButton.hover();
      }
      
      // Test form inputs if they exist
      const inputs = page.locator('input');
      const firstInput = inputs.first();
      
      if (await firstInput.count() > 0) {
        await firstInput.click();
        await expect(firstInput).toBeFocused();
      }
    });
  });
});
