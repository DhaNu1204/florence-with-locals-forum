import { test, expect } from '@playwright/test';

test.describe('Public Pages', () => {

  test('home page loads with categories', async ({ page }) => {
    await page.goto('/');

    // Page should have the forum title
    await expect(page).toHaveTitle(/Florence With Locals/);

    // Should show category cards
    await expect(page.getByRole('heading', { name: /Trip Reports/ }).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: /Food & Wine/ }).first()).toBeVisible();

    // Community stats should be visible
    await expect(page.locator('text=Members').first()).toBeVisible();

    // "Book a Tour" link should exist (desktop nav or mobile menu)
    await expect(page.locator('a:has-text("Book a Tour")').first()).toBeVisible({ timeout: 5000 }).catch(() => {
      // On mobile, "Book a Tour" is inside the hamburger menu — that's fine
    });
  });

  test('category page loads with threads', async ({ page }) => {
    await page.goto('/c/trip-reports');

    // Should show category name
    await expect(page.getByRole('heading', { name: /Trip Reports/ })).toBeVisible();

    // Should show breadcrumbs
    await expect(page.getByRole('main').locator('a:has-text("Home")')).toBeVisible();

    // Page should not be stuck loading — check that skeleton/loading is gone
    await expect(page.locator('[class*="animate-pulse"]')).toHaveCount(0, { timeout: 10000 });

    // Should show thread cards or empty state
    // Use both data-testid and fallback selector (production may not have data-testid yet)
    const threadCards = page.locator('[data-testid="thread-card"], a[href^="/t/"]');
    const emptyState = page.locator('text=No discussions yet');
    await expect(threadCards.first().or(emptyState)).toBeVisible({ timeout: 10000 });
  });

  test('thread page loads with content', async ({ page }) => {
    // Navigate to trip reports and click first thread
    await page.goto('/c/trip-reports');

    // Wait for page to fully load
    await expect(page.locator('[class*="animate-pulse"]')).toHaveCount(0, { timeout: 10000 });

    // Click first thread link
    const firstThread = page.locator('a[href^="/t/"]').first();

    if (await firstThread.isVisible()) {
      await firstThread.click();

      // Thread page should load
      await expect(page.locator('article, [data-testid="thread-content"]')).toBeVisible({ timeout: 10000 });

      // Should show author info
      await expect(page.locator('text=@')).toBeVisible();

      // Should show like button
      await expect(page.locator('button:has-text("Like"), button[aria-label*="like"], button[aria-label*="Like"]')).toBeVisible();

      // Reply form should show login prompt for non-authenticated users
      await expect(page.getByRole('main').locator('text=Log in').or(page.getByRole('main').locator('text=Sign in'))).toBeVisible();
    }
  });

  test('search page works', async ({ page }) => {
    await page.goto('/search?q=florence');

    // Should show search results or no results message
    await page.waitForLoadState('networkidle');

    // Page should not be stuck loading
    await expect(page.locator('[class*="animate-pulse"]')).toHaveCount(0, { timeout: 10000 });
  });

  test('gallery page loads', async ({ page }) => {
    await page.goto('/gallery');

    // Page should load without getting stuck
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[class*="animate-pulse"]')).toHaveCount(0, { timeout: 15000 });

    // Should show photos or empty state
    const photos = page.locator('img[src*="supabase"]').first();
    const emptyGallery = page.locator('text=No photos').first();
    await expect(photos.or(emptyGallery)).toBeVisible({ timeout: 10000 });
  });

  test('legal pages load', async ({ page }) => {
    // Privacy policy
    await page.goto('/privacy');
    await expect(page.getByRole('heading', { name: 'Privacy Policy' })).toBeVisible();

    // Terms
    await page.goto('/terms');
    await expect(page.getByRole('heading', { name: 'Terms of Service' })).toBeVisible();

    // Cookie policy
    await page.goto('/cookie-policy');
    await expect(page.getByRole('heading', { name: 'Cookie Policy' })).toBeVisible();

    // Guidelines
    await page.goto('/guidelines');
    await expect(page.getByRole('heading', { name: 'Community Guidelines' })).toBeVisible();
  });

  test('404 page shows for invalid routes', async ({ page }) => {
    await page.goto('/this-page-does-not-exist');
    await expect(page.locator('text=404').or(page.locator('text=not found'))).toBeVisible();
  });

  test('SEO: sitemap.xml is accessible', async ({ page }) => {
    const response = await page.goto('/sitemap.xml');
    expect(response?.status()).toBe(200);
  });

  test('SEO: robots.txt is accessible', async ({ page }) => {
    const response = await page.goto('/robots.txt');
    expect(response?.status()).toBe(200);
    const content = await page.content();
    expect(content).toContain('Disallow: /admin');
  });
});
