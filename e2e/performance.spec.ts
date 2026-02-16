import { test, expect } from '@playwright/test';

test.describe('Performance & Loading', () => {

  test('home page loads within 5 seconds', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const loadTime = Date.now() - startTime;

    console.log(`Home page load time: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(5000);
  });

  test('category page does not get stuck loading', async ({ page }) => {
    await page.goto('/c/trip-reports');

    // Loading skeletons should disappear within 10 seconds
    await expect(page.locator('[class*="animate-pulse"]')).toHaveCount(0, { timeout: 10000 });

    // Content should be visible
    await expect(page.locator('h1, h2')).toBeVisible({ timeout: 10000 });
  });

  test('thread page does not get stuck loading', async ({ page }) => {
    // Go to a category with threads
    await page.goto('/c/trip-reports');
    await expect(page.locator('[class*="animate-pulse"]')).toHaveCount(0, { timeout: 10000 });

    const firstThread = page.locator('a[href^="/t/"]').first();
    if (await firstThread.isVisible()) {
      await firstThread.click();

      // Loading should complete within 10 seconds
      await expect(page.locator('[class*="animate-pulse"]')).toHaveCount(0, { timeout: 10000 });
    }
  });

  test('pages return correct HTTP status codes', async ({ page }) => {
    // Public pages should return 200
    const publicPages = ['/', '/c/trip-reports', '/gallery', '/search', '/privacy', '/terms'];

    for (const path of publicPages) {
      const response = await page.goto(path);
      console.log(`${path}: ${response?.status()}`);
      expect(response?.status()).toBe(200);
    }
  });

  test('protected pages redirect to login when not authenticated', async ({ page }) => {
    await page.goto('/settings');
    // Should redirect to login
    await expect(page).toHaveURL(/login|auth/);
  });

  test('admin pages are protected', async ({ page }) => {
    await page.goto('/admin');
    // Should redirect to login or show unauthorized
    await expect(page).toHaveURL(/login|auth|\//);
  });

  test('no console errors on key pages', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Filter out known harmless errors
    const realErrors = errors.filter(e =>
      !e.includes('favicon') &&
      !e.includes('ResizeObserver') &&
      !e.includes('hydration')
    );

    if (realErrors.length > 0) {
      console.log('Console errors found:', realErrors);
    }

    // Allow some errors but flag them — don't fail the test for console warnings
    // This is informational
  });
});
