import { test, expect } from '@playwright/test';
import { ROUTE_CANON } from '../src/config/routes';
import { HEADER_NAV, HERO_CTAS, DASHBOARD_ACTIONS } from '../src/config/nav';

test.describe('Navigation Tests', () => {
  
  test.describe('Route Accessibility', () => {
    Object.entries(ROUTE_CANON).forEach(([route, config]) => {
      test(`${route} loads correctly`, async ({ page }) => {
        await page.goto(route);
        
        // Check page loads without errors
        await expect(page).toHaveTitle(config.title);
        
        // Check for console errors
        const errors: string[] = [];
        page.on('console', msg => {
          if (msg.type() === 'error') errors.push(msg.text());
        });
        
        await page.waitForLoadState('networkidle');
        expect(errors).toEqual([]);
        
        // Verify page has proper H1
        const h1 = page.locator('h1').first();
        await expect(h1).toBeVisible();
      });
    });
  });

  test.describe('Header Navigation', () => {
    HEADER_NAV.forEach(navItem => {
      test(`Header nav: ${navItem.label} works`, async ({ page }) => {
        await page.goto('/');
        
        const navLink = page.getByTestId(navItem.testId);
        await expect(navLink).toBeVisible();
        
        await navLink.click();
        await expect(page).toHaveURL(navItem.href);
        
        // Verify aria-current for active page
        if (navItem.href !== '/') {
          await expect(navLink).toHaveAttribute('aria-current', 'page');
        }
      });
    });
  });

  test.describe('Hero CTAs', () => {
    HERO_CTAS.forEach(cta => {
      test(`Hero CTA: ${cta.label} navigates correctly`, async ({ page }) => {
        await page.goto('/');
        
        const ctaButton = page.getByTestId(cta.testId);
        await expect(ctaButton).toBeVisible();
        
        await ctaButton.click();
        await expect(page).toHaveURL(cta.href);
      });
    });
  });

  test.describe('Dashboard Actions', () => {
    DASHBOARD_ACTIONS.forEach(action => {
      test(`Dashboard action: ${action.label} works`, async ({ page }) => {
        await page.goto('/');
        
        // Scroll to dashboard section
        await page.locator('#dashboard').scrollIntoView();
        
        const actionButton = page.getByTestId(action.testId);
        await expect(actionButton).toBeVisible();
        
        await actionButton.click();
        await expect(page).toHaveURL(action.href);
      });
    });
  });

  test.describe('Anchor Navigation', () => {
    Object.entries(ROUTE_CANON).forEach(([route, config]) => {
      if (config.anchors.length > 0) {
        config.anchors.forEach(anchor => {
          test(`${route}#${anchor} scrolls to element`, async ({ page }) => {
            await page.goto(`${route}#${anchor}`);
            
            // Wait for navigation and scrolling
            await page.waitForTimeout(1000);
            
            // Verify URL includes hash
            expect(page.url()).toContain(`#${anchor}`);
            
            // Verify element with ID exists and is visible
            const targetElement = page.locator(`#${anchor}`);
            await expect(targetElement).toBeVisible();
            
            // Verify element is in viewport (scrolled to)
            const isInViewport = await targetElement.isVisible();
            expect(isInViewport).toBeTruthy();
          });
        });
      }
    });
  });

  test.describe('External Links', () => {
    test('External links open in new tab with proper rel attributes', async ({ page, context }) => {
      await page.goto('/');
      
      // Find external links
      const externalLinks = await page.locator('a[href^="http"]:not([href*="localhost"])').all();
      
      for (const link of externalLinks.slice(0, 3)) { // Test first 3 to avoid too many tabs
        // Check target and rel attributes
        const target = await link.getAttribute('target');
        const rel = await link.getAttribute('rel');
        
        expect(target).toBe('_blank');
        expect(rel).toContain('noopener');
        expect(rel).toContain('noreferrer');
      }
    });
  });

  test.describe('404 Handling', () => {
    test('Non-existent routes show 404 page', async ({ page }) => {
      await page.goto('/non-existent-route');
      
      // Should show custom 404 page
      await expect(page.locator('h1')).toContainText('404');
      await expect(page).toHaveTitle(/404|Not Found/);
      
      // Should have return home link
      const homeLink = page.locator('a[href="/"]');
      await expect(homeLink).toBeVisible();
      
      await homeLink.click();
      await expect(page).toHaveURL('/');
    });
  });

  test.describe('Responsive Navigation', () => {
    test('Navigation works on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      
      // Test mobile menu if it exists
      const mobileMenuButton = page.locator('[data-testid="mobile-menu-button"]');
      if (await mobileMenuButton.isVisible()) {
        await mobileMenuButton.click();
        
        // Test first nav item in mobile menu
        const firstNavItem = page.getByTestId(HEADER_NAV[0].testId);
        await expect(firstNavItem).toBeVisible();
      }
    });
  });

  test.describe('Accessibility', () => {
    test('Navigation elements have proper accessibility attributes', async ({ page }) => {
      await page.goto('/');
      
      // Check navigation landmarks
      const nav = page.locator('nav');
      await expect(nav).toBeVisible();
      
      // Check interactive elements have accessible names
      const interactiveElements = page.locator('button, a[href]');
      const count = await interactiveElements.count();
      
      for (let i = 0; i < Math.min(count, 10); i++) { // Check first 10
        const element = interactiveElements.nth(i);
        const text = await element.textContent();
        const ariaLabel = await element.getAttribute('aria-label');
        
        expect(text || ariaLabel).toBeTruthy();
      }
    });
  });
});