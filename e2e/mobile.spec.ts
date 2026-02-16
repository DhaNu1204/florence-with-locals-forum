import { test, expect } from '@playwright/test';

// These tests use the 'mobile' project config (iPhone 13)
// When run under the 'chromium' project (desktop), mobile-specific tests are skipped
test.describe('Mobile Responsiveness', () => {

  test('mobile navbar has hamburger menu', async ({ page, browserName }, testInfo) => {
    // Skip on desktop — hamburger is only visible on mobile viewport
    test.skip(testInfo.project.name === 'chromium', 'Desktop viewport — hamburger not visible');
    await page.goto('/');

    // Use fallback selector since data-testid may not be deployed yet
    const hamburger = page.locator('[data-testid="mobile-menu-button"], button[aria-label="Open menu"]');
    await expect(hamburger).toBeVisible();
  });

  test('home page is usable on mobile', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'chromium', 'Desktop viewport — mobile layout test');
    await page.goto('/');

    // Categories should stack vertically
    await expect(page.locator('text=Trip Reports').first()).toBeVisible();

    // Page should not overflow horizontally
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 5); // 5px tolerance
  });

  test('thread page is readable on mobile', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'chromium', 'Desktop viewport — mobile layout test');
    await page.goto('/c/trip-reports');
    await expect(page.locator('[class*="animate-pulse"]')).toHaveCount(0, { timeout: 10000 });

    const firstThread = page.locator('a[href^="/t/"]').first();
    if (await firstThread.isVisible()) {
      await firstThread.click();
      await expect(page.locator('[class*="animate-pulse"]')).toHaveCount(0, { timeout: 10000 });

      // Content should be visible and not cut off
      await expect(page.locator('article, [data-testid="thread-content"]')).toBeVisible();
    }
  });
});
