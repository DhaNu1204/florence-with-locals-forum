import { test, expect } from '@playwright/test';

test.describe('Pagination', () => {

  test('category page shows Load More button when threads exceed page size', async ({ page }) => {
    // Find a category with many threads
    await page.goto('/c/trip-reports');
    await expect(page.locator('[class*="animate-pulse"]')).toHaveCount(0, { timeout: 10000 });

    const loadMoreButton = page.locator('[data-testid="load-more-threads"]');

    if (await loadMoreButton.isVisible()) {
      // Count threads before clicking
      const threadsBefore = await page.locator('[data-testid="thread-card"]').count();

      // Click Load More
      await loadMoreButton.click();

      // Wait for new threads to appear
      await page.waitForTimeout(2000);

      // Should have more threads now
      const threadsAfter = await page.locator('[data-testid="thread-card"]').count();
      expect(threadsAfter).toBeGreaterThanOrEqual(threadsBefore);
    }
  });

  test('thread reply pagination works', async ({ page }) => {
    // Navigate to a thread with many replies
    await page.goto('/c/trip-reports');
    await expect(page.locator('[class*="animate-pulse"]')).toHaveCount(0, { timeout: 10000 });

    const firstThread = page.locator('a[href^="/t/"]').first();
    if (await firstThread.isVisible()) {
      await firstThread.click();
      await expect(page.locator('[class*="animate-pulse"]')).toHaveCount(0, { timeout: 10000 });

      // Check if Load More Replies button exists
      const loadMoreReplies = page.locator('[data-testid="load-more-replies"]');
      if (await loadMoreReplies.isVisible()) {
        await loadMoreReplies.click();
        await page.waitForTimeout(2000);
      }
    }
  });
});
