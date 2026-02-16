import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {

  test('navbar links work', async ({ page }, testInfo) => {
    // Desktop nav links are hidden on mobile — skip
    test.skip(testInfo.project.name === 'mobile', 'Desktop nav only');
    await page.goto('/');

    // Categories dropdown
    const categoriesButton = page.locator('header button:has-text("Categories")');
    if (await categoriesButton.isVisible()) {
      await categoriesButton.click();
      await expect(page.locator('text=Trip Reports').first()).toBeVisible();
    }

    // Close categories dropdown before opening explore
    await page.keyboard.press('Escape');

    // Explore dropdown
    const exploreButton = page.locator('header button:has-text("Explore")');
    if (await exploreButton.isVisible()) {
      await exploreButton.click();
      await expect(page.locator('text=Tourist Info').first()).toBeVisible();
    }

    // Close explore dropdown before clicking gallery
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    // Gallery link
    const galleryLink = page.locator('header a:has-text("Gallery")');
    await galleryLink.click({ force: true });
    await expect(page).toHaveURL(/gallery/);
  });

  test('breadcrumb navigation works', async ({ page }) => {
    await page.goto('/c/trip-reports');

    // Click Home breadcrumb (in main content area, not navbar)
    await page.getByRole('main').locator('a:has-text("Home")').click();
    await expect(page).toHaveURL('/');
  });

  test('category card navigation works', async ({ page }) => {
    await page.goto('/');

    // Click a category card
    const categoryLink = page.locator('a[href^="/c/"]').first();
    if (await categoryLink.isVisible()) {
      await categoryLink.click();
      await expect(page).toHaveURL(/\/c\//);
    }
  });

  test('footer links work', async ({ page }) => {
    await page.goto('/');

    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Check footer links exist
    await expect(page.locator('footer a:has-text("Privacy")').first()).toBeVisible();
    await expect(page.locator('footer a:has-text("Terms")').first()).toBeVisible();
  });
});
